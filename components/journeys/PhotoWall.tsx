"use client";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { Photo } from "@/lib/journeys/types";

/**
 * A mosaic of photos. Click or press Enter on any photo to see it large, with its credit;
 * arrow keys move between photos and Esc closes (the browser's own <dialog> handles focus and Esc).
 */
export default function PhotoWall({ photos, label }: { photos: Photo[]; label: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(0);
  const show = useCallback((i: number) => { setOpen(i); dialog.current?.showModal(); }, []);
  const step = (d: number) => setOpen((o) => (o + d + photos.length) % photos.length);
  if (photos.length === 0) return null;
  const cur = photos[open];
  return (
    <div className="jr-wall">
      <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 md:grid-cols-4 md:gap-3" aria-label={label}>
        {photos.map((p, i) => {
          const big = i === 0 || i % 7 === 3;
          return (
            <li key={p.src} className={big ? "col-span-2 row-span-2" : ""}>
              <button type="button" onClick={() => show(i)} aria-label={`View larger: ${p.alt}`} className="group relative block h-full min-h-40 w-full overflow-hidden bg-ivory/5 md:min-h-56">
                <Image src={p.src} alt="" fill sizes={big ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"} className="object-cover transition-transform duration-700 group-hover:scale-[1.06]" />
                <span aria-hidden className="absolute inset-0 bg-charcoal/0 transition-colors group-hover:bg-charcoal/25" />
              </button>
            </li>
          );
        })}
      </ul>
      <dialog
        ref={dialog}
        data-theme="dark"
        aria-label={cur.alt}
        onClick={(e) => { if (e.target === dialog.current) dialog.current?.close(); }}
        onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}
        className="m-auto max-h-[92svh] w-[min(96vw,72rem)] border-0 bg-transparent p-0 text-ivory"
      >
        <figure className="m-0">
          <Image src={cur.src} alt={cur.alt} width={cur.width} height={cur.height} sizes="96vw" className="max-h-[78svh] w-full object-contain" />
          <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span><span className="block">{cur.alt}</span><span className="label-mono block text-[0.65rem] text-ivory/50">{cur.credit}</span></span>
            <span className="flex gap-2">
              <button type="button" onClick={() => step(-1)} className="label-mono min-h-11 rounded-full border border-ivory/30 px-5 hover:border-gold">Previous</button>
              <button type="button" onClick={() => step(1)} className="label-mono min-h-11 rounded-full border border-ivory/30 px-5 hover:border-gold">Next</button>
              <button type="button" onClick={() => dialog.current?.close()} className="label-mono min-h-11 rounded-full bg-gold px-5 text-charcoal hover:bg-ivory">Close</button>
            </span>
          </figcaption>
        </figure>
      </dialog>
    </div>
  );
}
