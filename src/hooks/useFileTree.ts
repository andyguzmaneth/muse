import { useState, useCallback } from "react";
import { readDir, type DirEntry } from "@tauri-apps/plugin-fs";

export interface FileNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FileNode[];
}

const IGNORED = new Set([
  "node_modules",
  ".git",
  ".DS_Store",
  "target",
  "dist",
  "build",
  ".next",
  "__pycache__",
  ".cache",
]);

function cacheKey(dirPath: string) {
  return `muse-filetree-${dirPath}`;
}

async function buildTree(
  dirPath: string,
  depth: number = 0,
  maxDepth: number = 3,
): Promise<FileNode[]> {
  if (depth >= maxDepth) return [];

  let entries: DirEntry[];
  try {
    entries = await readDir(dirPath);
  } catch {
    return [];
  }

  const nodes: FileNode[] = [];
  const sorted = entries
    .filter((e) => !IGNORED.has(e.name))
    .sort((a, b) => {
      if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  for (const entry of sorted) {
    const fullPath = `${dirPath}/${entry.name}`;
    const node: FileNode = {
      id: fullPath,
      name: entry.name,
      isFolder: entry.isDirectory ?? false,
    };

    if (entry.isDirectory && depth < maxDepth - 1) {
      node.children = await buildTree(fullPath, depth + 1, maxDepth);
    } else if (entry.isDirectory) {
      node.children = [];
    }

    nodes.push(node);
  }

  return nodes;
}

function getCachedTree(dirPath: string): FileNode[] | null {
  try {
    const raw = sessionStorage.getItem(cacheKey(dirPath));
    return raw ? (JSON.parse(raw) as FileNode[]) : null;
  } catch {
    return null;
  }
}

function setCachedTree(dirPath: string, tree: FileNode[]): void {
  try {
    sessionStorage.setItem(cacheKey(dirPath), JSON.stringify(tree));
  } catch {
    // ignore
  }
}

export function useFileTree() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDirectory = useCallback(async (dirPath: string, forceRefresh = false) => {
    if (!forceRefresh) {
      const cached = getCachedTree(dirPath);
      if (cached != null) {
        setTree(cached);
        return;
      }
    }
    setLoading(true);
    try {
      const nodes = await buildTree(dirPath);
      setTree(nodes);
      setCachedTree(dirPath, nodes);
    } catch (err) {
      console.error("Failed to load directory:", err);
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tree, loading, loadDirectory };
}
