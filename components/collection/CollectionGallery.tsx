"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "motion/react";
import type { CollectionItem } from "@/lib/collection";
import { EASE_OUT, EASE_IN_OUT } from "@/lib/frame";
import { useDocumentVisible, usePrefersReducedMotion } from "@/lib/hooks";
import { GalleryArtwork, GalleryNeighbour } from "./GalleryArtwork";
import { AutoplayToggle, RoundArrow, SideControl } from "./GalleryControls";
import GalleryProgress from "./GalleryProgress";
import ArtworkExpand, { type Rect } from "./ArtworkExpand";

/** Slow ambient progression. Anything the visitor does restarts this countdown. */
const AUTOPLAY_MS = 9000;

// Artwork: the outgoing work leans in (1 → 1.025) as it drifts away and fades; the new one
// arrives with a slight offset and settles. Deliberately no springs — slow, editorial.
const slide: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 56, scale: 1.02 }),
  center: { opacity: 1, x: 0, scale: 1, transition: { duration: 1.15, delay: 0.14, ease: EASE_OUT } },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -44,
    scale: 1.025,
    transition: { duration: 0.85, ease: EASE_IN_OUT },
  }),
};
const slideReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// Caption: artist, title and metadata each move on their own beat.
const captionGroup: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.09, delayChildren: 0.28 } },
  exit: { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
};
const captionLine: Variants = {
  enter: { opacity: 0, y: 18 },
  center: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.35 } },
};
const captionLineReduced: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

export default function CollectionGallery({ items }: { items: CollectionItem[] }) {
  const n = items.length;
  const reduced = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const currentButton = useRef<HTMLButtonElement | null>(null);
  const dragged = useRef(false);
  const lastPointerReset = useRef(0);

  const inView = useInView(sectionRef, { amount: 0.35 });
  const tabVisible = useDocumentVisible();

  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const [tick, setTick] = useState(0); // bumped by any visitor interaction: restarts the countdown
  const [hovering, setHovering] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [expanded, setExpanded] = useState<{ item: CollectionItem; from: Rect } | null>(null);

  // Subtle vertical response: the work drifts a few pixels as the section scrolls through.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [16, -16]);

  const go = useCallback(
    (step: 1 | -1, byUser: boolean) => {
      setDir(step);
      setIndex((i) => (i + step + n) % n);
      if (byUser) setTick((t) => t + 1);
    },
    [n],
  );
  const goTo = useCallback(
    (target: number) => {
      setDir(target > index ? 1 : -1);
      setIndex(target);
      setTick((t) => t + 1);
    },
    [index],
  );

  // ── ambient progression: only while it is natural to run ─────────────────────────────
  const playing = !reduced && n > 1 && !userPaused && inView && tabVisible && !hovering && !focusWithin && !expanded;
  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(() => go(1, false), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [playing, index, tick, go]);

  const openExpanded = useCallback(() => {
    if (dragged.current) return; // a drag that ended on the artwork is not a click
    const el = currentButton.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setExpanded({ item: items[index], from: { left: r.left, top: r.top, width: r.width, height: r.height } });
  }, [items, index]);

  const getReturnRect = useCallback((): Rect | null => {
    const r = currentButton.current?.getBoundingClientRect();
    return r ? { left: r.left, top: r.top, width: r.width, height: r.height } : null;
  }, []);

  const onClosed = useCallback(() => {
    setExpanded(null);
    window.requestAnimationFrame(() => currentButton.current?.focus({ preventScroll: true }));
  }, []);

  // ── keyboard: ← → move, Enter opens. Only while the gallery is on screen (or focused). ─
  useEffect(() => {
    if (n === 0) return;
    function onKey(e: KeyboardEvent) {
      if (expanded || e.defaultPrevented || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      const inside = !!(t && sectionRef.current?.contains(t));
      if (!inside && !inView) return;
      if (e.key === "ArrowRight" && n > 1) {
        e.preventDefault();
        go(1, true);
      } else if (e.key === "ArrowLeft" && n > 1) {
        e.preventDefault();
        go(-1, true);
      } else if (e.key === "Enter" && (t === document.body || t === sectionRef.current || t === stageRef.current)) {
        e.preventDefault();
        openExpanded();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [n, inView, expanded, go, openExpanded]);

  // ── trackpad: a clearly horizontal gesture moves the gallery. Vertical wheel is never touched,
  //    so the page scrolls normally; and a horizontal swipe here can't trigger browser back/forward.
  useEffect(() => {
    const el = stageRef.current;
    if (!el || n < 2) return;
    let acc = 0;
    let last = 0;
    let reset: number | undefined;
    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) * 1.4) return;
      e.preventDefault();
      const now = performance.now();
      if (now - last < 700) return;
      acc += e.deltaX;
      window.clearTimeout(reset);
      reset = window.setTimeout(() => (acc = 0), 180);
      if (Math.abs(acc) > 70) {
        go(acc > 0 ? 1 : -1, true);
        acc = 0;
        last = now;
      }
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(reset);
    };
  }, [n, go]);

  if (n === 0) {
    return (
      <section className="border-t border-ivory/10 px-6 py-24 text-center md:px-10">
        <p className="eg-meta text-ivory/50">EARTGALLA / THE COLLECTION</p>
        <p className="mt-4 font-editorial text-2xl text-ivory/70">New works are on their way.</p>
        <Link href="/gallery" className="eg-meta mt-8 inline-block border-b border-ivory/30 pb-1">
          Browse the gallery
        </Link>
      </section>
    );
  }

  const item = items[index];
  const prev = items[(index - 1 + n) % n];
  const next = items[(index + 1) % n];
  const facts = [item.medium, item.year, item.dimensions].filter(
    (v): v is string | number => v !== null && v !== undefined && String(v).trim() !== "",
  );

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="The Collection"
      onPointerMove={() => {
        // moving the cursor anywhere in the section restarts the countdown (at most once a second)
        const now = performance.now();
        if (now - lastPointerReset.current > 1000) {
          lastPointerReset.current = now;
          setTick((t) => t + 1);
        }
      }}
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusWithin(false);
      }}
      className="relative overflow-hidden border-t border-ivory/10 py-16 md:py-20"
    >
      <header className="mb-8 px-6 md:mb-10 md:px-10 md:text-center">
        <p className="label-mono text-ivory/50">EARTGALLA / THE COLLECTION</p>
        <h2
          className="mt-4 font-editorial leading-[1.02]"
          style={{ fontSize: "clamp(2.25rem, 5vw, 4.25rem)" }}
        >
          Works worth
          <br />
          stopping for.
        </h2>
      </header>

      {/* THE STAGE — a size container: every artwork is fitted to it, never cropped */}
      <div
        ref={stageRef}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
        className="relative h-[min(60svh,540px)] w-full overflow-hidden [--edge:8cqw] md:h-[min(58svh,680px)] md:[--edge:15cqw]"
        style={{ containerType: "size" }}
      >
        <GalleryNeighbour item={prev} side="prev" onSelect={() => go(-1, true)} />
        <GalleryNeighbour item={next} side="next" onSelect={() => go(1, true)} />

        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={item.id}
            custom={dir}
            variants={reduced ? slideReduced : slide}
            initial="enter"
            animate="center"
            exit="exit"
            drag={n > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            dragSnapToOrigin
            onDragStart={() => {
              dragged.current = true;
              setTick((t) => t + 1);
            }}
            onDragEnd={(_, info) => {
              if (Math.abs(info.offset.x) > 70 || Math.abs(info.velocity.x) > 500) {
                go(info.offset.x < 0 ? 1 : -1, true);
              }
              window.setTimeout(() => (dragged.current = false), 60);
            }}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${n}`}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.div
              style={reduced ? undefined : { y: parallaxY }}
              className="flex h-full w-full items-center justify-center"
            >
              <GalleryArtwork
                item={item}
                hidden={!!expanded}
                onOpen={openExpanded}
                buttonRef={(el) => {
                  if (el) currentButton.current = el; // ignore the null from a leaving slide
                }}
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CAPTION — artist / title / metadata each arrive on their own beat */}
      <div className="mx-auto mt-8 grid max-w-6xl gap-4 px-6 md:mt-10 md:grid-cols-[1fr_minmax(0,34rem)_1fr] md:items-start md:px-10">
        <SideControl side="prev" title={prev.title} onClick={() => go(-1, true)} />

        <div className="md:text-center">
          <div className="relative min-h-[8.25rem] md:min-h-[8.75rem]">
            <AnimatePresence initial={false}>
              <motion.div
                key={item.id}
                variants={captionGroup}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-x-0 top-0"
              >
                <motion.p variants={reduced ? captionLineReduced : captionLine} className="text-base text-ivory/70">
                  {item.artist}
                </motion.p>
                <motion.h3
                  variants={reduced ? captionLineReduced : captionLine}
                  className="mt-1 font-editorial text-[2rem] leading-[1.05] md:text-5xl"
                >
                  {item.title}
                </motion.h3>
                {facts.length > 0 && (
                  <motion.p variants={reduced ? captionLineReduced : captionLine} className="eg-meta mt-3 text-ivory/50">
                    {facts.join(" · ")}
                  </motion.p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <Link
            href={item.href}
            className="eg-meta inline-flex min-h-11 items-center border-b border-ivory/40 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            View artwork →
          </Link>
        </div>

        <SideControl side="next" title={next.title} onClick={() => go(1, true)} />
      </div>

      {/* PROGRESS + small-screen arrows + pause. On phones the progress takes a full row of its own
          (the segments need the width); arrows and pause sit beneath it, within thumb reach. */}
      {n > 1 && (
        <div className="mx-auto mt-8 flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-1 px-6 md:mt-10 md:flex-nowrap md:px-10">
          <GalleryProgress
            className="order-1 w-full md:order-none md:w-auto md:flex-1"
            index={index}
            titles={items.map((x) => x.title)}
            playing={playing}
            intervalMs={AUTOPLAY_MS}
            tick={tick}
            onSelect={goTo}
          />
          <div className="order-2 md:hidden">
            <RoundArrow dir={-1} onClick={() => go(-1, true)} label={`Previous artwork: ${prev.title}`} />
          </div>
          {!reduced && (
            <div className="order-3 mx-auto md:order-none md:mx-0">
              <AutoplayToggle paused={userPaused} onToggle={() => setUserPaused((p) => !p)} />
            </div>
          )}
          <div className="order-4 md:hidden">
            <RoundArrow dir={1} onClick={() => go(1, true)} label={`Next artwork: ${next.title}`} />
          </div>
        </div>
      )}

      <div className="mt-10 text-center md:mt-14">
        <Link
          href="/gallery"
          data-cursor="view"
          className="eg-meta inline-flex min-h-11 items-center px-3 text-ivory/45 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          All works →
        </Link>
      </div>

      {/* Crawlable, screen-reader-friendly list of every work, independent of the interaction */}
      <nav aria-label="All works in The Collection" className="sr-only">
        <ul>
          {items.map((w) => (
            <li key={w.id}>
              <Link href={w.href}>
                {w.title} — {w.artist}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="sr-only" aria-live={playing ? "off" : "polite"} aria-atomic="true">
        {`Artwork ${index + 1} of ${n}: ${item.title} by ${item.artist}`}
      </p>

      {expanded && (
        <ArtworkExpand
          item={expanded.item}
          position={index}
          total={n}
          from={expanded.from}
          getReturnRect={getReturnRect}
          onClosed={onClosed}
        />
      )}
    </section>
  );
}
