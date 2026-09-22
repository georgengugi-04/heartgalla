"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { artworks, artists, collections } from "@/lib/data";

export default function GalleryGrid() {
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      artworks.filter(
        (a) =>
          (!artistFilter || a.artistId === artistFilter) &&
          (!collectionFilter || a.collection === collectionFilter)
      ),
    [artistFilter, collectionFilter]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-x-8 gap-y-3 mb-14 label-mono">
        <div className="flex gap-3 flex-wrap">
          <span className="opacity-40">ARTIST</span>
          <button onClick={() => setArtistFilter(null)} className={artistFilter === null ? "text-gold" : "opacity-60"}>All</button>
          {artists.map((a) => (
            <button key={a.id} onClick={() => setArtistFilter(a.id)} className={artistFilter === a.id ? "text-gold" : "opacity-60"}>
              {a.name.split(" ")[0]}
            </button>
          ))}
        </div>
        <div className="flex gap-3 flex-wrap">
          <span className="opacity-40">COLLECTION</span>
          <button onClick={() => setCollectionFilter(null)} className={collectionFilter === null ? "text-gold" : "opacity-60"}>All</button>
          {collections.map((c) => (
            <button key={c} onClick={() => setCollectionFilter(c)} className={collectionFilter === c ? "text-gold" : "opacity-60"}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="columns-2 md:columns-3 gap-4 [column-fill:balance]">
        <AnimatePresence>
          {filtered.map((a) => {
            const artist = artists.find((ar) => ar.id === a.artistId)!;
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-4 break-inside-avoid"
              >
                <Link href={`/gallery/${a.slug}`} data-cursor="view" className="group block relative overflow-hidden">
                  <img src={a.image} alt={a.title} className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="font-editorial text-lg">{a.title}</p>
                    <p className="label-mono opacity-70">{artist.name} · {a.price ? `KES ${a.price.toLocaleString()}` : "Price on request"}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
