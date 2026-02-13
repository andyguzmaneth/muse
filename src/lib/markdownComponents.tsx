import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Components } from "react-markdown";

const codeBlockStyle = {
  borderRadius: "0.75rem",
  fontSize: "0.8rem",
  margin: "0.5rem 0",
  border: "1px solid #e5e3de",
  background: "#faf9f7",
};

export const sharedMarkdownCodeComponent: Components["code"] = function Code({
  className,
  children,
  ...rest
}) {
  const match = /language-(\w+)/.exec(className || "");
  const codeString = String(children).replace(/\n$/, "");

  if (match) {
    return (
      <SyntaxHighlighter
        style={oneLight}
        language={match[1]}
        PreTag="div"
        customStyle={codeBlockStyle}
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
};

/** Table components for chat bubbles (inline styles). */
export const chatMarkdownTableComponents: Pick<
  Components,
  "table" | "th" | "td"
> = {
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
};

/** Minimal table components for md-viewer (styling via .md-viewer CSS). */
export const viewerMarkdownTableComponents: Pick<
  Components,
  "table" | "th" | "td"
> = {
  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table>{children}</table>
      </div>
    );
  },
  th({ children }) {
    return <th>{children}</th>;
  },
  td({ children }) {
    return <td>{children}</td>;
  },
};
