"use client";
import { useEffect, useRef } from "react";

/**
 * Minimal magnetic-ish cursor. Reads data-cursor="view|drag|read|style" off
 * whatever's under the pointer and relabels itself. Disabled entirely on
 * touch devices and under prefers-reduced-motion.
 */
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const el = ref.current;
    if (!el) return;
    let x = 0, y = 0;

    const move = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      const target = (e.target as HTMLElement)?.closest("[data-cursor]") as HTMLElement | null;
      const label = target?.dataset.cursor;
      if (label) {
        el.style.width = "64px"; el.style.height = "64px";
        if (labelRef.current) labelRef.current.textContent = label.toUpperCase();
      } else {
        el.style.width = "10px"; el.style.height = "10px";
        if (labelRef.current) labelRef.current.textContent = "";
      }
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  return (
    <div
      ref={ref}
      id="eg-cursor"
      className="hidden md:flex items-center justify-center"
    >
      <span ref={labelRef} className="label-mono text-[9px]" style={{ color: "var(--color-charcoal)" }} />
    </div>
  );
}
