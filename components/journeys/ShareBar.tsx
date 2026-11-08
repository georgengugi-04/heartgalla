"use client";
import Link from "next/link";
import { useState } from "react";
import { encodeTrip } from "@/lib/journeys/share";
import type { TripStop } from "@/lib/journeys/itinerary";
import { useDetails } from "@/lib/journeys/trip-details";

const btn = "label-mono min-h-11 rounded-full border border-ivory/20 px-5 transition-colors hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function ShareBar({ trip }: { trip: TripStop[] }) {
  const d = useDetails();
  const [state, setState] = useState<{ url: string; copied: boolean } | null>(null);
  const link = () => `${window.location.origin}/journeys/planner?${encodeTrip({ stops: trip, start: d.start, end: d.end, travellers: { adults: d.adults, children: d.children } })}`;
  const copy = async () => {
    const url = link();
    try { await navigator.clipboard.writeText(url); setState({ url, copied: true }); } catch { setState({ url, copied: false }); }
  };
  if (!trip.length) return null;
  return (
    <section aria-labelledby="share" className="print:hidden">
      <h2 id="share" className="font-editorial text-3xl">Keep it, share it, send it</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" className={btn} onClick={copy}>Copy a link to this trip</button>
        <button type="button" className={btn} onClick={() => window.print()}>Print or save as PDF</button>
        <Link href="/journeys/build-your-journey" className="label-mono inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-charcoal hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Request this journey</Link>
      </div>
      <p className="mt-3 text-sm text-ivory/50">Your trip is saved on this device only. The link contains your stops, dates and group size, but never your budget figures.</p>
      {state && (
        <div role="status" className="mt-3 max-w-2xl">
          <p className="text-sm">{state.copied ? "Link copied." : "Copy this link:"}</p>
          <input readOnly value={state.url} onFocus={(e) => e.currentTarget.select()} aria-label="Link to this trip" className="mt-1 block min-h-11 w-full border border-ivory/20 bg-transparent px-3 text-sm" />
        </div>
      )}
    </section>
  );
}
