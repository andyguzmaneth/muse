import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FileTree } from "./FileTree";
import { SessionManager } from "./SessionManager";
import { BotanicalBranch } from "./Botanicals";
import { useStore } from "../stores/store";
import { sidecar } from "../lib/sidecar";

const DEFAULT_DIR =
  "/Users/andresguzman/Projects/atlas/05-personal-business/projects/luz-de-luz";

const SIDEBAR_MIN_PERCENT = 15;
const SIDEBAR_MAX_PERCENT = 85;
const SIDEBAR_DEFAULT_PERCENT = 34;

export function AppLayout() {
  const rootDir = useStore((s) => s.rootDir);
  const setRootDir = useStore((s) => s.setRootDir);
  const [sidecarReady, setSidecarReady] = useState(false);
  const [sidecarError, setSidecarError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidthPercent, setSidebarWidthPercent] = useState(
    SIDEBAR_DEFAULT_PERCENT,
  );

  // Start the sidecar and set default directory
  useEffect(() => {
    if (!rootDir) {
      setRootDir(DEFAULT_DIR);
    }
    sidecar
      .start()
      .then(() => setSidecarReady(true))
      .catch((err) => {
        console.error("Failed to start sidecar:", err);
        setSidecarError(String(err));
      });
  }, []);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Open Project Folder",
    });
    if (selected) {
      setRootDir(selected as string);
    }
  }, [setRootDir]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startPercent = sidebarWidthPercent;

      const onMove = (moveEvent: MouseEvent) => {
        const container = document.querySelector("[data-main-content]");
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const deltaX = moveEvent.clientX - startX;
        const deltaPercent = (deltaX / rect.width) * 100;
        const next = Math.min(
          SIDEBAR_MAX_PERCENT,
          Math.max(
            SIDEBAR_MIN_PERCENT,
            startPercent + deltaPercent,
          ),
        );
        setSidebarWidthPercent(next);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [sidebarWidthPercent],
  );

  if (sidecarError) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg p-8">
        <div className="max-w-md text-center animate-fade-in">
          <BotanicalBranch className="w-24 h-32 mx-auto mb-6 text-taupe" />
          <p className="text-lg font-medium text-text mb-2">
            Could not connect to Claude
          </p>
          <p className="text-sm text-text-muted mb-4">{sidecarError}</p>
          <p className="text-xs text-text-light">
            Make sure Node.js is installed and ANTHROPIC_API_KEY is set.
          </p>
        </div>
      </div>
    );
  }

  if (!sidecarReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="text-center animate-fade-in">
          <BotanicalBranch className="w-20 h-28 mx-auto mb-4 text-taupe animate-gentle-pulse" />
          <p className="font-display text-2xl text-accent mb-1">Muse</p>
          <p className="text-xs text-text-light tracking-wide uppercase">
            Preparing your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* Title bar */}
      <div
        className="h-9 flex items-center px-4 bg-bg-secondary border-b border-border-light"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-text-muted hover:text-text transition-colors px-1.5 py-0.5 rounded text-sm"
            title={sidebarCollapsed ? "Show sidebar" : "Hide sidebar"}
          >
            {sidebarCollapsed ? "\u25B6" : "\u25C0"}
          </button>
        </div>
        <div className="flex-1" data-tauri-drag-region />
        <span
          className="font-display text-base text-accent"
          data-tauri-drag-region
        >
          Muse
        </span>
        <div className="flex-1 flex justify-end" data-tauri-drag-region>
          <button
            onClick={handleOpenFolder}
            className="text-xs text-text-muted hover:text-text transition-colors px-2 py-0.5 rounded tracking-wide uppercase"
          >
            {rootDir ? rootDir.split("/").pop() : "Open Folder"}
          </button>
        </div>
      </div>

      {/* Main content: flex layout with custom sidebar resize */}
      <div
        data-main-content
        className="flex-1 flex min-h-0 w-full"
      >
        {!sidebarCollapsed && (
          <>
            <div
              className="h-full flex-shrink-0 flex flex-col bg-bg-secondary overflow-hidden"
              style={{ width: `${sidebarWidthPercent}%` }}
            >
              <div className="border-b border-border-light px-3 py-2.5 flex items-center justify-between">
                <button
                  onClick={handleOpenFolder}
                  className="text-xs text-text-muted hover:text-text transition-colors tracking-wide uppercase font-medium truncate"
                  title={rootDir ?? "Select folder"}
                >
                  {rootDir ? rootDir.split("/").pop() : "Select Folder"}
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <FileTree />
              </div>
            </div>
            <div
              role="separator"
              aria-label="Resize sidebar"
              title="Drag to resize sidebar"
              onMouseDown={handleResizeStart}
              className="w-3 shrink-0 cursor-col-resize select-none bg-border-light hover:bg-accent/40 active:bg-accent/60 border-l border-border-light transition-colors flex items-stretch"
            />
          </>
        )}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col">
          <SessionManager />
        </div>
      </div>
    </div>
  );
}
