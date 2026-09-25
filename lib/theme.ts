/**
 * Site-wide light/dark theme. Same pattern as components/intro/introGuard.ts: an inline
 * script in <head> sets data-theme on <html> before first paint (from localStorage, else
 * system preference), so there's never a flash of the wrong theme.
 *
 * Art Lab and The Art Dialogue are intentionally excluded — they're designed as a dark
 * room regardless of site theme (see the ExperimentGate/ArtDialogue wrappers, which set
 * data-theme="dark" on their own container to lock this in even when the rest of the
 * site is in light mode).
 */
export const THEME_STORAGE_KEY = "eartgalla:theme:v1";

export const THEME_GUARD_SCRIPT = `(function(){try{var d=document.documentElement;var saved=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var theme=saved==="light"||saved==="dark"?saved:(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");d.setAttribute("data-theme",theme)}catch(e){}})();`;

export type Theme = "light" | "dark";

export function getStoredTheme(): Theme | null {
  try {
    const v = window.localStorage.getItem(THEME_STORAGE_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: Theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore — theme just won't persist this session
  }
}
