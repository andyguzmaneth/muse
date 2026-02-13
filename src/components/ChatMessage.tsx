import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatMessage as ChatMessageType } from "../stores/store";

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
                code({ className, children, ...rest }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const codeString = String(children).replace(/\n$/, "");

                  if (match) {
                    return (
                      <SyntaxHighlighter
                        style={oneLight}
                        language={match[1]}
                        PreTag="div"
                        customStyle={{
                          borderRadius: "0.75rem",
                          fontSize: "0.8rem",
                          margin: "0.5rem 0",
                          border: "1px solid #e5e3de",
                          background: "#faf9f7",
                        }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    );
                  }

                  return (
                    <code
                      className="rounded-md bg-surface px-1.5 py-0.5 text-xs text-text font-medium"
                      style={{ color: "#6b5b4e" }}
                      {...rest}
                    >
                      {children}
                    </code>
                  );
                },
                table({ children }) {
                  return (
                    <div className="overflow-x-auto my-2">
                      <table className="border-collapse border border-border text-sm">
                        {children}
                      </table>
                    </div>
                  );
                },
                th({ children }) {
                  return (
                    <th className="border border-border bg-surface px-3 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-text-muted">
                      {children}
                    </th>
                  );
                },
                td({ children }) {
                  return (
                    <td className="border border-border px-3 py-1.5">
                      {children}
                    </td>
                  );
                },
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
