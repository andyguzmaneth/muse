import { useRef, useCallback, useState, useEffect, lazy, Suspense } from "react";
import {
  DockviewReact,
  type DockviewReadyEvent,
  type DockviewApi,
  type IDockviewPanelProps,
} from "dockview-react";
import "dockview-react/dist/styles/dockview.css";
import { ChatPanel } from "./ChatPanel";
import { useStore } from "../stores/store";

const MarkdownViewerPanel = lazy(() =>
  import("./MarkdownViewerPanel").then((m) => ({ default: m.MarkdownViewerPanel })),
);

function ChatPanelComponent(props: IDockviewPanelProps<{ sessionId: string }>) {
  const sessionId = props.params.sessionId;
  return <ChatPanel key={sessionId} sessionId={sessionId} />;
}

function MarkdownPanelComponent(
  props: IDockviewPanelProps<{ filePath: string }>,
) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center text-text-muted text-sm">
          Cargando…
        </div>
      }
    >
      <MarkdownViewerPanel filePath={props.params.filePath} />
    </Suspense>
  );
}

const components = {
  chatPanel: ChatPanelComponent,
  markdownPanel: MarkdownPanelComponent,
};

type LayoutMode = "tabs" | "columns" | "rows" | "grid";

// Small SVG icons for layout modes
function LayoutTabsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="14" rx="2" />
    </svg>
  );
}
function LayoutColumnsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <line x1="8" y1="1" x2="8" y2="15" />
    </svg>
  );
}
function LayoutRowsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <line x1="1" y1="8" x2="15" y2="8" />
    </svg>
  );
}
function LayoutGridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2">
      <rect x="1" y="1" width="14" height="14" rx="2" />
      <line x1="8" y1="1" x2="8" y2="15" />
      <line x1="1" y1="8" x2="15" y2="8" />
    </svg>
  );
}

const LAYOUTS: { mode: LayoutMode; icon: () => React.ReactNode; title: string }[] = [
  { mode: "tabs", icon: LayoutTabsIcon, title: "All tabs" },
  { mode: "columns", icon: LayoutColumnsIcon, title: "Side by side" },
  { mode: "rows", icon: LayoutRowsIcon, title: "Stacked" },
  { mode: "grid", icon: LayoutGridIcon, title: "Grid" },
];

export function SessionManager() {
  const apiRef = useRef<DockviewApi | null>(null);
  const isRearrangingRef = useRef(false);
  const rootDir = useStore((s) => s.rootDir);
  const createSession = useStore((s) => s.createSession);
  const removeSession = useStore((s) => s.removeSession);
  const setActiveSession = useStore((s) => s.setActiveSession);
  const renameSession = useStore((s) => s.renameSession);
  const sessions = useStore((s) => s.sessions);
  const activeSessionId = useStore((s) => s.activeSessionId);
  const openMarkdownPath = useStore((s) => s.openMarkdownPath);
  const setOpenMarkdownPath = useStore((s) => s.setOpenMarkdownPath);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [currentLayout, setCurrentLayout] = useState<LayoutMode>("tabs");
  const [markdownPanels, setMarkdownPanels] = useState<
    Record<string, { title: string }>
  >({});
  const markdownPanelIdCounterRef = useRef(0);

  useEffect(() => {
    if (!openMarkdownPath || !apiRef.current) return;
    const path = openMarkdownPath;
    setOpenMarkdownPath(null);

    markdownPanelIdCounterRef.current += 1;
    const id = `md-${markdownPanelIdCounterRef.current}`;
    const title =
      path.split(/[/\\]/).filter(Boolean).pop() ?? "Untitled.md";

    apiRef.current.addPanel({
      id,
      component: "markdownPanel",
      params: { filePath: path },
      title,
    });
    setMarkdownPanels((prev) => ({ ...prev, [id]: { title } }));
  }, [openMarkdownPath, setOpenMarkdownPath]);

  const addNewSession = useCallback(() => {
    const cwd = rootDir ?? "/";
    const sessionId = createSession(cwd);

    if (apiRef.current) {
      apiRef.current.addPanel({
        id: sessionId,
        component: "chatPanel",
        params: { sessionId },
        title: `Chat ${sessionId.split("-")[1]}`,
      });
    }
  }, [rootDir, createSession]);

  const applyLayout = useCallback(
    (layout: LayoutMode) => {
      const api = apiRef.current;
      if (!api) return;

      const sessionEntries = Object.entries(sessions);
      if (sessionEntries.length <= 1) {
        setCurrentLayout(layout);
        return;
      }

      isRearrangingRef.current = true;

      // Remove only session panels (keep markdown viewer panels)
      for (const panel of [...api.panels]) {
        if (panel.id.startsWith("md-")) continue;
        api.removePanel(panel);
      }

      // Re-add session panels in the desired layout
      sessionEntries.forEach(([id, session], i) => {
        let position: { referencePanel: string; direction: string } | undefined;

        if (layout === "columns" && i > 0) {
          position = { referencePanel: sessionEntries[i - 1][0], direction: "right" };
        } else if (layout === "rows" && i > 0) {
          position = { referencePanel: sessionEntries[i - 1][0], direction: "below" };
        } else if (layout === "grid" && i > 0) {
          if (i === 1) {
            position = { referencePanel: sessionEntries[0][0], direction: "right" };
          } else if (i === 2) {
            position = { referencePanel: sessionEntries[0][0], direction: "below" };
          } else if (i === 3) {
            position = { referencePanel: sessionEntries[2][0], direction: "right" };
          } else {
            // 5+ panels: alternate right/below
            position = {
              referencePanel: sessionEntries[i - 2][0],
              direction: i % 2 === 0 ? "below" : "right",
            };
          }
        }
        // "tabs" layout: no position → all go into same group

        api.addPanel({
          id,
          component: "chatPanel",
          params: { sessionId: id },
          title: session.name,
          ...(position ? { position } : {}),
        });
      });

      isRearrangingRef.current = false;
      setCurrentLayout(layout);
    },
    [sessions],
  );

  const handleReady = useCallback(
    (event: DockviewReadyEvent) => {
      apiRef.current = event.api;

      event.api.onDidActivePanelChange((e) => {
        if (e?.id) {
          setActiveSession(e.id);
        }
      });

      event.api.onDidRemovePanel((e) => {
        if (!isRearrangingRef.current) {
          if (e.id.startsWith("md-")) {
            setMarkdownPanels((prev) => {
              const next = { ...prev };
              delete next[e.id];
              return next;
            });
          } else {
            removeSession(e.id);
          }
        }
      });

      addNewSession();
    },
    [addNewSession, setActiveSession, removeSession],
  );

  const handleDoubleClick = (sessionId: string) => {
    const session = sessions[sessionId];
    if (session) {
      setEditingId(sessionId);
      setEditValue(session.name);
    }
  };

  const handleRenameSubmit = (sessionId: string) => {
    const trimmed = editValue.trim();
    if (trimmed) {
      renameSession(sessionId, trimmed);
      const panel = apiRef.current?.getPanel(sessionId);
      if (panel) {
        panel.api.setTitle(trimmed);
      }
    }
    setEditingId(null);
  };

  const sessionIds = Object.keys(sessions);
  const sessionNames = sessionIds.map((id) => sessions[id]?.name ?? "").join("\0");

  const activatePanel = useCallback((id: string) => {
    setActiveSession(id);
    const panel = apiRef.current?.getPanel(id);
    if (panel) panel.api.setActive();
  }, [setActiveSession]);

  const closePanel = useCallback((id: string) => {
    const panel = apiRef.current?.getPanel(id);
    if (panel) apiRef.current?.removePanel(panel);
  }, []);

  const tabOrderRef = useRef<string[]>([]);
  useEffect(() => {
    tabOrderRef.current = [...sessionIds, ...Object.keys(markdownPanels)];
  }, [sessionIds, markdownPanels]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest("input, textarea, [contenteditable=true]")) return;
      if ((!e.metaKey && !e.ctrlKey) || e.key < "1" || e.key > "9") return;
      const panelId = tabOrderRef.current[parseInt(e.key, 10) - 1];
      if (panelId) {
        e.preventDefault();
        activatePanel(panelId);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activatePanel]);

  // Sincronizar título del panel con session.name (p. ej. al renombrar desde el primer mensaje)
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    sessionIds.forEach((id) => {
      const session = sessions[id];
      if (session) {
        const panel = api.getPanel(id);
        if (panel) panel.api.setTitle(session.name);
      }
    });
  }, [sessionIds, sessionNames]);

  return (
    <div className="flex h-full flex-col">
      {/* Custom tab bar */}
      <div className="flex items-center gap-1 border-b border-border-light bg-bg-secondary px-2 py-1.5">
        {/* Session tabs */}
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
          {sessionIds.map((id) => {
            const session = sessions[id];
            const isActive = id === activeSessionId;
            return (
              <div
                key={id}
                className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors flex-shrink-0 ${
                  isActive
                    ? "bg-bg text-text font-medium shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-bg/50"
                }`}
                onClick={() => activatePanel(id)}
                onDoubleClick={() => handleDoubleClick(id)}
              >
                {editingId === id ? (
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="bg-transparent border-b border-accent outline-none text-sm w-24 py-0"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="truncate max-w-[120px]">
                    {session.name}
                    {session.totalCost > 0 && (
                      <span className="text-xs text-text-light ml-1 tabular-nums">
                        ${session.totalCost.toFixed(2)}
                      </span>
                    )}
                  </span>
                )}
                {sessionIds.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closePanel(id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-text-light hover:text-text-muted transition-opacity text-xs ml-1"
                  >
                    x
                  </button>
                )}
              </div>
            );
          })}
          {Object.entries(markdownPanels).map(([id, { title }]) => {
            const isActive = id === activeSessionId;
            return (
              <div
                key={id}
                className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm cursor-pointer transition-colors flex-shrink-0 ${
                  isActive
                    ? "bg-bg text-text font-medium shadow-sm"
                    : "text-text-muted hover:text-text hover:bg-bg/50"
                }`}
                onClick={() => activatePanel(id)}
              >
                <span className="truncate max-w-[120px]">{title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closePanel(id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-text-light hover:text-text-muted transition-opacity text-xs ml-1"
                >
                  x
                </button>
              </div>
            );
          })}
          <button
            onClick={addNewSession}
            className="rounded-lg px-2.5 py-1.5 text-sm text-text-muted hover:text-text hover:bg-bg/50 transition-colors flex-shrink-0"
            title="Nueva sesión"
          >
            +
          </button>
        </div>

        {/* Layout buttons */}
        {sessionIds.length > 1 && (
          <div className="flex items-center gap-0.5 border-l border-border-light pl-2 ml-1 flex-shrink-0">
            {LAYOUTS.map(({ mode, icon: Icon, title }) => (
              <button
                key={mode}
                onClick={() => applyLayout(mode)}
                className={`rounded p-1.5 transition-colors ${
                  currentLayout === mode
                    ? "text-accent bg-accent/10"
                    : "text-text-light hover:text-text-muted hover:bg-bg/50"
                }`}
                title={title}
              >
                <Icon />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dockview panels */}
      <div className="flex-1">
        <DockviewReact
          components={components}
          onReady={handleReady}
          className="dockview-theme-light"
          disableDnd={true}
        />
      </div>
    </div>
  );
}
