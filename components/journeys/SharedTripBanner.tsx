"use client";
import { useEffect, useState } from "react";
import { decodeTrip } from "@/lib/journeys/share";
import { readTrip, setTrip, useTrip } from "@/lib/journeys/trip";
import { setDetails } from "@/lib/journeys/trip-details";
import type { Destination } from "@/lib/journeys/types";

/** Offers a trip that arrived in the link (?t=...). It never replaces the visitor's own trip without asking. */
export default function SharedTripBanner({ query, destinations }: { query: string; destinations: Destination[] }) {
  const own = useTrip();
  const [dismissed, setDismissed] = useState(false);
  const shared = decodeTrip((k) => new URLSearchParams(query).get(k), new Set(destinations.map((d) => d.slug)));
  const same = !!shared && own.length === shared.stops.length && own.every((s, i) => s.slug === shared.stops[i].slug && s.nights === shared.stops[i].nights);
  const autoLoad = !!shared && own.length === 0 && !dismissed;

  const apply = () => {
    if (!shared) return;
    setTrip(shared.stops);
    setDetails({ start: shared.start, end: shared.end, adults: shared.travellers.adults, children: shared.travellers.children });
    window.history.replaceState(null, "", "/journeys/planner");
  };
  // An empty planner has nothing to lose, so the shared trip loads straight away. The check reads storage directly: on the
  // first render after loading the page the planner can look empty for a moment even when the visitor has a saved trip.
  useEffect(() => { if (autoLoad && readTrip().length === 0) apply(); });

  if (!shared || dismissed || same || autoLoad) return null;
  const names = shared.stops.map((s) => destinations.find((d) => d.slug === s.slug)?.name ?? s.slug).join(" → ");
  return (
    <div role="region" aria-label="Shared trip" className="mb-8 border border-gold/50 p-4 print:hidden">
      <p>A trip was shared with you: <strong className="font-semibold">{names}</strong> ({shared.stops.reduce((n, s) => n + s.nights, 0)} nights).</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => { apply(); setDismissed(true); }} className="label-mono min-h-11 rounded-full bg-gold px-5 text-charcoal hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Use this trip (replaces mine)</button>
        <button type="button" onClick={() => { setDismissed(true); window.history.replaceState(null, "", "/journeys/planner"); }} className="label-mono min-h-11 rounded-full border border-ivory/20 px-5 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Keep my trip</button>
      </div>
    </div>
  );
}
