import { useEffect, useCallback } from "react";
import { Tree, type NodeRendererProps } from "react-arborist";
import { useFileTree, type FileNode } from "../hooks/useFileTree";
import { useStore } from "../stores/store";

interface Props {
  onFileSelect?: (path: string) => void;
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

export function FileTree({ onFileSelect }: Props) {
  const rootDir = useStore((s) => s.rootDir);
  const { tree, loading, loadDirectory } = useFileTree();

  useEffect(() => {
    if (rootDir) {
      loadDirectory(rootDir);
    }
  }, [rootDir, loadDirectory]);

  const handleSelect = useCallback(
    (nodes: { data: FileNode }[]) => {
      const selected = nodes[0];
      if (selected && !selected.data.isFolder && onFileSelect) {
        onFileSelect(selected.data.id);
      }
    },
    [onFileSelect],
  );

  if (!rootDir) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-text-muted text-sm">
        Open a folder to browse files
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted text-sm">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="border-b border-border px-3 py-2 text-xs text-text-muted font-medium uppercase tracking-wide">
        {rootDir.split("/").pop()}
      </div>
      <Tree<FileNode>
        data={tree}
        idAccessor="id"
        openByDefault={false}
        width="100%"
        height={600}
        indent={16}
        rowHeight={28}
        onSelect={handleSelect}
      >
        {FileNodeRenderer}
      </Tree>
    </div>
  );
}
