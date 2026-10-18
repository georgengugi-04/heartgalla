import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

/** Live `matchMedia` value. Server / first render is always `false`, so hydration never mismatches. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

/** True while the tab is visible. */
export function useDocumentVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener("visibilitychange", onChange);
      return () => document.removeEventListener("visibilitychange", onChange);
    },
    () => document.visibilityState === "visible",
    () => true,
  );
}

/** Callback-ref + measured content size (px). One ResizeObserver per element, cleaned up on unmount. */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((s) => (s.w === width && s.h === height ? s : { w: width, h: height }));
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [node]);
  return [setNode, size] as const;
}

/**
 * `prefers-reduced-motion: reduce`, safe for server-rendered markup: the first (hydrating) render always
 * sees `false`, matching the server HTML, and the real value applies right after. Use this instead of
 * motion's `useReducedMotion` wherever the reduced-motion value changes what is rendered.
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
