import { useRef, useEffect, useCallback, useState } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput, type ChatInputHandle } from "./ChatInput";
import { BotanicalLeaf, BotanicalOlive } from "./Botanicals";
import { useClaude } from "../hooks/useClaude";
import { useStore } from "../stores/store";
import { loadProjectContext } from "../lib/projectContext";
import { QUICK_PROMPTS, TEMPLATES } from "../lib/prompts";
import { writeTextFile, mkdir } from "@tauri-apps/plugin-fs";

interface Props {
  sessionId: string;
}

const MAX_SESSION_NAME_CHARS = 28;

function slugFromFirstMessage(text: string): string {
  const line = text.split(/\n/)[0]?.trim() ?? text;
  const slice = line.slice(0, MAX_SESSION_NAME_CHARS).trim();
  return slice || "Chat";
}

export function ChatPanel({ sessionId }: Props) {
  const session = useStore((s) => s.sessions[sessionId]);
  const renameSession = useStore((s) => s.renameSession);
  const { sendMessage, abort } = useClaude(sessionId);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const [exporting, setExporting] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [session?.messages.length, session?.messages[Math.max(0, (session?.messages.length ?? 0) - 1)]?.content]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!session) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const isFirst = session.messages.length === 0;
      let toSend = trimmed;

      if (isFirst) {
        const context = await loadProjectContext(session.cwd);
        if (context) {
          toSend = `[Contexto del proyecto]\n${context}\n\n[Pregunta]\n${trimmed}`;
        }
        const newName = slugFromFirstMessage(trimmed);
        if (newName) renameSession(sessionId, newName);
      }

      sendMessage(toSend, toSend !== trimmed ? trimmed : undefined);
    },
    [session, sessionId, sendMessage, renameSession],
  );

  const handleExportChat = useCallback(async () => {
    if (!session || session.messages.length === 0) return;
    setExporting(true);
    try {
      const base = session.cwd.replace(/\/$/, "");
      const chatsDir = `${base}/chats`;
      await mkdir(chatsDir, { recursive: true }).catch(() => {});
      const date = new Date().toISOString().slice(0, 10);
      const safeId = sessionId.replace(/[^a-z0-9-]/gi, "-");
      const path = `${chatsDir}/export-${safeId}-${date}.md`;
      const lines: string[] = [`# ${session.name}\n`, `Exportado: ${new Date().toLocaleString("es")}\n`];
      for (const msg of session.messages) {
        const title = msg.role === "user" ? "## Tú" : "## Claude";
        lines.push(`${title}\n\n${msg.content}\n\n`);
      }
      await writeTextFile(path, lines.join(""));
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }, [session, sessionId]);

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-text-muted">
        Sesión no encontrada
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col bg-bg">
      {/* Barra: Exportar + costo */}
      <div className="flex items-center justify-between border-b border-border-light bg-bg-secondary px-4 py-2 text-sm">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportChat}
            disabled={session.messages.length === 0 || exporting}
            className="text-text-muted hover:text-text transition-colors disabled:opacity-50"
          >
            {exporting ? "Exportando…" : "Exportar chat"}
          </button>
        </div>
        {session.totalCost > 0 && (
          <span className="text-text-muted tabular-nums">
            Costo: ${session.totalCost.toFixed(2)}
          </span>
        )}
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[280px] animate-fade-in">
            <BotanicalLeaf className="w-16 h-20 text-taupe-light mb-6" />
            <p className="font-display text-xl text-accent mb-2">
              ¿En qué te ayudo hoy?
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mb-4">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl border border-border bg-surface hover:bg-surface-hover px-3 py-2 text-sm text-text transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
            <BotanicalOlive className="w-32 h-12 text-border mt-1" />
          </div>
        ) : (
          <>
            {session.messages.map((msg) => {
              const lastMsg = session.messages[session.messages.length - 1];
              if (msg.id === lastMsg?.id && msg.role === "assistant" && !msg.content && session.isStreaming) return null;
              return <ChatMessage key={msg.id} message={msg} />;
            })}
            {session.isStreaming && (
              <div className="flex justify-start mb-3">
                <div className="rounded-2xl px-4 py-3 bg-assistant-bubble flex items-center gap-2">
                  <div className="flex gap-1.5 items-center py-1">
                    {[0, 0.3, 0.6].map((delay) => (
                      <div
                        key={delay}
                        className="w-1.5 h-1.5 rounded-full bg-taupe animate-gentle-pulse"
                        style={{ animationDelay: `${delay}s` }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-text-muted">Claude está trabajando…</span>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input + Plantillas */}
      <div className="border-t border-border-light bg-bg">
        <div className="px-4 pt-2 pb-1 flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setTemplatesOpen((o) => !o)}
              className="text-xs text-text-muted hover:text-text transition-colors"
            >
              Plantillas
            </button>
            {templatesOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setTemplatesOpen(false)}
                />
                <div className="absolute left-0 bottom-full mb-1 z-20 rounded-lg border border-border bg-bg shadow-lg py-1 min-w-[220px]">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.label}
                      type="button"
                      onClick={() => {
                        setTemplatesOpen(false);
                        chatInputRef.current?.insertText(t.text);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface transition-colors"
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <ChatInput
          ref={chatInputRef}
          onSend={handleSend}
          onAbort={abort}
          isStreaming={session.isStreaming}
        />
      </div>
    </div>
  );
}
