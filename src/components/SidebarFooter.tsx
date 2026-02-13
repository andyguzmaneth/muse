import { useEffect, useState } from "react";
import { readDir } from "@tauri-apps/plugin-fs";
import { useStore } from "../stores/store";
import { loadProjectContext } from "../lib/projectContext";
import { setStoredApiKey } from "../lib/layoutStorage";

export function SidebarFooter() {
  const rootDir = useStore((s) => s.rootDir);
  const apiKey = useStore((s) => s.apiKey);
  const setApiKey = useStore((s) => s.setApiKey);
  const respondInSpanish = useStore((s) => s.respondInSpanish);
  const setRespondInSpanish = useStore((s) => s.setRespondInSpanish);
  const setOpenMarkdownPath = useStore((s) => s.setOpenMarkdownPath);
  const [brief, setBrief] = useState<string | null>(null);
  const [contentFiles, setContentFiles] = useState<string[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  useEffect(() => {
    if (!rootDir) return;
    const base = rootDir.replace(/\/$/, "");
    Promise.all([
      loadProjectContext(rootDir).then((text) =>
        text ? text.split("\n").slice(0, 2).join(" ").slice(0, 120) : null,
      ),
      readDir(`${base}/content`)
        .then((entries) =>
          entries
            .filter((e) => !e.isDirectory && e.name.toLowerCase().endsWith(".md"))
            .map((e) => `${base}/content/${e.name}`)
            .slice(0, 5),
        )
        .catch(() => [] as string[]),
    ]).then(([b, files]) => {
      setBrief(b ?? null);
      setContentFiles(files);
    });
  }, [rootDir]);

  const projectName = rootDir ? rootDir.split("/").filter(Boolean).pop() ?? "" : "";

  return (
    <div className="border-t border-border-light bg-bg-secondary px-3 py-3 flex-shrink-0 space-y-3 text-xs">
      <div>
        <p className="font-medium text-text truncate" title={rootDir ?? ""}>
          {projectName || "Proyecto"}
        </p>
        {brief && (
          <p className="text-text-muted mt-0.5 line-clamp-2">{brief}…</p>
        )}
      </div>
      {contentFiles.length > 0 && (
        <div>
          <p className="text-text-muted uppercase tracking-wide mb-1">Contenido reciente</p>
          <ul className="space-y-0.5">
            {contentFiles.map((path) => {
              const name = path.split("/").pop() ?? path;
              return (
                <li key={path}>
                  <button
                    type="button"
                    onClick={() => setOpenMarkdownPath(path)}
                    className="text-accent hover:underline truncate block w-full text-left"
                  >
                    {name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <div>
        {showApiKeyInput ? (
          <div className="space-y-1">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="w-full rounded border border-border bg-bg px-2 py-1 text-xs"
            />
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => {
                  const trimmed = apiKeyInput.trim();
                  if (trimmed) {
                    setApiKey(trimmed);
                    setStoredApiKey(trimmed);
                  }
                  setShowApiKeyInput(false);
                  setApiKeyInput("");
                }}
                className="text-accent hover:underline text-xs"
              >
                Guardar
              </button>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => {
                    setShowApiKeyInput(false);
                    setApiKeyInput("");
                  }}
                  className="text-text-muted hover:underline text-xs"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowApiKeyInput(true)}
            className="text-text-muted hover:text-text text-left"
          >
            {apiKey ? "API key configurada ✓" : "Configurar API key de Claude"}
          </button>
        )}
      </div>
      <label className="flex items-center gap-2 cursor-pointer text-text-muted hover:text-text">
        <input
          type="checkbox"
          checked={respondInSpanish}
          onChange={(e) => setRespondInSpanish(e.target.checked)}
          className="rounded border-border"
        />
        <span>Responder en español</span>
      </label>
    </div>
  );
}
