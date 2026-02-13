import { useRef, useCallback } from "react";
import {
  DockviewReact,
  type DockviewReadyEvent,
  type DockviewApi,
  type IDockviewPanelProps,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";
import { ChatPanel } from "./ChatPanel";
import { useStore } from "../stores/store";
import { sidecar } from "../lib/sidecar";

// Dockview panel component that renders a ChatPanel
function ChatPanelComponent(props: IDockviewPanelProps<{ sessionId: string }>) {
  return <ChatPanel sessionId={props.params.sessionId} />;
}

const components = {
  chatPanel: ChatPanelComponent,
};

export function SessionManager() {
  const apiRef = useRef<DockviewApi | null>(null);
  const rootDir = useStore((s) => s.rootDir);
  const createSession = useStore((s) => s.createSession);
  const removeSession = useStore((s) => s.removeSession);
  const setActiveSession = useStore((s) => s.setActiveSession);

  const addNewSession = useCallback(async () => {
    const cwd = rootDir ?? "/";
    const sessionId = createSession(cwd);

    // Create session in sidecar
    await sidecar.createSession(sessionId, cwd);

    // Add panel to dockview
    if (apiRef.current) {
      apiRef.current.addPanel({
        id: sessionId,
        component: "chatPanel",
        params: { sessionId },
        title: `Chat ${sessionId.split("-")[1]}`,
      });
    }
  }, [rootDir, createSession]);

  const handleReady = useCallback(
    (event: DockviewReadyEvent) => {
      apiRef.current = event.api;

      // Listen for panel changes
      event.api.onDidActivePanelChange((e) => {
        if (e?.id) {
          setActiveSession(e.id);
        }
      });

      event.api.onDidRemovePanel((e) => {
        removeSession(e.id);
      });

      // Create first session automatically
      addNewSession();
    },
    [addNewSession, setActiveSession, removeSession],
  );

  return (
    <div className="flex h-full flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border bg-bg-secondary px-3 py-1.5">
        <button
          onClick={addNewSession}
          className="rounded-lg bg-surface px-3 py-1 text-sm text-text hover:bg-surface-hover transition-colors"
          title="New session"
        >
          + New Chat
        </button>
      </div>

      {/* Dockview panels */}
      <div className="flex-1">
        <DockviewReact
          components={components}
          onReady={handleReady}
          className="dockview-theme-dark"
        />
      </div>
    </div>
  );
}
