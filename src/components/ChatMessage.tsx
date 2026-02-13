import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage as ChatMessageType } from "../stores/store";
import {
  sharedMarkdownCodeComponent,
  chatMarkdownTableComponents,
} from "../lib/markdownComponents";

interface Props {
  message: ChatMessageType;
}

export function ChatMessage({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 animate-fade-in`}
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
        )}
      </div>
    </div>
  );
}
