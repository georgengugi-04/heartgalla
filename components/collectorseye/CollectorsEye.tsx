"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { CollectionItem } from "@/lib/collection";
import { ARTWORK_SIZES, EASE_OUT, frameStyle } from "@/lib/frame";
import { usePrefersReducedMotion } from "@/lib/hooks";

type Pair = [CollectionItem, CollectionItem];

/**
 * EXPERIMENT 04 — THE COLLECTOR'S EYE
 * Eight A/B rounds: choose the piece you'd rather live with. The ending is a plain tally — which artist's
 * work you chose most — and a link to start looking there. It counts; it doesn't diagnose.
 * No titles are shown while choosing: you pick by eye, and the names come after.
 */
export default function CollectorsEye({ pairs }: { pairs: Pair[] }) {
  const reduced = usePrefersReducedMotion();
  const [round, setRound] = useState(0);
  const [picks, setPicks] = useState<CollectionItem[]>([]);
  const [chosen, setChosen] = useState<0 | 1 | null>(null);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const total = pairs.length;
  const done = total > 0 && round >= total;

  function pick(side: 0 | 1) {
    if (chosen !== null || done) return;
    setChosen(side);
    const work = pairs[round][side];
    timer.current = window.setTimeout(
      () => {
        setPicks((p) => [...p, work]);
        setRound((r) => r + 1);
        setChosen(null);
      },
      reduced ? 120 : 650,
    );
  }

  function restart() {
    window.clearTimeout(timer.current);
    setRound(0);
    setPicks([]);
    setChosen(null);
  }

  // the tally, by artist
  const tally = new Map<string, { name: string; href: string; works: CollectionItem[] }>();
  for (const w of picks) {
    const t = tally.get(w.artistHref) ?? { name: w.artist, href: w.artistHref, works: [] };
    t.works.push(w);
    tally.set(w.artistHref, t);
  }
  const ranked = [...tally.values()].sort((a, b) => b.works.length - a.works.length);
  const top = ranked.filter((r) => r.works.length === ranked[0]?.works.length);

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10">
      <div className="px-6 md:px-10 mb-12 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 04</span>
          <span>·</span><span>TASTE</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">THE COLLECTOR&apos;S EYE</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-md mx-auto">
          Eight honest picks. One real place to start looking.
        </p>
      </div>

      {total === 0 ? (
        <p className="px-6 text-center font-editorial text-xl text-ivory/60">
          The rounds are being prepared — check back soon.
        </p>
      ) : !done ? (
        <div className="px-4 md:px-10">
          <p className="label-mono text-ivory/60 text-center mb-6" aria-live="polite">
            <span className="text-ivory">{round + 1} / {total}</span> — CHOOSE THE ONE YOU&apos;D LIVE WITH
          </p>
          <div
            role="group"
            aria-label={`Round ${round + 1} of ${total}: choose the piece you would rather live with`}
            className="mx-auto grid max-w-5xl grid-cols-2 gap-3 md:gap-8"
            onKeyDown={(e) => {
              if (e.key === "1" || e.key === "ArrowLeft") pick(0);
              else if (e.key === "2" || e.key === "ArrowRight") pick(1);
            }}
          >
            {[0, 1].map((side) => {
              const w = pairs[round][side as 0 | 1];
              const isChosen = chosen === side;
              const other = chosen !== null && !isChosen;
              return (
                <button
                  key={`${round}-${side}`}
                  type="button"
                  onClick={() => pick(side as 0 | 1)}
                  disabled={chosen !== null}
                  data-cursor="view"
                  aria-label={`Choose piece ${side === 0 ? "A" : "B"}`}
                  className="group relative block h-[min(52svh,520px)] w-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                  style={{ containerType: "size" }}
                >
                  <motion.span
                    key={`${round}-${side}`}
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                    animate={{
                      opacity: other ? 0.18 : 1,
                      y: 0,
                      scale: isChosen && !reduced ? 1.025 : 1,
                    }}
                    transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE_OUT }}
                  >
                    <span
                      className={`relative block shadow-[0_40px_90px_-40px_rgba(0,0,0,0.9)] transition-[outline-color] ${
                        isChosen ? "outline outline-2 outline-offset-6 outline-gold" : ""
                      }`}
                      style={frameStyle(w.width, w.height)}
                    >
                      <Image src={w.image} alt="" fill sizes={ARTWORK_SIZES} draggable={false} className="object-contain" />
                    </span>
                  </motion.span>
                  <span className="label-mono absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full pt-3 text-ivory/40 group-hover:text-ivory/80">
                    {side === 0 ? "A" : "B"}
                  </span>
                </button>
              );
            })}
          </div>
          {/* thin progress: eight ticks */}
          <div className="mx-auto mt-16 flex max-w-xs items-center gap-1.5" aria-hidden="true">
            {pairs.map((_, i) => (
              <span key={i} className={`h-px flex-1 ${i < round ? "bg-gold" : i === round ? "bg-ivory" : "bg-ivory/20"}`} />
            ))}
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            key="result"
            className="mx-auto max-w-3xl px-6 text-center md:px-10"
            initial={{ opacity: 0, y: reduced ? 0 : 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0.15 : 0.9, ease: EASE_OUT }}
          >
            <p className="label-mono text-gold mb-5">YOUR EIGHT PICKS POINT HERE</p>
            <h3 className="font-editorial text-4xl md:text-6xl leading-[1.02]">
              {top.length === 1 ? (
                <>Start with {top[0].name}.</>
              ) : (
                <>
                  A tie:
                  <br />
                  {top.map((t) => t.name).join(" or ")}.
                </>
              )}
            </h3>
            <p className="mx-auto mt-6 max-w-lg text-ivory/60">
              {ranked.map((r) => `${r.works.length} by ${r.name}`).join(" · ")}. It only counts whose work you chose
              most — a place to start looking, not a verdict on your taste.
            </p>

            <ul className="mt-10 flex flex-wrap items-end justify-center gap-4" aria-label="The works you chose">
              {picks.map((w, i) => (
                <li key={`${w.id}-${i}`}>
                  <Link
                    href={w.href}
                    aria-label={`A work by ${w.artist} that you chose`}
                    data-cursor="view"
                    className={`relative block h-24 md:h-32 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold ${
                      top.some((t) => t.href === w.artistHref) ? "opacity-100" : "opacity-35 hover:opacity-80"
                    }`}
                    style={{ aspectRatio: `${w.width} / ${w.height}` }}
                  >
                    <Image src={w.image} alt="" fill sizes="160px" className="object-contain" />
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {top.map((t) => (
                <Link
                  key={t.href}
                  href={t.href}
                  data-cursor="view"
                  className="label-mono rounded-full border border-gold px-6 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
                >
                  MEET {t.name.toUpperCase()} →
                </Link>
              ))}
              <button
                type="button"
                onClick={restart}
                className="label-mono rounded-full border border-ivory/40 px-6 py-3 transition-colors hover:border-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
              >
                ↺ PICK AGAIN
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}
