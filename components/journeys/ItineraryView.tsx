import { buildItinerary, buildLegs, type TripStop } from "@/lib/journeys/itinerary";
import { formatDate } from "@/lib/journeys/trip-dates";
import type { Destination } from "@/lib/journeys/types";

export default function ItineraryView({ trip, destinations, start }: { trip: TripStop[]; destinations: Destination[]; start: string }) {
  const days = buildItinerary(trip, destinations, start || null);
  const legs = buildLegs(trip, destinations);
  if (!days.length) return null;
  const warnings = legs.filter((l) => l.warning);
  return (
    <section aria-labelledby="plan">
      <h2 id="plan" className="font-editorial text-3xl">Day by day</h2>
      <p className="mt-2 max-w-prose text-sm text-ivory/60">A suggested plan built from your stops. Nothing here is booked. Activities come from each destination’s own list, and we say so when we have nothing to suggest.</p>
      {warnings.length > 0 && (
        <ul role="alert" className="mt-4 space-y-2 border border-terracotta/60 p-4 text-sm">
          {warnings.map((l) => <li key={`${l.fromSlug}>${l.toSlug}`}>{l.warning}</li>)}
        </ul>
      )}
      <ol className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
        {days.map((day) => (
          <li key={day.number} className="grid gap-2 py-4 sm:grid-cols-[7rem_1fr]">
            <p className="label-mono text-gold">Day {day.number}{day.date ? <><br />{formatDate(day.date)}</> : null}</p>
            <div>
              <h3 className="font-editorial text-xl">{day.title}</h3>
              {day.suggestions.length > 0 && <p className="mt-1 text-ivory/80">Suggested: {day.suggestions.join(" · ")}</p>}
              {day.notes.map((n) => <p key={n} className="mt-1 text-sm text-ivory/60">{n}</p>)}
            </div>
          </li>
        ))}
      </ol>
      {legs.length > 0 && (
        <div className="mt-8">
          <h3 className="font-editorial text-2xl">Distances between stops</h3>
          <table className="mt-3 w-full max-w-xl text-left text-sm">
            <thead className="label-mono text-ivory/50"><tr><th className="py-2 pr-4">Transfer</th><th>Straight line</th></tr></thead>
            <tbody className="divide-y divide-ivory/10">
              {legs.map((l) => <tr key={`${l.fromSlug}>${l.toSlug}`}><td className="py-2 pr-4">{l.from} → {l.to}</td><td>about {l.straightLineKm} km</td></tr>)}
            </tbody>
          </table>
          <p className="mt-2 max-w-prose text-sm text-ivory/50">Straight-line distance, as the crow flies. Real road distance and driving time are longer and depend on traffic, weather and road conditions. We confirm them in your quotation.</p>
        </div>
      )}
    </section>
  );
}
