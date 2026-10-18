"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { artworks, artists, collections } from "@/lib/data";
import { balancedOrder } from "@/lib/balance";

// "All" shows the artists side by side in their shares, not one artist's whole run first.
const ORDERED = balancedOrder(artworks);

type Dims = Record<string, { width: number; height: number }>;

const chip =
  "label-mono inline-flex min-h-11 items-center rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold";

function Filter({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`${chip} ${active ? "border-gold text-gold" : "border-ivory/25 text-ivory/80 hover:border-ivory/60 hover:text-ivory"}`}>
      {children}
    </button>
  );
}

export default function GalleryGrid({ dims }: { dims: Dims }) {
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  const [collectionFilter, setCollectionFilter] = useState<string | null>(null);

  const filtered = useMemo(
    () => ORDERED.filter((a) => (!artistFilter || a.artistId === artistFilter) && (!collectionFilter || a.collection === collectionFilter)),
    [artistFilter, collectionFilter],
  );
  const filtering = artistFilter !== null || collectionFilter !== null;

  return (
    <div>
      <div className="mb-10 flex flex-col gap-5">
        <div role="group" aria-labelledby="f-artist" className="flex flex-wrap items-center gap-2">
          <span id="f-artist" className="label-mono mr-2 text-ivory/60">ARTIST</span>
          <Filter active={artistFilter === null} onClick={() => setArtistFilter(null)}>All</Filter>
          {artists.map((a) => (
            <Filter key={a.id} active={artistFilter === a.id} onClick={() => setArtistFilter(a.id)}>{a.name.split(" ")[0]}</Filter>
          ))}
        </div>
        <div role="group" aria-labelledby="f-collection" className="flex flex-wrap items-center gap-2">
          <span id="f-collection" className="label-mono mr-2 text-ivory/60">COLLECTION</span>
          <Filter active={collectionFilter === null} onClick={() => setCollectionFilter(null)}>All</Filter>
          {collections.map((c) => (
            <Filter key={c} active={collectionFilter === c} onClick={() => setCollectionFilter(c)}>{c}</Filter>
          ))}
        </div>
        <p className="label-mono text-ivory/60" role="status" aria-live="polite">
          {filtered.length} work{filtered.length === 1 ? "" : "s"}
          {filtering && (
            <>
              {" · "}
              <button type="button" onClick={() => { setArtistFilter(null); setCollectionFilter(null); }} className="underline underline-offset-4 hover:text-ivory">
                clear filters
              </button>
            </>
          )}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="border border-ivory/15 px-6 py-16 text-center">
          <p className="mb-2 font-editorial text-2xl">Nothing in that combination — yet.</p>
          <p className="mb-6 text-ivory/70">Try another artist or collection.</p>
          <button type="button" onClick={() => { setArtistFilter(null); setCollectionFilter(null); }} className={`${chip} border-gold text-gold`}>SHOW ALL WORKS</button>
        </div>
      ) : (
        <ul className="columns-2 gap-4 md:columns-3 md:gap-6 [column-fill:balance]">
          <AnimatePresence>
            {filtered.map((a, i) => {
              const artist = artists.find((ar) => ar.id === a.artistId)!;
              const d = dims[a.slug] ?? { width: 4, height: 5 };
              return (
                <motion.li key={a.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-8 break-inside-avoid">
                  <Link href={`/gallery/${a.slug}`} data-cursor="view" className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
                    <span className="relative block overflow-hidden bg-black/25">
                      <Image
                        src={a.image}
                        alt=""
                        width={d.width}
                        height={d.height}
                        sizes="(max-width: 768px) 50vw, 33vw"
                        priority={i < 4}
                        className="h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </span>
                    <span className="mt-3 block font-editorial text-xl leading-tight">{a.title}</span>
                    <span className="label-mono mt-1 block text-ivory/60">
                      {artist.name}
                      {a.medium ? ` · ${a.medium}` : ""}
                    </span>
                    {a.availability === "sold" && <span className="label-mono mt-1 block text-gold">SOLD</span>}
                  </Link>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}
