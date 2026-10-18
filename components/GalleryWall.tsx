"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { Artist, Artwork } from "@/lib/types";

type Item = { artwork: Artwork; artist: Artist };

const AUTO_MS = 4200;
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2];

export default function GalleryWall({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const timerRef = useRef<number | null>(null);
  const n = items.length;

  const advance = useCallback((dir: 1 | -1) => {
    setIndex((i) => (i + dir + n) % n);
  }, [n]);

  useEffect(() => {
    if (reduced || paused || n < 2) return;
    timerRef.current = window.setInterval(() => advance(1), AUTO_MS);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [reduced, paused, advance, n]);

  const current = items[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[52vh] md:h-[72vh] overflow-hidden">
        {VISIBLE_OFFSETS.map((offset) => {
          const i = (index + offset + n) % n;
          const it = items[i];
          if (!it) return null;
          const isCenter = offset === 0;
          const abs = Math.abs(offset);
          const leftPct = 50 + offset * 27;
          const scale = isCenter ? 1 : abs === 1 ? 0.68 : 0.5;
          const opacity = isCenter ? 1 : abs === 1 ? 0.55 : 0.22;

          return (
            <motion.div
              key={it.artwork.id}
              className={`absolute top-1/2 ${abs === 2 ? "hidden md:block" : ""}`}
              style={{ zIndex: 10 - abs }}
              animate={{
                left: `${leftPct}%`,
                y: "-50%",
                x: "-50%",
                scale,
                opacity,
              }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 }}
            >
              <Link
                href={`/gallery/${it.artwork.slug}`}
                data-cursor="view"
                aria-label={`View ${it.artwork.title} by ${it.artist.name}`}
                tabIndex={isCenter ? 0 : -1}
                className="block relative overflow-hidden group"
                style={{ width: "min(62vw, 420px)", aspectRatio: "3/4" }}
              >
                <Image
                  src={it.artwork.image}
                  alt={it.artwork.title}
                  fill
                  sizes="(max-width: 768px) 62vw, 420px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  priority={isCenter}
                />
                {isCenter && <div className="absolute inset-0 ring-1 ring-ivory/15" />}
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* label + controls */}
      <div className="flex items-center justify-between px-6 md:px-10 mt-6">
        <button
          onClick={() => advance(-1)}
          aria-label="Previous artwork"
          className="label-mono text-ivory/50 hover:text-ivory transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold px-2 py-1"
        >
          ← PREV
        </button>

        <Link
          href={`/gallery/${current.artwork.slug}`}
          className="text-center hover:text-gold transition-colors"
          data-cursor="view"
        >
          <p className="font-editorial text-xl md:text-2xl">{current.artwork.title}</p>
          <p className="label-mono text-ivory/40 mt-1">{current.artist.name}</p>
        </Link>

        <button
          onClick={() => advance(1)}
          aria-label="Next artwork"
          className="label-mono text-ivory/50 hover:text-ivory transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold px-2 py-1"
        >
          NEXT →
        </button>
      </div>
    </div>
  );
}
