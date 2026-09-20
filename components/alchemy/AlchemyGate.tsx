"use client";
import { useState } from "react";
import ArtAlchemy from "@/components/alchemy/ArtAlchemy";

export default function AlchemyGate() {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <ArtAlchemy />;

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10 text-center">
      <div className="px-6 md:px-10 mb-8">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 10</span>
          <span>·</span><span>FLAGSHIP</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">ART ALCHEMY</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-lg mx-auto mb-10">
          The most demanding experiment in the Lab. Open it when you&apos;re ready to give it your full attention.
        </p>
        <button
          onClick={() => setRevealed(true)}
          data-cursor="style"
          className="label-mono border border-gold text-gold rounded-full px-8 py-4 hover:bg-gold hover:text-charcoal transition-colors"
        >
          OPEN ART ALCHEMY →
        </button>
      </div>
    </section>
  );
}
