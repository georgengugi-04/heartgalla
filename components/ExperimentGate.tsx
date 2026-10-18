"use client";
import { useState } from "react";

export default function ExperimentGate({
  id,
  number,
  category,
  title,
  tagline,
  children,
}: {
  id?: string;
  number: string;
  category: string;
  title: string;
  tagline: string;
  children: React.ReactNode;
}) {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  return (
    <section id={id} className="py-16 md:py-24 border-t border-ivory/10 text-center scroll-mt-16">
      <div className="px-6 md:px-10 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT {number}</span>
          <span>·</span><span>{category}</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">{title}</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto mb-10">{tagline}</p>
        <button
          onClick={() => setRevealed(true)}
          data-cursor="style"
          className="label-mono border border-gold text-gold rounded-full px-8 py-4 hover:bg-gold hover:text-charcoal transition-colors"
        >
          OPEN {title.toUpperCase()} →
        </button>
      </div>
    </section>
  );
}
