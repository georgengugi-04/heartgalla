"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { animate, motion } from "motion/react";
import type { CollectionItem } from "@/lib/collection";
import { ARTWORK_SIZES, EASE_OUT, frameStyle } from "@/lib/frame";
import { usePrefersReducedMotion } from "@/lib/hooks";

export type Rect = { left: number; top: number; width: number; height: number };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "Entering the gallery room". The selected artwork grows from exactly where it sits on the
 * page into the dark viewing space (a transform-only FLIP: translate + scale, never
 * width/height), the room fades in behind it, and only then does the catalogue entry appear.
 * Closing plays the same move in reverse and hands focus back to the artwork.
 */
export default function ArtworkExpand({
  item,
  position,
  total,
  from,
  getReturnRect,
  onClosed,
}: {
  item: CollectionItem;
  position: number;
  total: number;
  from: Rect;
  getReturnRect: () => Rect | null;
  onClosed: () => void;
}) {
  const reduced = usePrefersReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const settled = useRef(false);
  const wantsClose = useRef(false);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    if (!settled.current) {
      wantsClose.current = true; // asked before the opening move finished: close right after it
      return;
    }
    closingRef.current = true;
    setClosing(true);
    const el = frameRef.current;
    const target = getReturnRect();
    if (reduced || !el || !target) {
      window.setTimeout(onClosed, reduced ? 200 : 0);
      return;
    }
    const r = el.getBoundingClientRect();
    animate(
      el,
      {
        x: target.left + target.width / 2 - (r.left + r.width / 2),
        y: target.top + target.height / 2 - (r.top + r.height / 2),
        scale: target.width / r.width,
      },
      { duration: 0.8, ease: EASE_OUT },
    ).then(onClosed);
  }, [getReturnRect, onClosed, reduced]);

  const closeFn = useRef(close);
  useEffect(() => {
    closeFn.current = close;
  });

  // Opening move: start exactly on top of the artwork on the page, lean in a touch, then settle.
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    settled.current = false;
    el.style.transform = "none";
    if (reduced) {
      settled.current = true;
      return;
    }
    const r = el.getBoundingClientRect();
    const s = from.width / r.width;
    const dx = from.left + from.width / 2 - (r.left + r.width / 2);
    const dy = from.top + from.height / 2 - (r.top + r.height / 2);
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`; // no flash of the final pose
    const controls = animate(
      el,
      { x: [dx, dx, 0], y: [dy, dy, 0], scale: [s, s * 1.035, 1] },
      { duration: 1.1, times: [0, 0.16, 1], ease: EASE_OUT },
    );
    controls.then(() => {
      settled.current = true;
      if (wantsClose.current) closeFn.current();
    });
    return () => controls.stop();
  }, [from, reduced]);

  // Escape closes; Tab stays inside the dialog; the page behind does not scroll.
  useEffect(() => {
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    closeBtnRef.current?.focus({ preventScroll: true });

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeFn.current();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])"),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = previousOverflow;
    };
  }, []);

  const facts = [
    ["Medium", item.medium],
    ["Year", item.year],
    ["Dimensions", item.dimensions],
    ["Collection", item.collection],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "");

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title} by ${item.artist}, expanded view`}
      className="fixed inset-0 z-[80] flex flex-col md:flex-row"
    >
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-gallery-dark"
        initial={{ opacity: 0 }}
        animate={{ opacity: closing ? 0 : 1 }}
        transition={{ duration: closing ? 0.6 : 0.7, delay: closing && !reduced ? 0.15 : 0, ease: EASE_OUT }}
      />

      <div
        className="relative z-10 min-h-0 flex-1 p-5 pt-16 md:p-14"
        style={{ containerType: "size" }}
      >
        <div className="flex h-full w-full items-center justify-center">
          <div ref={frameRef} className="relative" style={frameStyle(item.width, item.height)}>
            <Image
              src={item.image}
              alt={`${item.title} by ${item.artist}`}
              fill
              sizes={ARTWORK_SIZES}
              draggable={false}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <motion.aside
        className="relative z-10 flex shrink-0 flex-col justify-end px-6 pb-8 pt-2 md:w-[24rem] md:justify-center md:px-12 md:py-14"
        initial={{ opacity: 0, y: 18 }}
        animate={closing ? { opacity: 0, y: 8 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: closing || reduced ? 0 : 0.8, ease: EASE_OUT }}
      >
        <p className="eg-meta mb-4 text-gold">
          {pad(position + 1)} / {pad(total)}
        </p>
        <p className="text-base text-ivory/70">{item.artist}</p>
        <h3 className="mt-1 font-editorial text-3xl leading-[1.05] md:text-4xl">{item.title}</h3>

        {facts.length > 0 && (
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
            {facts.map(([k, v]) => (
              <div key={String(k)} className="contents">
                <dt className="eg-meta text-ivory/40">{k}</dt>
                <dd className="text-ivory/80">{String(v)}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            href={item.href}
            className="eg-meta inline-flex min-h-11 items-center border-b border-ivory/40 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
          >
            Explore the story →
          </Link>
          {item.hasDialogue && (
            <Link
              href="/art-lab#experiment-10"
              className="eg-meta inline-flex min-h-11 items-center text-ivory/55 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              Look closer
            </Link>
          )}
        </div>
      </motion.aside>

      <button
        ref={closeBtnRef}
        type="button"
        onClick={() => closeFn.current()}
        aria-label="Close expanded view"
        className="eg-meta absolute right-3 top-3 z-20 min-h-11 px-3 text-ivory/70 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:right-8 md:top-7"
      >
        Close <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
