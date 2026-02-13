import { useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { BotanicalLeaf, BotanicalOlive } from "./Botanicals";
import { useClaude } from "../hooks/useClaude";
import { useStore } from "../stores/store";

interface Props {
  sessionId: string;
}

export function ChatPanel({ sessionId }: Props) {
  const session = useStore((s) => s.sessions[sessionId]);
  const { sendMessage, abort } = useClaude(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {session.messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center animate-fade-in">
            <BotanicalLeaf className="w-16 h-20 text-taupe-light mb-6" />
            <p className="font-display text-xl text-accent mb-2">
              Comienza una conversación
            </p>
            <BotanicalOlive className="w-32 h-12 text-border mt-1" />
          </div>
        ) : (
          session.messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))
        )}
        {session.isStreaming && session.messages[session.messages.length - 1]?.content === "" && (
          <div className="flex justify-start mb-3">
            <div className="rounded-2xl px-4 py-3 bg-assistant-bubble">
              <div className="flex gap-1.5 items-center py-1">
                <div className="w-1.5 h-1.5 rounded-full bg-taupe animate-gentle-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-taupe animate-gentle-pulse" style={{ animationDelay: "0.3s" }} />
                <div className="w-1.5 h-1.5 rounded-full bg-taupe animate-gentle-pulse" style={{ animationDelay: "0.6s" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onAbort={abort}
        isStreaming={session.isStreaming}
      />
    </div>
  );
}
