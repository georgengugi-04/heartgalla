"use client";
import { useCallback, useSyncExternalStore } from "react";
import { setStoredTheme, type Theme } from "@/lib/theme";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// server render and first client paint both assume "dark" — the <head> guard script
// has already set the real attribute before this ever runs, so this only matters for
// the split second before hydration, and "dark" matches the site's own default.
function getServerSnapshot(): Theme {
  return "dark";
}

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback(() => {
    const next: Theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    setStoredTheme(next);
  }, [theme]);

  return (
    <button
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className={`label-mono !text-[0.7rem] tracking-[0.15em] transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-full ${className}`}
    >
      {theme === "light" ? "DARK" : "LIGHT"}
    </button>
  );
}
