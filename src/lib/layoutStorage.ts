const KEY_SIDEBAR_WIDTH = "muse-sidebar-width";
const KEY_ROOT_DIR = "muse-root-dir";

export function getStoredSidebarWidth(): number | null {
  try {
    const v = localStorage.getItem(KEY_SIDEBAR_WIDTH);
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) && n >= 15 && n <= 85 ? n : null;
  } catch {
    return null;
  }
}

export function setStoredSidebarWidth(percent: number): void {
  try {
    localStorage.setItem(KEY_SIDEBAR_WIDTH, String(percent));
  } catch {
    // ignore
  }
}

export function getStoredRootDir(): string | null {
  try {
    return localStorage.getItem(KEY_ROOT_DIR);
  } catch {
    return null;
  }
}

export function setStoredRootDir(dir: string): void {
  try {
    localStorage.setItem(KEY_ROOT_DIR, dir);
  } catch {
    // ignore
  }
}
