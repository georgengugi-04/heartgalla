"use client";
import { motion } from "motion/react";
import Link from "next/link";
import type { DialogueWork } from "@/lib/collection";

export default function ArtworkStory({ work, reducedMotion }: { work: DialogueWork; reducedMotion: boolean }) {
  const facts = [
    work.medium && { label: "Medium", value: work.medium },
    work.year && { label: "Year", value: String(work.year) },
    work.dimensions && { label: "Dimensions", value: work.dimensions },
    work.collection && { label: "Collection", value: work.collection },
  ].filter((f): f is { label: string; value: string } => Boolean(f));

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.5 }}
      className="eg-meta max-w-2xl mx-auto mt-14 px-6 md:px-0"
    >
      <p className="label-mono text-ivory/40 mb-2">
        <Link href={work.artistHref} className="hover:text-gold transition-colors underline underline-offset-4">
          {work.artistName}
        </Link>
      </p>
      <h3 className="font-editorial text-3xl md:text-4xl mb-6">{work.title}</h3>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 mb-8 label-mono text-sm">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="text-ivory/40">{f.label.toUpperCase()}</dt>
              <dd className="text-ivory/80 mt-0.5">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {work.description && (
        <div className="mb-8">
          <p className="label-mono text-ivory/40 mb-2">Described by EARTGALLA</p>
          <p className="font-editorial text-lg text-ivory/85 leading-relaxed">{work.description}</p>
        </div>
      )}

      {work.artistBio && (
        <div className="mb-8">
          <p className="label-mono text-ivory/40 mb-2">The story — About {work.artistName}</p>
          <p className="text-ivory/70 leading-relaxed">{work.artistBio}</p>
        </div>
      )}

      <Link
        href={work.href}
        data-cursor="view"
        className="label-mono border border-ivory/40 rounded-full px-6 py-3 inline-block hover:border-gold hover:text-gold transition-colors"
      >
        View artwork →
      </Link>
    </motion.div>
  );
}
