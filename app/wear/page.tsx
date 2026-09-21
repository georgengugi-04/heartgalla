"use client";
import { useState } from "react";
import Link from "next/link";
import { artworks } from "@/lib/data";
import { balancedMix } from "@/lib/balance";

const CHOICES = balancedMix(artworks, 8); // shared 40 / 30 / 20 across the artists (lib/balance.ts)
const GARMENTS = ["T-Shirt", "Hoodie", "Cap", "Tote Bag"];
const PLACEMENTS = ["Front, Centered", "Front, Small", "Back, Full"];

export default function WearPage() {
  const [artwork, setArtwork] = useState(CHOICES[0]);
  const [garment, setGarment] = useState(GARMENTS[0]);
  const [placement, setPlacement] = useState(PLACEMENTS[0]);

  return (
    <div className="pb-24">
      <div className="relative h-[45vh] md:h-[55vh] flex items-end mb-16">
        <img src="/brand/clean/wear-the-art-jacket.jpg" alt="Art beyond canvas" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <div className="relative z-10 px-6 md:px-10 pb-10">
          <p className="label-mono text-ivory/60 mb-3">FROM CANVAS TO CLOTHING</p>
          <h1 className="font-editorial text-4xl md:text-6xl">Wear the Art</h1>
        </div>
      </div>
      <div className="px-6 md:px-10">
      <p className="text-ivory/60 max-w-xl mb-14">
        An artwork can become something wearable. This is an early interaction preview —
        no image generation is connected yet, so nothing below is a real product mockup.
      </p>

      <div className="grid md:grid-cols-2 gap-14">
        <div className="aspect-square bg-ivory/5 border border-ivory/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <img src={artwork.image} alt={artwork.title} className="absolute inset-0 w-full h-full object-cover opacity-25" />
          <div className="relative z-10 text-center px-8">
            <p className="label-mono text-ivory/50 mb-2">PREVIEW — UI ONLY</p>
            <p className="font-editorial text-2xl">{garment} · {artwork.title}</p>
            <p className="label-mono text-ivory/40 mt-2">{placement}</p>
            <p className="label-mono text-electric mt-6 border border-electric/40 rounded-full px-3 py-1 inline-block">
              NOT AI-GENERATED — CONCEPT ONLY
            </p>
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <p className="label-mono text-ivory/50 mb-3">1. CHOOSE ARTWORK</p>
            <div className="flex gap-3 flex-wrap">
              {CHOICES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setArtwork(a)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${artwork.id === a.id ? "border-gold" : "border-transparent"}`}
                >
                  <img src={a.image} alt={a.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono text-ivory/50 mb-3">2. SELECT GARMENT</p>
            <div className="flex gap-3 flex-wrap">
              {GARMENTS.map((g) => (
                <button key={g} onClick={() => setGarment(g)} className={`label-mono border rounded-full px-4 py-2 ${garment === g ? "border-gold text-gold" : "border-ivory/30"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono text-ivory/50 mb-3">3. PLACEMENT</p>
            <div className="flex gap-3 flex-wrap">
              {PLACEMENTS.map((p) => (
                <button key={p} onClick={() => setPlacement(p)} className={`label-mono border rounded-full px-4 py-2 ${placement === p ? "border-gold text-gold" : "border-ivory/30"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <Link href="/contact" className="label-mono border border-ivory/30 rounded-full px-6 py-3 inline-block">
            Request This Combination
          </Link>
        </div>
      </div>
      </div>
    </div>
  );
}
