"use client";
import { motion, useReducedMotion } from "motion/react";

export type ArchiveItem = {
  id: string; slug: string; image: string; title: string; artist: string; location: string; story: string | null;
};

const OFFSETS = [
  { x: "0%", y: "0%", scale: 1.15, z: 3 },
  { x: "-92%", y: "-38%", scale: 0.72, z: 2 },
  { x: "88%", y: "-30%", scale: 0.68, z: 2 },
  { x: "-70%", y: "62%", scale: 0.6, z: 1 },
  { x: "78%", y: "58%", scale: 0.64, z: 1 },
  { x: "-4%", y: "-92%", scale: 0.55, z: 1 },
  { x: "8%", y: "96%", scale: 0.58, z: 1 },
  { x: "-150%", y: "10%", scale: 0.5, z: 0 },
  { x: "148%", y: "6%", scale: 0.5, z: 0 },
  { x: "-130%", y: "-78%", scale: 0.45, z: 0 },
  { x: "128%", y: "-82%", scale: 0.45, z: 0 },
  { x: "0%", y: "148%", scale: 0.42, z: 0 },
];

export default function ArchiveGallery({
  items,
  onSelect,
}: {
  items: ArchiveItem[];
  onSelect: (item: ArchiveItem, index: number) => void;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div className="px-6 md:px-10 grid grid-cols-3 md:grid-cols-6 gap-3">
        {items.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onSelect(item, i)}
            data-cursor="view"
            aria-label={`Open ${item.title}`}
            className="aspect-[4/5] overflow-hidden rounded-sm border border-ivory/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative h-[520px] md:h-[620px] flex items-center justify-center">
      {items.slice(0, OFFSETS.length).map((item, i) => {
        const o = OFFSETS[i];
        return (
          <motion.button
            key={item.id}
            onClick={() => onSelect(item, i)}
            data-cursor="view"
            aria-label={`Open ${item.title}`}
            className="absolute w-32 md:w-44 aspect-[4/5] rounded-sm overflow-hidden border border-ivory/10 shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            style={{ zIndex: o.z }}
            initial={{ opacity: 0, x: "0%", y: "0%", scale: 0.3 }}
            animate={{ opacity: 1, x: o.x, y: o.y, scale: o.scale }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: o.scale * 1.08, zIndex: 10 }}
          >
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          </motion.button>
        );
      })}
    </div>
  );
}
