"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
        <Image src="/brand/clean/wear-the-art-jacket.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/10 to-transparent" />
        <div className="relative z-10 px-6 md:px-10 pb-10">
          <p className="label-mono text-ivory/60 mb-3">FROM CANVAS TO CLOTHING</p>
          <h1 className="font-editorial text-4xl md:text-6xl">Wear the Art</h1>
        </div>
      </div>
      <div className="px-6 md:px-10">
      <ol className="mb-8 flex flex-wrap items-center gap-x-3 gap-y-2 label-mono text-ivory/70" aria-label="The idea">
        {["Art", "Story", "Object", "Wearable"].map((s, i) => (
          <li key={s} className="flex items-center gap-3">
            <span className={i === 0 ? "text-ivory" : ""}>{s.toUpperCase()}</span>
            {i < 3 && <span aria-hidden="true" className="text-gold">→</span>}
          </li>
        ))}
      </ol>
      <p className="text-ivory/70 max-w-xl mb-3">
        An artwork can become something you wear. This is the idea EARTGALLA is exploring: a concept, not a shop — there is nothing to buy yet.
      </p>
      <p className="text-ivory/60 max-w-xl mb-14">
        Below is an early interaction preview. No image generation is connected, so nothing shown is a real product mockup.
      </p>

      <div className="grid md:grid-cols-2 gap-14">
        <div className="aspect-square bg-ivory/5 border border-ivory/10 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <Image src={artwork.image} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-6 opacity-30" />
          <div className="relative z-10 text-center px-8">
            <p className="label-mono text-ivory/50 mb-2">PREVIEW — UI ONLY</p>
            <p className="font-editorial text-2xl">{garment} · {artwork.title}</p>
            <p className="label-mono text-ivory/55 mt-2">{placement}</p>
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
                  type="button"
                  onClick={() => setArtwork(a)}
                  aria-pressed={artwork.id === a.id}
                  aria-label={`Choose ${a.title}`}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 bg-black/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${artwork.id === a.id ? "border-gold" : "border-transparent"}`}
                >
                  <Image src={a.image} alt={a.title} fill sizes="64px" className="object-contain p-1" />
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono text-ivory/50 mb-3">2. SELECT GARMENT</p>
            <div className="flex gap-3 flex-wrap">
              {GARMENTS.map((g) => (
                <button key={g} type="button" aria-pressed={garment === g} onClick={() => setGarment(g)} className={`label-mono min-h-11 border rounded-full px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${garment === g ? "border-gold text-gold" : "border-ivory/30"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="label-mono text-ivory/50 mb-3">3. PLACEMENT</p>
            <div className="flex gap-3 flex-wrap">
              {PLACEMENTS.map((p) => (
                <button key={p} type="button" aria-pressed={placement === p} onClick={() => setPlacement(p)} className={`label-mono min-h-11 border rounded-full px-4 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${placement === p ? "border-gold text-gold" : "border-ivory/30"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Link
              href={`/contact?work=${artwork.slug}&topic=wearable&garment=${encodeURIComponent(garment)}&placement=${encodeURIComponent(placement)}#form`}
              className="label-mono inline-flex min-h-12 items-center border border-gold text-gold rounded-full px-7 py-3 transition-colors hover:bg-gold hover:text-charcoal"
            >
              Tell us you&apos;d wear this
            </Link>
            <p className="mt-3 text-sm text-ivory/60 max-w-xs">This sends us an expression of interest — it isn&apos;t an order.</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
