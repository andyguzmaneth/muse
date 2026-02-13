import { readTextFile } from "@tauri-apps/plugin-fs";

const CONTEXT_FILES = ["README.md", "context.md", ".muse/context.md"];

/**
 * Load project context from cwd (README.md, context.md, or .muse/context.md).
 * Returns null if none found or on error.
 */
export async function loadProjectContext(cwd: string): Promise<string | null> {
  const base = cwd.replace(/\/$/, "");
  for (const file of CONTEXT_FILES) {
    try {
      const path = `${base}/${file}`;
      const text = await readTextFile(path);
      const trimmed = text?.trim();
      if (trimmed && trimmed.length < 15000) return trimmed;
    } catch {
      continue;
    }
  }
  return null;
}
