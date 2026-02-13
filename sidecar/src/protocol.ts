// JSON-over-stdio message protocol between Tauri and the sidecar

// Inbound messages (from Tauri → sidecar)
export type InboundMessage =
  | { type: "create_session"; id: string; cwd: string; model?: string }
  | { type: "send_message"; sessionId: string; message: string }
  | { type: "abort"; sessionId: string }
  | { type: "shutdown" };

// Outbound messages (from sidecar → Tauri)
export type OutboundMessage =
  | { type: "session_created"; id: string }
  | { type: "stream_start"; sessionId: string }
  | {
      type: "stream_delta";
      sessionId: string;
      text: string;
    }
  | {
      type: "stream_end";
      sessionId: string;
      fullText: string;
      costUsd: number;
    }
  | { type: "error"; sessionId?: string; error: string }
  | { type: "ready" };
