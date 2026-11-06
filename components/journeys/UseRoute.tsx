"use client";
import Link from "next/link";
import { setTrip } from "@/lib/journeys/trip";
import type { Stop } from "@/lib/journeys/trip";

export default function UseRoute({ stops }: { stops: Stop[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href="/journeys/planner" onClick={() => setTrip(stops)} className="label-mono inline-flex min-h-12 items-center rounded-full bg-gold px-8 text-charcoal hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Use as my trip</Link>
      <Link href="/journeys/build-your-journey" onClick={() => setTrip(stops)} className="label-mono inline-flex min-h-12 items-center rounded-full border border-ivory/30 px-8 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Request a quotation</Link>
    </div>
  );
}
