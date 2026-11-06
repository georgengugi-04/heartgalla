"use client";
import Link from "next/link";
import { addStop, removeStop, useTrip } from "@/lib/journeys/trip";

export default function AddToTrip({ slug, nights }: { slug: string; nights: number }) {
  const trip = useTrip();
  const inTrip = trip.some((s) => s.slug === slug);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => (inTrip ? removeStop(slug) : addStop(slug, nights))}
        aria-pressed={inTrip}
        className={`label-mono min-h-11 rounded-full px-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${inTrip ? "border border-gold text-gold hover:bg-gold/10" : "bg-gold text-charcoal hover:bg-ivory"}`}
      >
        {inTrip ? "In your trip · remove" : "Add to my trip"}
      </button>
      {trip.length > 0 && (
        <Link href="/journeys/planner" className="label-mono underline underline-offset-4 hover:text-gold">
          Open planner ({trip.length} {trip.length === 1 ? "stop" : "stops"})
        </Link>
      )}
    </div>
  );
}
