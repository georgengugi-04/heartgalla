"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades and lifts its children into view once, as they scroll on screen. With "reduce motion" on (or no JS) it just shows them. */
export default function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.dataset.in = "true"; return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} data-in={seen} className={`jr-reveal ${className}`} style={{ "--jr-delay": `${delay}ms` } as React.CSSProperties}>{children}</div>;
}
