"use client";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import { artworks, artists } from "@/lib/data";

// curated contrasts — spans artist, collection and subject each round so the
// tally actually means something by round 8, not just "clicked the same side"
const PAIR_SLUGS: [string, string][] = [
  ["happiness", "unbound"],
  ["guardians-of-the-plain", "the-royals"],
  ["mountain-solitude", "faces-of-africa"],
  ["the-spearman", "the-orator"],
  ["bloom-beneath-the-surface", "queen-of-hearts"],
  ["tiger-in-frost", "currents"],
  ["two-skies", "five-of-clubs"],
  ["crowned-in-red", "golden-gaze"],
];

const PAIRS = PAIR_SLUGS.map(
  ([a, b]) =>
    [artworks.find((x) => x.slug === a)!, artworks.find((x) => x.slug === b)!] as const
).filter(([a, b]) => a && b);

export default function CollectorsEye() {
  const [round, setRound] = useState(0);
  const [artistTally, setArtistTally] = useState<Record<string, number>>({});
  const [collectionTally, setCollectionTally] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);
  const reduced = useReducedMotion();

  const total = PAIRS.length;

  const result = useMemo(() => {
    if (!done) return null;
    const topArtistId = Object.entries(artistTally).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCollection = Object.entries(collectionTally).sort((a, b) => b[1] - a[1])[0]?.[0];
    const artist = artists.find((a) => a.id === topArtistId);

    const pool = artworks.filter(
      (a) => a.artistId === topArtistId || a.collection === topCollection
    );
    const featuredFirst = [...pool].sort((a, b) => Number(b.featured) - Number(a.featured));
    const picks = featuredFirst.slice(0, 3);

    return { artist, collection: topCollection, picks };
  }, [done, artistTally, collectionTally]);

  function choose(pick: (typeof artworks)[number]) {
    setArtistTally((prev) => ({ ...prev, [pick.artistId]: (prev[pick.artistId] ?? 0) + 1 }));
    if (pick.collection) {
      setCollectionTally((prev) => ({ ...prev, [pick.collection!]: (prev[pick.collection!] ?? 0) + 1 }));
    }
    if (round + 1 >= total) {
      setDone(true);
    } else {
      setRound((r) => r + 1);
    }
  }

  function restart() {
    setRound(0);
    setArtistTally({});
    setCollectionTally({});
    setDone(false);
  }

  const pair = PAIRS[round];

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 08</span>
          <span>·</span><span>TASTE</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE COLLECTOR&apos;S EYE</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto">
          Eight honest picks. One real place to start looking.
        </p>
      </div>

      <div className="px-6 md:px-10 max-w-3xl mx-auto">
        {!done && (
          <>
            <div className="flex items-center justify-center gap-2 mb-10">
              {PAIRS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${
                    i === round ? "w-8 bg-gold" : i < round ? "w-4 bg-gold/40" : "w-4 bg-ivory/15"
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={round}
                initial={reduced ? {} : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? {} : { opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-2 gap-3 md:gap-6"
              >
                {pair.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => choose(art)}
                    data-cursor="style"
                    aria-label={`Choose ${art.title}`}
                    className="relative overflow-hidden group focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                    style={{ aspectRatio: "3/4" }}
                  >
                    <Image
                      src={art.image}
                      alt={art.title}
                      fill
                      sizes="(max-width: 768px) 45vw, 320px"
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/20 transition-colors" />
                  </button>
                ))}
              </motion.div>
            </AnimatePresence>

            <p className="label-mono text-ivory/35 text-center mt-8">
              {round + 1} / {total} — CHOOSE THE ONE YOU&apos;D LIVE WITH
            </p>
          </>
        )}

        {done && result && (
          <motion.div
            initial={reduced ? {} : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p className="label-mono text-ivory/40 mb-3">YOUR EYE LEANS TOWARD</p>
            <h3 className="font-editorial text-3xl md:text-4xl mb-2">
              {result.artist?.name ?? "the EARTGALLA roster"}
            </h3>
            {result.collection && (
              <p className="text-ivory/60 mb-10">
                particularly the <span className="text-gold">{result.collection}</span> collection
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 md:gap-4 mb-10">
              {result.picks.map((p) => (
                <Link
                  href={`/gallery/${p.slug}`}
                  key={p.id}
                  data-cursor="view"
                  className="relative overflow-hidden group block"
                  style={{ aspectRatio: "3/4" }}
                >
                  <Image
                    src={p.image}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 30vw, 200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              {result.artist && (
                <Link
                  href={`/artists/${result.artist.slug}`}
                  data-cursor="view"
                  className="label-mono border border-gold text-gold rounded-full px-6 py-3 hover:bg-gold hover:text-charcoal transition-colors"
                >
                  VIEW {result.artist.name.toUpperCase()} →
                </Link>
              )}
              <button
                onClick={restart}
                className="label-mono border border-ivory/40 rounded-full px-6 py-3 hover:border-ivory transition-colors"
              >
                PLAY AGAIN
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
