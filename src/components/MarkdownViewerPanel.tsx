import { useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import {
  sharedMarkdownCodeComponent,
  viewerMarkdownTableComponents,
} from "../lib/markdownComponents";

interface Props {
  filePath: string;
}

export function MarkdownViewerPanel({ filePath }: Props) {
  const [content, setContent] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadFile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const text = await readTextFile(filePath);
      setContent(text);
      setEditedContent(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [filePath]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const handleSave = useCallback(async () => {
    if (editedContent == null) return;
    setSaving(true);
    try {
      await writeTextFile(filePath, editedContent);
      setContent(editedContent);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }, [filePath, editedContent]);

  const handleRevert = useCallback(() => {
    setEditedContent(content ?? "");
    setIsEditing(false);
  }, [content]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-text-muted text-sm">
        Cargando…
      </div>
    );
  }

  if (error && content == null) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <p className="text-sm text-red-600 dark:text-red-400">No se pudo leer el archivo</p>
        <p className="mt-1 text-xs text-text-muted">{error}</p>
      </div>
    );
  }

  const hasChanges = isEditing && editedContent !== content;

  return (
    <div className="h-full flex flex-col bg-bg">
      <div className="flex items-center gap-2 border-b border-border-light bg-bg-secondary px-4 py-2 flex-shrink-0">
        <button
          type="button"
          onClick={() => setIsEditing((e) => !e)}
          className="text-xs text-text-muted hover:text-text transition-colors"
        >
          {isEditing ? "Vista previa" : "Editar"}
        </button>
        {isEditing && (
          <>
            <button
              type="button"
              onClick={handleRevert}
              disabled={!hasChanges}
              className="text-xs text-text-muted hover:text-text transition-colors disabled:opacity-50"
            >
              Deshacer
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className="text-xs text-accent hover:text-accent-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">
        {isEditing ? (
          <textarea
            value={editedContent ?? ""}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full min-h-[300px] rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text font-mono resize-none focus:border-accent focus:outline-none"
            spellCheck={false}
          />
        ) : (
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
        )}
      </div>
    </div>
  );
}
