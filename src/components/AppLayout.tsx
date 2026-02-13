import { useCallback, useEffect, useState } from "react";
import {
  Panel,
  Group,
  Separator,
} from "react-resizable-panels";
import { open } from "@tauri-apps/plugin-dialog";
import { FileTree } from "./FileTree";
import { SessionManager } from "./SessionManager";
import { useStore } from "../stores/store";
import { sidecar } from "../lib/sidecar";

export function AppLayout() {
  const rootDir = useStore((s) => s.rootDir);
  const setRootDir = useStore((s) => s.setRootDir);
  const [sidecarReady, setSidecarReady] = useState(false);
  const [sidecarError, setSidecarError] = useState<string | null>(null);

  // Start the sidecar on mount
  useEffect(() => {
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

  const handleFileSelect = useCallback((path: string) => {
    // TODO: Insert file reference into active chat
    console.log("File selected:", path);
  }, []);

  if (sidecarError) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg p-8">
        <div className="max-w-md text-center">
          <p className="text-lg font-medium text-text mb-2">
            Failed to start Claude bridge
          </p>
          <p className="text-sm text-text-muted mb-4">{sidecarError}</p>
          <p className="text-xs text-text-muted">
            Make sure Node.js and tsx are installed, and the sidecar is
            accessible.
          </p>
        </div>
      </div>
    );
  }

  if (!sidecarReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="text-center">
          <div className="mb-3 text-2xl animate-pulse">&#9672;</div>
          <p className="text-sm text-text-muted">Starting Muse...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      {/* Title bar drag region */}
      <div
        className="h-8 flex items-center px-4 bg-bg-secondary border-b border-border"
        data-tauri-drag-region
      >
        <div className="flex-1" data-tauri-drag-region />
        <span className="text-xs font-medium text-text-muted" data-tauri-drag-region>
          Muse
        </span>
        <div className="flex-1 flex justify-end" data-tauri-drag-region>
          <button
            onClick={handleOpenFolder}
            className="text-xs text-text-muted hover:text-text transition-colors px-2 py-0.5 rounded"
          >
            {rootDir ? rootDir.split("/").pop() : "Open Folder"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <Group orientation="horizontal" className="flex-1">
        {/* Sidebar */}
        <Panel defaultSize={20} minSize={15} maxSize={40}>
          <div className="h-full bg-bg-secondary border-r border-border overflow-hidden">
            <FileTree onFileSelect={handleFileSelect} />
          </div>
        </Panel>

        <Separator className="w-px bg-border hover:bg-accent transition-colors" />

        {/* Sessions area */}
        <Panel defaultSize={80}>
          <SessionManager />
        </Panel>
      </Group>
    </div>
  );
}
