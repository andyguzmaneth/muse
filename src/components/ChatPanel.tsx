import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useClaude } from "../hooks/useClaude";
import { useStore } from "../stores/store";

interface Props {
  sessionId: string;
}

export function ChatPanel({ sessionId }: Props) {
  const session = useStore((s) => s.sessions[sessionId]);
  const { sendMessage, abort } = useClaude(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length, session?.messages[session.messages.length - 1]?.content]);

  if (!session) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        Session not found
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {session.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-text-muted">
            <div className="text-4xl mb-4">&#9672;</div>
            <p className="text-lg font-medium mb-1">Muse</p>
            <p className="text-sm">Start a conversation with Claude</p>
          </div>
        ) : (
          session.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onAbort={abort}
        isStreaming={session.isStreaming}
      />

      {/* Cost indicator */}
      {session.totalCost > 0 && (
        <div className="border-t border-border bg-bg-secondary px-4 py-1 text-xs text-text-muted text-right">
          Cost: ${session.totalCost.toFixed(4)}
        </div>
      )}
    </div>
  );
}
