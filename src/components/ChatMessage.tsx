import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "../stores/store";
import {
  sharedMarkdownCodeComponent,
  chatMarkdownTableComponents,
} from "../lib/markdownComponents";

interface Props {
  message: ChatMessageType;
  onCopy?: (text: string) => void;
}

export function ChatMessage({ message, onCopy }: Props) {
  const isUser = message.role === "user";

  const handleCopy = () => {
    if (message.content && onCopy) {
      onCopy(message.content);
    } else if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-fade-in group/message`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-user-bubble text-user-bubble-text"
            : "bg-assistant-bubble text-text"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        ) : (
          <>
            <div className="prose prose-sm max-w-none prose-muse">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code: sharedMarkdownCodeComponent,
                  ...chatMarkdownTableComponents,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
            {message.content && (
              <button
                type="button"
                onClick={handleCopy}
                className="mt-2 text-xs text-text-muted hover:text-text transition-colors opacity-0 group-hover/message:opacity-100"
              >
                Copiar
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
