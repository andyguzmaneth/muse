import { useEffect, useCallback, useRef } from "react";
import { sidecar } from "../lib/sidecar";
import { useStore } from "../stores/store";

export function useClaude(sessionId: string | null) {
  const addMessage = useStore((s) => s.addMessage);
  const appendToLastMessage = useStore((s) => s.appendToLastMessage);
  const setStreaming = useStore((s) => s.setStreaming);
  const addCost = useStore((s) => s.addCost);
  const isStreamingRef = useRef(false);

  useEffect(() => {
    if (!sessionId) return;

    const unsub = sidecar.onMessage((msg) => {
      if ("sessionId" in msg && msg.sessionId !== sessionId) return;

      switch (msg.type) {
        case "stream_start":
          isStreamingRef.current = true;
          setStreaming(sessionId, true);
          addMessage(sessionId, {
            id: `msg-${Date.now()}`,
            role: "assistant",
            content: "",
            timestamp: Date.now(),
          });
          break;

        case "stream_delta":
          if (isStreamingRef.current) {
            appendToLastMessage(sessionId, msg.text);
          }
          break;

        case "stream_end":
          isStreamingRef.current = false;
          setStreaming(sessionId, false);
          if (msg.costUsd > 0) {
            addCost(sessionId, msg.costUsd);
          }
          break;

        case "error":
          isStreamingRef.current = false;
          setStreaming(sessionId, false);
          addMessage(sessionId, {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `Error: ${msg.error}`,
            timestamp: Date.now(),
          });
          break;
      }
    });

    return unsub;
  }, [sessionId, addMessage, appendToLastMessage, setStreaming, addCost]);

  const sendMessage = useCallback(
    async (text: string, displayContent?: string) => {
      if (!sessionId) return;
      const store = useStore.getState();
      const session = store.sessions[sessionId];
      if (!session) return;

      try {
        await sidecar.start();
        store.setSidecarError(null);
      } catch (err) {
        store.setSidecarError(err instanceof Error ? err.message : String(err));
        throw err;
      }

      await sidecar.createSession(sessionId, session.cwd);
      const messageToSend = store.respondInSpanish
        ? `Responde en español.\n\n${text}`
        : text;

      addMessage(sessionId, {
        id: `msg-${Date.now()}`,
        role: "user",
        content: displayContent ?? text,
        timestamp: Date.now(),
      });

      await sidecar.sendMessage(sessionId, messageToSend);
    },
    [sessionId, addMessage],
  );

  const abort = useCallback(async () => {
    if (!sessionId) return;
    await sidecar.abort(sessionId);
  }, [sessionId]);

  return { sendMessage, abort };
}
