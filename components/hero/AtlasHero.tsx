"use client";
import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/lib/hooks";

const Sculpture = dynamic(() => import("./Sculpture"), { ssr: false });

type Slide = { image: string; alt: string; credit: string; href: string };
const SLIDE_MS = 7000;

/** True only when a 3D scene is both possible and kind to the device: WebGL, no reduced-motion, no data-saver, not a low-power phone. */
function canRun3d(): boolean {
  try {
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
    if (nav.connection?.saveData || /(^|-)2g$/.test(nav.connection?.effectiveType ?? "")) return false;
    if ((nav.deviceMemory ?? 8) < 4 || (nav.hardwareConcurrency ?? 8) < 4) return false;
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function AtlasHero({ slides }: { slides: Slide[] }) {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(0);
  const [scene, setScene] = useState(false);
  const [visible, setVisible] = useState(true);
  const panel = useRef<HTMLDivElement>(null);

  // Load the 3D scene only after the page is readable and the browser is idle.
  useEffect(() => {
    if (reduced) return;
    const start = () => { if (canRun3d()) setScene(true); };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (n: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(start, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(start, 1200);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // Stop drawing frames when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = panel.current;
    if (!el || !scene) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    const onVis = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, [scene]);

  useEffect(() => {
    if (slides.length < 2 || reduced) return;
    const t = window.setInterval(() => setIdx((v) => (v + 1) % slides.length), SLIDE_MS);
    return () => window.clearInterval(t);
  }, [slides.length, reduced]);

  const slide = slides[idx % slides.length];
  const words = ["The", "living", "atlas", "of", "Kenyan", "creativity"];

  return (
    <section className="relative isolate flex min-h-[100svh] w-full items-center overflow-hidden pt-24 pb-12">
      {/* the artwork stays present as a soft atmosphere behind everything */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image key={slide.image} src={slide.image} alt="" fill priority sizes="25vw" className="scale-125 object-cover opacity-35 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-6 md:grid-cols-[1.15fr_0.85fr] md:gap-6 md:px-10">
        <div className="md:order-first">
          <h1 className="font-editorial text-[clamp(2.6rem,7.2vw,6.25rem)] leading-[1.02] text-ivory">
            {words.map((w, i) => (
              <span key={w + i}>
              <motion.span
                className="inline-block"
                initial={reduced ? false : { opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {w}
              </motion.span>
              {i < words.length - 1 ? " " : null}
              </span>
            ))}
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-ivory/80">
            A growing archive of Kenyan art, craft and the people behind them. Every record names its sources and who gave permission.
          </p>
          <p className="mt-4 font-editorial text-xl italic text-ivory/65">Art speaks where words are unable to explain.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/explore" data-cursor="view" className="inline-flex min-h-12 items-center rounded-full bg-gold px-7 text-[0.95rem] font-medium text-charcoal transition-colors hover:bg-ivory focus-visible:outline-ivory">
              Explore the Atlas
            </Link>
            <Link href="/gazette" data-cursor="view" className="inline-flex min-h-12 items-center rounded-full border border-ivory/40 px-7 text-[0.95rem] text-ivory transition-colors hover:border-ivory">
              Discover the stories
            </Link>
          </div>
        </div>

        <div ref={panel} className="relative order-first h-[36svh] md:order-last md:h-[68svh]">
          {scene ? (
            <div aria-hidden="true" className="absolute inset-0">
              <Sculpture active={visible} />
            </div>
          ) : (
            <Link href={slide.href} data-cursor="view" className="group absolute inset-0 block" aria-label={`Featured work: ${slide.credit}`}>
              <Image src={slide.image} alt={slide.alt} fill priority sizes="(max-width: 768px) 90vw, 40vw" className="object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]" />
            </Link>
          )}
        </div>
      </div>

      <Link href={slide.href} className="absolute bottom-5 left-6 text-sm text-ivory/60 underline-offset-4 hover:text-ivory hover:underline md:left-10">
        Featured: {slide.credit}
      </Link>
    </section>
  );
}
