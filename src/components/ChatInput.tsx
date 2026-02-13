import { useState, useCallback, useRef, type KeyboardEvent } from "react";

interface Props {
  onSend: (message: string) => void;
  onAbort: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export function ChatInput({ onSend, onAbort, isStreaming, disabled }: Props) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, isStreaming, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, []);

  return (
    <div className="border-t border-border-light bg-bg px-4 py-3">
      <div className="flex items-end gap-3 max-w-3xl mx-auto">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            handleInput();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Write something..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text placeholder:text-text-light focus:border-accent focus:outline-none disabled:opacity-50 transition-colors"
        />
        {isStreaming ? (
          <button
            onClick={onAbort}
            className="rounded-xl border border-rose bg-white px-4 py-2.5 text-sm font-medium text-rose hover:bg-rose/5 transition-colors"
          >
            Detener
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        )}
      </div>
    </div>
  );
}
