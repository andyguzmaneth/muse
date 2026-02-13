import { Child, Command } from "@tauri-apps/plugin-shell";
import { invoke } from "@tauri-apps/api/core";

type OutboundMessage =
  | { type: "session_created"; id: string }
  | { type: "stream_start"; sessionId: string }
  | { type: "stream_delta"; sessionId: string; text: string }
  | {
      type: "stream_end";
      sessionId: string;
      fullText: string;
      costUsd: number;
    }
  | { type: "error"; sessionId?: string; error: string }
  | { type: "ready" };

type MessageHandler = (msg: OutboundMessage) => void;

class SidecarBridge {
  private child: Child | null = null;
  private handlers: MessageHandler[] = [];
  private ready = false;
  private readyPromise: Promise<void>;
  private resolveReady: (() => void) | null = null;
  private rejectReady: ((err: Error) => void) | null = null;
  private buffer = "";

  constructor() {
    this.readyPromise = new Promise((resolve, reject) => {
      this.resolveReady = resolve;
      this.rejectReady = reject;
    });
  }

  async start(): Promise<void> {
    // Get the app directory from Rust to resolve sidecar path
    const projectDir = await invoke<string>("get_project_dir");
    const sidecarScript = `${projectDir}/sidecar/dist/index.js`;

    console.log("[sidecar] Starting:", sidecarScript);

    const cmd = Command.create("node", [sidecarScript]);

    cmd.stdout.on("data", (line: string) => {
      this.buffer += line;
      const lines = this.buffer.split("\n");
      this.buffer = lines.pop() ?? "";

      for (const l of lines) {
        const trimmed = l.trim();
        if (!trimmed) continue;
        try {
          const msg: OutboundMessage = JSON.parse(trimmed);
          if (msg.type === "ready") {
            this.ready = true;
            this.resolveReady?.();
          }
          this.handlers.forEach((h) => h(msg));
        } catch {
          console.warn("[sidecar] Non-JSON stdout:", trimmed);
        }
      }
    });

    cmd.stderr.on("data", (line: string) => {
      console.log("[sidecar stderr]", line);
    });

    cmd.on("error", (err: string) => {
      console.error("[sidecar error]", err);
      if (!this.ready) {
        this.rejectReady?.(new Error(`Sidecar failed: ${err}`));
      }
    });

    cmd.on("close", (data) => {
      console.log("[sidecar closed]", data);
      if (!this.ready) {
        this.rejectReady?.(new Error("Sidecar exited before ready"));
      }
      this.child = null;
      this.ready = false;
    });

    this.child = await cmd.spawn();

    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      if (!this.ready) {
        this.rejectReady?.(new Error("Sidecar startup timed out (10s)"));
      }
    }, 10_000);

    try {
      await this.readyPromise;
    } finally {
      clearTimeout(timeout);
    }
  }

  async send(msg: Record<string, unknown>): Promise<void> {
    if (!this.child) {
      throw new Error("Sidecar not started");
    }
    await this.child.write(JSON.stringify(msg) + "\n");
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }

  async createSession(id: string, cwd: string): Promise<void> {
    await this.send({ type: "create_session", id, cwd });
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    await this.send({ type: "send_message", sessionId, message });
  }

  async abort(sessionId: string): Promise<void> {
    await this.send({ type: "abort", sessionId });
  }

  async shutdown(): Promise<void> {
    await this.send({ type: "shutdown" });
  }

  isReady(): boolean {
    return this.ready;
  }
}

// Singleton
export const sidecar = new SidecarBridge();
