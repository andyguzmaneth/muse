import { useCallback, useEffect, useState } from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FileTree } from "./FileTree";
import { SidebarFooter } from "./SidebarFooter";
import { SessionManager } from "./SessionManager";
import { Onboarding } from "./Onboarding";
import { BotanicalBranch } from "./Botanicals";
import { useStore } from "../stores/store";
import {
  getStoredSidebarWidth,
  setStoredSidebarWidth,
  getStoredRootDir,
  setStoredRootDir,
  getStoredApiKey,
} from "../lib/layoutStorage";

// Ruta por defecto si no hay ninguna guardada. Configurable con VITE_DEFAULT_PROJECT en .env
// (cada usuario puede poner su propia ruta al proyecto, p. ej. Luz de Luz)
const DEFAULT_DIR =
  (import.meta.env.VITE_DEFAULT_PROJECT as string | undefined)?.trim() || null;

const SIDEBAR_MIN_PERCENT = 15;
const SIDEBAR_MAX_PERCENT = 85;
const SIDEBAR_DEFAULT_PERCENT = 34;

export function AppLayout() {
  const rootDir = useStore((s) => s.rootDir);
  const setRootDir = useStore((s) => s.setRootDir);
  const setApiKey = useStore((s) => s.setApiKey);
  const sidecarError = useStore((s) => s.sidecarError);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarWidthPercent, setSidebarWidthPercent] = useState(() => {
    return getStoredSidebarWidth() ?? SIDEBAR_DEFAULT_PERCENT;
  });

  // Restore rootDir from localStorage, or use default (env) if set
  useEffect(() => {
    if (rootDir == null) {
      const stored = getStoredRootDir();
      const initial = stored || DEFAULT_DIR;
      if (initial) {
        setRootDir(initial);
        setStoredRootDir(initial);
      }
    }
  }, [rootDir, setRootDir]);

  // Restore API key from localStorage (para que quien reciba el .dmg pueda configurarla en la app)
  useEffect(() => {
    const stored = getStoredApiKey();
    if (stored) setApiKey(stored);
  }, [setApiKey]);

  // Persist sidebar width when it changes
  useEffect(() => {
    setStoredSidebarWidth(sidebarWidthPercent);
  }, [sidebarWidthPercent]);

  const handleOpenFolder = useCallback(async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "Abrir carpeta del proyecto",
    });
    if (selected) {
      const path = selected as string;
      setRootDir(path);
      setStoredRootDir(path);
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
            No se pudo conectar con Claude
          </p>
          <p className="text-sm text-text-muted mb-4">{sidecarError}</p>
          <p className="text-xs text-text-light">
            Comprueba que Node.js esté instalado y que hayas configurado la API key de Claude en la barra lateral.
          </p>
        </div>
      </div>
    );
  }

  if (!rootDir) {
    return <Onboarding onChooseFolder={handleOpenFolder} />;
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
            title={sidebarCollapsed ? "Mostrar barra lateral" : "Ocultar barra lateral"}
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
            {rootDir ? rootDir.split("/").pop() : "Abrir carpeta"}
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
              <div className="border-b border-border-light px-3 py-2.5 flex items-center justify-between flex-shrink-0">
                <button
                  onClick={handleOpenFolder}
                  className="text-xs text-text-muted hover:text-text transition-colors tracking-wide uppercase font-medium truncate"
                  title={rootDir ?? "Elegir carpeta"}
                >
                  {rootDir ? rootDir.split("/").pop() : "Elegir carpeta"}
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <FileTree />
              </div>
              <SidebarFooter />
            </div>
            <div
              role="separator"
              aria-label="Resize sidebar"
              title="Arrastra para cambiar el ancho"
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
