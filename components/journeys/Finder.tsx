"use client";
import Link from "next/link";
import { useState } from "react";
import { destinations, CATEGORY_LABEL } from "@/lib/journeys/destinations";
import type { Category } from "@/lib/journeys/types";

const LENGTHS = [{ v: 3, l: "Up to 4 days" }, { v: 6, l: "5–8 days" }, { v: 10, l: "9+ days" }];

/** Simple, explainable scoring: interest overlap first, then how well the suggested stay fits the trip length. */
export default function Finder() {
  const [interests, setInterests] = useState<Category[]>([]);
  const [len, setLen] = useState<number | null>(null);
  const toggle = (c: Category) => setInterests((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]));

  const ranked = interests.length
    ? destinations
        .map((d) => ({ d, s: d.categories.filter((c) => interests.includes(c)).length * 2 + (len && d.suggestedNights.max <= Math.max(2, Math.floor(len / 2)) ? 1 : 0) }))
        .filter((r) => r.s > 0)
        .sort((a, b) => b.s - a.s)
        .slice(0, 4)
    : [];

  return (
    <div>
      <fieldset>
        <legend className="label-mono text-ivory/60">What draws you to Kenya?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
            <button key={c} type="button" aria-pressed={interests.includes(c)} onClick={() => toggle(c)} className={`label-mono min-h-11 rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${interests.includes(c) ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>{CATEGORY_LABEL[c]}</button>
          ))}
        </div>
      </fieldset>
      <fieldset className="mt-6">
        <legend className="label-mono text-ivory/60">How long do you have?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {LENGTHS.map((o) => (
            <button key={o.v} type="button" aria-pressed={len === o.v} onClick={() => setLen(len === o.v ? null : o.v)} className={`label-mono min-h-11 rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${len === o.v ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>{o.l}</button>
          ))}
        </div>
      </fieldset>
      <div className="mt-8" aria-live="polite">
        {ranked.length > 0 && (
          <>
            <p className="label-mono text-gold">Places to start with</p>
            <ul className="mt-3 grid gap-px bg-ivory/10 sm:grid-cols-2">
              {ranked.map(({ d }) => (
                <li key={d.slug} className="bg-charcoal">
                  <Link href={`/journeys/destinations/${d.slug}`} className="block p-5 hover:bg-ivory/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
                    <span className="font-editorial text-2xl">{d.name}</span>
                    <span className="mt-1 block text-sm text-ivory/60">{d.tagline}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-ivory/50">Budget-based matching comes once priced packages are published.</p>
          </>
        )}
      </div>
    </div>
  );
}
