"use client";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { EASE_OUT } from "@/lib/frame";
import type { DialogueWork } from "./session";

const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }, // layers retract in reverse
};
const line: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE_OUT } },
  exit: { opacity: 0, y: 10, transition: { duration: 0.35 } },
};
const lineReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * REVEAL. Only now does the work's own information appear — and only what exists: a missing
 * field is simply left out. Observation and story stay separate: "The work" is EARTGALLA's
 * description of what is visible; "The story" is the artist's confirmed profile.
 */
export default function ArtworkStory({
  work,
  reduced,
  onReturn,
}: {
  work: DialogueWork;
  reduced: boolean;
  onReturn: () => void;
}) {
  const v = reduced ? lineReduced : line;
  const facts = [
    ["Medium", work.medium],
    ["Year", work.year],
    ["Dimensions", work.dimensions],
    ["Collection", work.collection],
  ].filter(([, val]) => val !== null && val !== undefined && String(val).trim() !== "");

  return (
    <motion.div
      id="dialogue-reveal"
      variants={group}
      initial="hidden"
      animate="show"
      exit="exit"
      className="mx-auto mt-16 max-w-5xl scroll-mt-24 border-t border-ivory/15 px-1 pt-12 md:mt-24 md:pt-16"
    >
      <motion.p variants={v} className="eg-meta text-gold">
        The work
      </motion.p>
      <div className="mt-6 grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
        <div>
          <motion.p variants={v} className="text-base text-ivory/70">
            <Link
              href={work.artistHref}
              className="border-b border-ivory/30 pb-0.5 transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {work.artist}
            </Link>
          </motion.p>
          <motion.h3 variants={v} className="mt-3 font-editorial text-4xl leading-[1.02] md:text-6xl">
            {work.title}
          </motion.h3>
          {facts.length > 0 && (
            <motion.dl variants={v} className="mt-7 grid max-w-sm grid-cols-[auto_1fr] gap-x-8 gap-y-2 text-sm">
              {facts.map(([k, val]) => (
                <div key={String(k)} className="contents">
                  <dt className="eg-meta text-ivory/40">{k}</dt>
                  <dd className="text-ivory/85">{String(val)}</dd>
                </div>
              ))}
            </motion.dl>
          )}
        </div>

        <div className="space-y-9">
          {work.description && (
            <motion.div variants={v}>
              <p className="eg-meta text-ivory/40">Described by EARTGALLA</p>
              <p className="mt-3 font-editorial text-xl leading-relaxed text-ivory/90">{work.description}</p>
            </motion.div>
          )}
          {work.artistBio && (
            <motion.div variants={v}>
              <p className="eg-meta text-gold">The story</p>
              <p className="mt-3 text-base leading-relaxed text-ivory/75">{work.artistBio}</p>
              <p className="eg-meta mt-3 text-ivory/40">About {work.artist}</p>
            </motion.div>
          )}
        </div>
      </div>

      <motion.div variants={v} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-2">
        <Link
          href={work.href}
          className="eg-meta inline-flex min-h-11 items-center border-b border-ivory/40 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          View artwork →
        </Link>
        <button
          type="button"
          onClick={onReturn}
          className="eg-meta min-h-11 text-ivory/60 transition-colors hover:text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ← Return to artwork
        </button>
      </motion.div>
    </motion.div>
  );
}
