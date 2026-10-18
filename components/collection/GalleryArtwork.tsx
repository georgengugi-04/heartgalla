"use client";
import Image from "next/image";
import { useState } from "react";
import { motion } from "motion/react";
import type { CollectionItem } from "@/lib/collection";
import { ARTWORK_SIZES, EASE_OUT, frameStyle } from "@/lib/frame";

/**
 * The current artwork. A button, because clicking it opens the expanded view.
 * It sits in a box with the artwork's exact aspect ratio (see lib/frame.ts) so the
 * piece is never cropped and never shifts the layout while loading.
 * `--edge` is set by the stage: the width reserved on each side for the neighbours.
 */
export function GalleryArtwork({
  item,
  hidden,
  onOpen,
  buttonRef,
}: {
  item: CollectionItem;
  hidden: boolean;
  onOpen: () => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <button
      type="button"
      ref={buttonRef}
      onClick={onOpen}
      data-cursor="view"
      aria-label={`Expand ${item.title} by ${item.artist}`}
      style={{
        ...frameStyle(item.width, item.height, { maxWidth: "calc(100cqw - 2 * var(--edge))" }),
        opacity: hidden ? 0 : 1,
      }}
      className="group relative block cursor-pointer shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)] transition-transform duration-[1400ms] ease-out hover:scale-[1.012] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-gold"
    >
      {failed ? (
        <span className="absolute inset-0 flex items-center justify-center border border-ivory/15 bg-ivory/[0.03] p-6 text-center font-editorial text-lg text-ivory/60">
          {item.title}
        </span>
      ) : (
        <Image
          src={item.image}
          alt={`${item.title} by ${item.artist}`}
          fill
          sizes={ARTWORK_SIZES}
          draggable={false}
          onError={() => setFailed(true)}
          className="object-contain"
        />
      )}
    </button>
  );
}

/**
 * A partly visible neighbouring work at the edge of the stage. Deliberately quiet:
 * dimmed, smaller than the current work, and cropped by the edge, so it says
 * "there is more" without becoming a shopping-carousel thumbnail.
 */
export function GalleryNeighbour({
  item,
  side,
  onSelect,
}: {
  item: CollectionItem;
  side: "prev" | "next";
  onSelect: () => void;
}) {
  const next = side === "next";
  return (
    <motion.button
      key={item.id}
      type="button"
      onClick={onSelect}
      aria-label={`${next ? "Next" : "Previous"} artwork: ${item.title}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      whileHover={{ opacity: 0.6 }}
      transition={{ duration: 0.9, delay: 0.25, ease: EASE_OUT }}
      className={`absolute inset-y-0 z-10 cursor-pointer overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${
        next ? "right-0" : "left-0"
      }`}
      style={{ width: "var(--edge)" }}
    >
      <span
        aria-hidden="true"
        className={`absolute top-1/2 block -translate-y-1/2 ${next ? "left-0" : "right-0"}`}
        style={frameStyle(item.width, item.height, { height: 58, maxWidth: "60cqw" })}
      >
        <Image src={item.image} alt="" fill sizes={ARTWORK_SIZES} draggable={false} className="object-contain" />
      </span>
    </motion.button>
  );
}
