import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { readTextFile } from "@tauri-apps/plugin-fs";
import {
  sharedMarkdownCodeComponent,
  viewerMarkdownTableComponents,
} from "../lib/markdownComponents";

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
        if (!cancelled) setContent(text);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
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
      <article className="md-viewer prose prose-sm prose-muse max-w-3xl mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code: sharedMarkdownCodeComponent,
            ...viewerMarkdownTableComponents,
          }}
        >
          {content ?? ""}
        </ReactMarkdown>
      </article>
    </div>
  );
}
