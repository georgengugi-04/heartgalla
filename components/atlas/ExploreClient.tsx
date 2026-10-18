"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import RadialMap from "@/components/awb/RadialMap";
import { locations } from "@/lib/geography";
import type { ExploreItem, ExploreType } from "@/lib/atlas/types";

const TYPES: { id: ExploreType; label: string }[] = [
  { id: "practice", label: "Practices" },
  { id: "community", label: "Communities" },
  { id: "place", label: "Places" },
  { id: "artist", label: "Artists" },
  { id: "work", label: "Artworks" },
  { id: "story", label: "Stories" },
];
const SINGULAR: Record<ExploreType, string> = { practice: "Practice", community: "Community", place: "Place", artist: "Artist", work: "Artwork", story: "Story" };

type Facet = "material" | "topic" | "era";
const FACETS: { id: Facet; label: string }[] = [
  { id: "material", label: "Material" },
  { id: "topic", label: "Topic" },
  { id: "era", label: "Era" },
];

export default function ExploreClient({
  items,
  initial,
}: {
  items: ExploreItem[];
  initial: { q: string; type: ExploreType | "all"; place: string };
}) {
  const [q, setQ] = useState(initial.q);
  const [type, setType] = useState<ExploreType | "all">(initial.type);
  const [place, setPlace] = useState(initial.place);
  const [facet, setFacet] = useState<Partial<Record<Facet, string>>>({});
  const [view, setView] = useState<"list" | "map">("list");

  function sync(next: { q?: string; type?: string; place?: string }) {
    const p = new URLSearchParams(window.location.search);
    for (const [k, v] of Object.entries(next)) {
      if (v && v !== "all") p.set(k, v);
      else p.delete(k);
    }
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const inType = useMemo(() => items.filter((i) => type === "all" || i.type === type), [items, type]);
  const options = useMemo(() => {
    const out: Record<Facet, string[]> = { material: [], topic: [], era: [] };
    for (const f of FACETS) out[f.id] = [...new Set(inType.flatMap((i) => i.facets[f.id] ?? []))].sort();
    return out;
  }, [inType]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return inType.filter((i) => {
      if (needle && !needle.split(/\s+/).every((w) => i.haystack.includes(w) || i.title.toLowerCase().includes(w))) return false;
      if (place && !(i.facets.place ?? []).includes(place)) return false;
      for (const f of FACETS) if (facet[f.id] && !(i.facets[f.id] ?? []).includes(facet[f.id]!)) return false;
      return true;
    });
  }, [inType, q, place, facet]);

  const counts = useMemo(() => {
    const c: Partial<Record<ExploreType, number>> = {};
    for (const i of items) c[i.type] = (c[i.type] ?? 0) + 1;
    return c;
  }, [items]);

  const filtering = Boolean(q || place || Object.values(facet).some(Boolean) || type !== "all");
  function reset() {
    setQ(""); setType("all"); setPlace(""); setFacet({});
    sync({ q: "", type: "", place: "" });
  }

  return (
    <div>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <label className="block">
          <span className="mb-2 block text-sm text-ivory/70">Search the Atlas</span>
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); sync({ q: e.target.value }); }}
            placeholder="A material, a place, an artist, a story"
            className="min-h-12 w-full rounded-sm border border-ivory/25 bg-transparent px-4 text-ivory placeholder:text-ivory/40"
          />
        </label>
        <div role="group" aria-label="View" className="flex overflow-hidden rounded-full border border-ivory/25">
          {(["list", "map"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={`min-h-12 px-6 text-sm ${view === v ? "bg-ivory text-charcoal" : "text-ivory/80 hover:text-ivory"}`}
            >
              {v === "list" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </form>

      <div role="group" aria-label="Browse by" className="mt-6 flex flex-wrap gap-2">
        <button type="button" aria-pressed={type === "all"} onClick={() => { setType("all"); setFacet({}); sync({ type: "" }); }}
          className={`min-h-11 rounded-full border px-4 text-sm ${type === "all" ? "border-gold bg-gold text-charcoal" : "border-ivory/25 text-ivory/85 hover:border-ivory/60"}`}>
          Everything
        </button>
        {TYPES.map((t) => (
          <button key={t.id} type="button" aria-pressed={type === t.id}
            onClick={() => { setType(t.id); setFacet({}); sync({ type: t.id }); }}
            className={`min-h-11 rounded-full border px-4 text-sm ${type === t.id ? "border-gold bg-gold text-charcoal" : "border-ivory/25 text-ivory/85 hover:border-ivory/60"}`}>
            {t.label} <span className="opacity-60">{counts[t.id] ?? 0}</span>
          </button>
        ))}
      </div>

      {FACETS.some((f) => options[f.id].length > 1) && (
        <div className="mt-4 flex flex-wrap gap-4">
          {FACETS.filter((f) => options[f.id].length > 1).map((f) => (
            <label key={f.id} className="text-sm text-ivory/70">
              <span className="mr-2">{f.label}</span>
              <select
                value={facet[f.id] ?? ""}
                onChange={(e) => setFacet((s) => ({ ...s, [f.id]: e.target.value || undefined }))}
                className="min-h-11 rounded-sm border border-ivory/25 bg-charcoal px-3 text-ivory"
              >
                <option value="">Any</option>
                {options[f.id].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </label>
          ))}
        </div>
      )}

      {place && (
        <p className="mt-4 text-sm text-ivory/70">
          Showing records linked to {locations.find((l) => `place-${l.id}` === place)?.name ?? "this place"}.{" "}
          <button type="button" onClick={() => { setPlace(""); sync({ place: "" }); }} className="underline underline-offset-4">Clear place</button>
        </p>
      )}

      {view === "map" ? (
        <section aria-labelledby="map-h" className="mt-12">
          <h2 id="map-h" className="font-editorial text-2xl">Where the archive is rooted</h2>
          <p className="mt-2 max-w-prose text-ivory/70">
            Only places that real records point to appear here. Places are locations, not cultural boundaries, and a place never stands in for a community.
          </p>
          <div className="mt-8">
            <RadialMap locations={locations} onSelect={(l) => { setPlace(`place-${l.id}`); setView("list"); sync({ place: `place-${l.id}` }); }} />
          </div>
          <p className="mt-6 text-sm text-ivory/60">Prefer text? Switch to List: the same records, searchable.</p>
        </section>
      ) : (
        <section aria-labelledby="results-h" className="mt-10">
          <h2 id="results-h" className="sr-only">Results</h2>
          <p role="status" aria-live="polite" className="mb-6 text-sm text-ivory/60">
            {results.length} {results.length === 1 ? "record" : "records"}
          </p>

          {results.length === 0 ? (
            <div className="max-w-xl border border-ivory/15 p-8">
              {type === "community" && !q && !place ? (
                <>
                  <h3 className="font-editorial text-2xl">No communities are published yet</h3>
                  <p className="mt-3 text-ivory/75">
                    A community appears here only after it has been documented with the people concerned, with their permission and their own names for themselves.
                    Until then the Atlas lists nothing rather than guessing.
                  </p>
                  <Link href="/contact" className="mt-5 inline-block underline underline-offset-4">Propose a community or practice to document</Link>
                </>
              ) : (
                <>
                  <h3 className="font-editorial text-2xl">Nothing matches that yet</h3>
                  <p className="mt-3 text-ivory/75">Try a shorter search, or clear the filters.</p>
                  {filtering && <button type="button" onClick={reset} className="mt-5 min-h-11 underline underline-offset-4">Clear search and filters</button>}
                </>
              )}
            </div>
          ) : (
            <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((i) => (
                <li key={i.id}>
                  <Link href={i.href} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden bg-ivory/5">
                      {i.image ? (
                        <Image src={i.image} alt="" fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full items-end p-4 font-editorial text-3xl text-ivory/30">{i.title}</div>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-gold">{SINGULAR[i.type]}</p>
                    <h3 className="font-editorial text-xl leading-snug group-hover:underline underline-offset-4">{i.title}</h3>
                    {i.blurb && <p className="mt-1 line-clamp-2 text-sm text-ivory/65">{i.blurb}</p>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
