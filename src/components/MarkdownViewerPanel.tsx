import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { readTextFile } from "@tauri-apps/plugin-fs";

interface Props {
  filePath: string;
}

export function MarkdownViewerPanel({ filePath }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const text = await readTextFile(filePath);
        if (!cancelled) {
          setContent(text);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [filePath]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-text-muted text-sm">
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">Could not read file</p>
        <p className="mt-1 text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-bg p-6">
      <article className="prose prose-sm max-w-none prose-headings:text-text prose-p:text-text prose-li:text-text prose-muse">
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
                <td className="border border-border px-3 py-1.5">{children}</td>
              );
            },
          }}
        >
          {content ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
