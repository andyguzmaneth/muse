import { query } from "@anthropic-ai/claude-code";
import * as readline from "readline";
import type { InboundMessage, OutboundMessage } from "./protocol.js";

// Active sessions: sessionId → { abortController, conversationId }
const sessions = new Map<
  string,
  { abortController: AbortController | null; conversationId?: string }
>();

function send(msg: OutboundMessage) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

function log(msg: string) {
  process.stderr.write(`[muse-sidecar] ${msg}\n`);
}

async function handleCreateSession(
  id: string,
  cwd: string,
  model?: string,
) {
  sessions.set(id, { abortController: null });
  send({ type: "session_created", id });
  log(`Session created: ${id} (cwd: ${cwd})`);
}

async function handleSendMessage(sessionId: string, message: string) {
  const session = sessions.get(sessionId);
  if (!session) {
    send({ type: "error", sessionId, error: "Session not found" });
    return;
  }

  const abortController = new AbortController();
  session.abortController = abortController;

  send({ type: "stream_start", sessionId });

  let fullText = "";
  let costUsd = 0;

  try {
    const response = query({
      prompt: message,
      options: {
        abortController,
        cwd: getSessionCwd(sessionId),
        resume: session.conversationId,
        permissionMode: "bypassPermissions",
        maxTurns: 1,
      },
    });

    for await (const msg of response) {
      if (msg.type === "assistant") {
        for (const block of msg.message.content) {
          if (block.type === "text") {
            send({ type: "stream_delta", sessionId, text: block.text });
            fullText += block.text;
          }
        }
        // Save the session ID for resume
        if (msg.sessionId) {
          session.conversationId = msg.sessionId;
        }
      } else if (msg.type === "result") {
        costUsd = msg.total_cost_usd ?? 0;
        if (msg.sessionId) {
          session.conversationId = msg.sessionId;
        }
      }
    }

    send({ type: "stream_end", sessionId, fullText, costUsd });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("abort")) {
      send({ type: "stream_end", sessionId, fullText, costUsd: 0 });
    } else {
      send({ type: "error", sessionId, error: errorMsg });
    }
  } finally {
    session.abortController = null;
  }
}

function handleAbort(sessionId: string) {
  const session = sessions.get(sessionId);
  if (session?.abortController) {
    session.abortController.abort();
    log(`Aborted session: ${sessionId}`);
  }
}

// Track session CWDs
const sessionCwds = new Map<string, string>();

function getSessionCwd(sessionId: string): string {
  return sessionCwds.get(sessionId) ?? process.cwd();
}

function handleMessage(raw: string) {
  let msg: InboundMessage;
  try {
    msg = JSON.parse(raw);
  } catch {
    send({ type: "error", error: "Invalid JSON" });
    return;
  }

  switch (msg.type) {
    case "create_session":
      sessionCwds.set(msg.id, msg.cwd);
      handleCreateSession(msg.id, msg.cwd, msg.model);
      break;
    case "send_message":
      handleSendMessage(msg.sessionId, msg.message);
      break;
    case "abort":
      handleAbort(msg.sessionId);
      break;
    case "shutdown":
      log("Shutting down");
      process.exit(0);
  }
}

// Main: read newline-delimited JSON from stdin
const rl = readline.createInterface({ input: process.stdin });
rl.on("line", handleMessage);
rl.on("close", () => process.exit(0));

send({ type: "ready" });
log("Sidecar started, waiting for commands...");
