"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { destinations, CATEGORY_LABEL } from "@/lib/journeys/destinations";
import type { Category } from "@/lib/journeys/types";

export default function DestinationBrowser() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "all">("all");
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return destinations.filter((d) => {
      if (cat !== "all" && !d.categories.includes(cat)) return false;
      if (!n) return true;
      return [d.name, d.county, d.region, d.summary, ...d.attractions.map((a) => a.name), ...d.experiences].join(" ").toLowerCase().includes(n);
    });
  }, [q, cat]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="label-mono text-ivory/60">Search towns, attractions, experiences</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “Lamu”, “crater” or “museum”" className="mt-2 block min-h-12 w-full border border-ivory/20 bg-transparent px-4 text-ivory placeholder:text-ivory/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {(["all", ...Object.keys(CATEGORY_LABEL)] as (Category | "all")[]).map((c) => (
          <button key={c} type="button" aria-pressed={cat === c} onClick={() => setCat(c)} className={`label-mono min-h-11 rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${cat === c ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>
            {c === "all" ? "All" : CATEGORY_LABEL[c]}
          </button>
        ))}
      </div>
      <p className="label-mono mt-6 text-ivory/50" aria-live="polite">{list.length} {list.length === 1 ? "destination" : "destinations"}</p>
      <ul className="mt-4 grid gap-px bg-ivory/10 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <li key={d.slug} className="bg-charcoal">
            <Link href={`/journeys/destinations/${d.slug}`} className="group flex h-full min-h-56 flex-col justify-between p-6 transition-colors hover:bg-ivory/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">
              <div>
                <p className="label-mono text-gold">{d.county} · {d.region}</p>
                <h3 className="font-editorial mt-3 text-3xl">{d.name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ivory/70">{d.tagline}</p>
              </div>
              <p className="label-mono mt-6 text-ivory/50 group-hover:text-gold">{d.categories.map((c) => CATEGORY_LABEL[c]).join(" · ")}</p>
            </Link>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-6 text-ivory/70">No destinations match yet. More towns are added as local partners join.</p>}
    </div>
  );
}
