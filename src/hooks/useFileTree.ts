import { useState, useCallback } from "react";
import { readDir, type DirEntry } from "@tauri-apps/plugin-fs";

export interface FileNode {
  id: string;
  name: string;
  isFolder: boolean;
  children?: FileNode[];
}

// Directories to always skip
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

  // Sort: folders first, then alphabetical
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
      // Placeholder for lazy loading
      node.children = [];
    }

    nodes.push(node);
  }

  return nodes;
}

export function useFileTree() {
  const [tree, setTree] = useState<FileNode[]>([]);
  const [loading, setLoading] = useState(false);

  const loadDirectory = useCallback(async (dirPath: string) => {
    setLoading(true);
    try {
      const nodes = await buildTree(dirPath);
      setTree(nodes);
    } catch (err) {
      console.error("Failed to load directory:", err);
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { tree, loading, loadDirectory };
}
