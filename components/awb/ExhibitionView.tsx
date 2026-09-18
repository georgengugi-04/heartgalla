"use client";
import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import type { ArchiveItem } from "./ArchiveGallery";

export default function ExhibitionView({
  items,
  index,
  onIndexChange,
  onClose,
}: {
  items: ArchiveItem[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const item = items[index];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndexChange((index + 1) % items.length);
      if (e.key === "ArrowLeft") onIndexChange((index - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, items.length, onIndexChange, onClose]);

  if (!item) return null;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${item.title}, exhibition view`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] bg-charcoal/97 backdrop-blur-md flex flex-col md:flex-row"
    >
      <button
        onClick={onClose}
        aria-label="Close exhibition view"
        className="absolute top-6 right-6 z-10 label-mono text-ivory/60 hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm px-2 py-1"
      >
        CLOSE ✕
      </button>

      <div className="relative flex-1 flex items-center justify-center p-6 md:p-12 min-h-[45vh]">
        <AnimatePresence mode="wait">
          <motion.img
            key={item.id}
            src={item.image}
            alt={item.title}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-full max-h-full object-contain shadow-2xl"
          />
        </AnimatePresence>

        <button
          onClick={() => onIndexChange((index - 1 + items.length) % items.length)}
          aria-label="Previous artwork"
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 label-mono text-ivory/50 hover:text-ivory text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm px-2"
        >
          ←
        </button>
        <button
          onClick={() => onIndexChange((index + 1) % items.length)}
          aria-label="Next artwork"
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 label-mono text-ivory/50 hover:text-ivory text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm px-2"
        >
          →
        </button>
      </div>

      <div className="w-full md:w-96 p-8 md:p-10 flex flex-col justify-center border-t md:border-t-0 md:border-l border-ivory/10">
        <p className="label-mono text-gold mb-3">{String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
        <h2 className="font-editorial text-2xl md:text-3xl mb-3">{item.title}</h2>
        <p className="text-ivory/70 mb-1">{item.artist}</p>
        <p className="label-mono text-ivory/40 mb-6">{item.location}</p>
        {item.story ? (
          <p className="text-ivory/60 leading-relaxed">{item.story}</p>
        ) : (
          <p className="text-ivory/40 italic">The story behind this piece has not been published yet.</p>
        )}
        <p className="label-mono text-ivory/30 mt-10">USE ← → TO DISCOVER MORE</p>
      </div>
    </motion.div>
  );
}
