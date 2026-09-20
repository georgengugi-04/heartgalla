"use client";
import { useCallback, useRef, useState, useSyncExternalStore } from "react";

// motion's useReducedMotion() is already `true` on first client render before it
// can read the real media query, which causes a hydration mismatch whenever it
// changes what's rendered. useSyncExternalStore with a false server snapshot
// avoids that: server and first client paint agree, then it updates after mount.
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query]
  );
  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => false, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useElementSize<T extends HTMLElement>() {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const observerRef = useRef<ResizeObserver | null>(null);

  const ref = useCallback((node: T | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (node) {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          setSize({ width, height });
        }
      });
      ro.observe(node);
      observerRef.current = ro;
    }
  }, []);

  return [ref, size] as const;
}
