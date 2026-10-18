"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { frameStyle } from "@/lib/frame";
import { lockScroll } from "@/lib/scrollLock";

const ZOOM = 2.2;

/**
 * The artwork, as the hero of its page: shown whole at its true proportions (never cropped), on a dark mat.
 * Click, tap or press Enter to open it large — then click again (or use +/−) to zoom in and scroll around the surface.
 * Esc closes and returns focus to the image.
 */
export default function ArtworkViewer({
  src,
  alt,
  title,
  width,
  height,
}: {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
}) {
  const [open, setOpen] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }, []);

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="view"
        aria-label={`View ${title} larger`}
        aria-haspopup="dialog"
        className="group relative block w-full cursor-zoom-in bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
      >
        <span
          className="flex h-[min(72svh,880px)] w-full items-center justify-center p-3 md:p-6"
          style={{ containerType: "size" }}
        >
          <span className="relative block" style={frameStyle(width, height)}>
            <Image
              src={src}
              alt={alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-contain shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)]"
            />
          </span>
        </span>
        <span className="label-mono pointer-events-none absolute bottom-3 right-4 text-ivory/60 transition-opacity group-hover:text-ivory">
          Enlarge +
        </span>
      </button>
      {open && <Lightbox src={src} alt={alt} title={title} onClose={close} />}
    </>
  );
}

function Lightbox({ src, alt, title, onClose }: { src: string; alt: string; title: string; onClose: () => void }) {
  const [zoomed, setZoomed] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const release = lockScroll();
    closeBtn.current?.focus({ preventScroll: true });
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") setZoomed(true);
      else if (e.key === "-" || e.key === "_") setZoomed(false);
      else if (e.key === "Tab" && dialog.current) {
        const f = Array.from(dialog.current.querySelectorAll<HTMLElement>("button:not([disabled])"));
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      release();
    };
  }, [onClose]);

  // when zooming in, start at the middle of the surface
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoomed]);

  const btn =
    "label-mono grid h-11 min-w-11 place-items-center px-3 text-ivory/80 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}, enlarged`}
      className="fixed inset-0 z-[90] bg-[#0b0a09]"
    >
      <div ref={scroller} className="absolute inset-0 overflow-auto overscroll-contain">
        <div
          className="relative"
          style={{ width: zoomed ? `${ZOOM * 100}%` : "100%", height: zoomed ? `${ZOOM * 100}%` : "100%", minHeight: "100%" }}
        >
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            aria-label={zoomed ? "Zoom out" : "Zoom in"}
            className={`absolute inset-0 ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"} focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold`}
          >
            <Image src={src} alt={alt} fill sizes="100vw" className="object-contain p-4 md:p-10" />
          </button>
        </div>
      </div>
      <div className="pointer-events-none fixed inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-3 pb-8 pt-3 md:px-6">
        <p className="label-mono pointer-events-auto truncate text-ivory/70">{title}</p>
        <div className="pointer-events-auto flex items-center">
          <button type="button" onClick={() => setZoomed(false)} aria-label="Zoom out" disabled={!zoomed} className={`${btn} disabled:opacity-30`}>
            <span aria-hidden="true">−</span>
          </button>
          <button type="button" onClick={() => setZoomed(true)} aria-label="Zoom in" disabled={zoomed} className={`${btn} disabled:opacity-30`}>
            <span aria-hidden="true">+</span>
          </button>
          <button ref={closeBtn} type="button" onClick={onClose} aria-label="Close" className={btn}>
            Close <span aria-hidden="true" className="ml-2">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
