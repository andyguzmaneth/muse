import { useEffect, useCallback, useMemo, useState } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import { useFileTree, type FileNode } from "../hooks/useFileTree";
import { useStore } from "../stores/store";

function filterTree(nodes: FileNode[], query: string): FileNode[] {
  const q = query.trim().toLowerCase();
  if (!q) return nodes;

  function go(node: FileNode): FileNode | null {
    const match = node.name.toLowerCase().includes(q);
    if (node.isFolder && node.children) {
      const filtered = node.children.map(go).filter((n): n is FileNode => n != null);
      if (filtered.length > 0 || match) {
        return { ...node, children: filtered.length > 0 ? filtered : node.children };
      }
      return null;
    }
    return match ? node : null;
  }

  return nodes.map(go).filter((n): n is FileNode => n != null);
}

function FileNodeRenderer({
  node,
  style,
}: NodeRendererProps<FileNode>) {
  return (
    <div
      style={style}
      className={`flex items-center gap-1.5 px-2 py-0.5 text-sm cursor-pointer rounded hover:bg-surface-hover ${
        node.isSelected ? "bg-surface-hover text-accent" : "text-text"
      }`}
      onClick={() => node.isInternal && node.toggle()}
    >
      <span className="text-xs text-text-muted flex-shrink-0">
        {node.isInternal ? (node.isOpen ? "▾" : "▸") : "·"}
      </span>
      <span className="truncate">{node.data.name}</span>
    </div>
  );
}

export function FileTree() {
  const rootDir = useStore((s) => s.rootDir);
  const { tree, loading, loadDirectory } = useFileTree();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (rootDir) loadDirectory(rootDir);
  }, [rootDir, loadDirectory]);

  const handleRefresh = useCallback(() => {
    if (rootDir) loadDirectory(rootDir, true);
  }, [rootDir, loadDirectory]);

  const filteredTree = useMemo(
    () => filterTree(tree, searchQuery),
    [tree, searchQuery],
  );

  const setOpenMarkdownPath = useStore((s) => s.setOpenMarkdownPath);
  const handleActivate = useCallback(
    (node: { data: FileNode }) => {
      if (node.data.isFolder) return;
      const name = node.data.name.toLowerCase();
      if (name.endsWith(".md")) {
        setOpenMarkdownPath(node.data.id);
      }
    },
    [setOpenMarkdownPath],
  );

  if (!rootDir) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-text-muted text-sm">
        Abre una carpeta para ver archivos
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        Cargando…
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border-light flex-shrink-0">
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar…"
          className="flex-1 min-w-0 rounded border border-border bg-bg px-2 py-1 text-xs text-text placeholder:text-text-light focus:border-accent focus:outline-none"
        />
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded p-1 text-text-muted hover:text-text transition-colors"
          title="Actualizar lista"
        >
          ↻
        </button>
      </div>
      <div className="flex-1 min-h-0">
        <Tree<FileNode>
          data={filteredTree}
          idAccessor="id"
          openByDefault={false}
          width="100%"
          height={600}
          indent={16}
          rowHeight={28}
          onActivate={handleActivate}
        >
          {FileNodeRenderer}
        </Tree>
      </div>
    </div>
  );
}
