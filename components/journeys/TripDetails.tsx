"use client";
import { fitNightsToTarget, type TripStop } from "@/lib/journeys/itinerary";
import { addDays, checkDates, nightsBetween, todayInKenya } from "@/lib/journeys/trip-dates";
import { setTrip, totalNights } from "@/lib/journeys/trip";
import { setDetails, useDetails } from "@/lib/journeys/trip-details";

const field = "mt-2 block min-h-12 w-full border border-ivory/20 bg-transparent px-4 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
const btn = "label-mono min-h-11 rounded-full border border-ivory/20 px-4 transition-colors hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

export default function TripDetails({ trip }: { trip: TripStop[] }) {
  const d = useDetails();
  const check = checkDates(d.start, d.end, todayInKenya());
  const nights = totalNights(trip);
  const datesNights = d.start && d.end && check.ok ? nightsBetween(d.start, d.end) : null;
  const mismatch = datesNights !== null && trip.length > 0 && datesNights !== nights;
  const fitted = mismatch ? fitNightsToTarget(trip, datesNights) : null;
  const err = (f: "start" | "end") => (!check.ok && check.field === f ? check.message : null);

  return (
    <section aria-labelledby="details" data-trip-details>
      <h2 id="details" className="font-editorial text-3xl">Dates and travellers</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label>Departure date<input type="date" value={d.start} onChange={(e) => setDetails({ start: e.target.value })} aria-invalid={!!err("start")} aria-describedby="date-msg" className={field} /></label>
        <label>Return date<input type="date" value={d.end} onChange={(e) => setDetails({ end: e.target.value })} aria-invalid={!!err("end")} aria-describedby="date-msg" className={field} /></label>
        <label>Adults<input type="number" min={1} max={20} value={d.adults} onChange={(e) => setDetails({ adults: Number(e.target.value) })} className={field} /></label>
        <label>Children<input type="number" min={0} max={20} value={d.children} onChange={(e) => setDetails({ children: Number(e.target.value) })} className={field} /></label>
      </div>
      <div id="date-msg" aria-live="polite" className="mt-3 space-y-2 text-sm">
        {!check.ok && <p role="alert" className="border border-kenya-red p-3">{check.message}</p>}
        {mismatch && (
          <div className="border border-gold/50 p-3">
            <p>Your dates cover {datesNights} {datesNights === 1 ? "night" : "nights"}, but your stops add up to {nights}.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fitted
                ? <button type="button" className={btn} onClick={() => setTrip(fitted)}>Change {trip[trip.length - 1] && "the last stop"} to {fitted[fitted.length - 1].nights} {fitted[fitted.length - 1].nights === 1 ? "night" : "nights"}</button>
                : <span className="text-ivory/70">These dates are too short for {trip.length} stops. Add days or remove a stop.</span>}
              {d.start && <button type="button" className={btn} onClick={() => setDetails({ end: addDays(d.start, nights) })}>Set my return date from my stops</button>}
            </div>
          </div>
        )}
        {check.ok && datesNights !== null && !mismatch && trip.length > 0 && <p className="text-ivory/60">Your dates match your stops: {nights} {nights === 1 ? "night" : "nights"}.</p>}
      </div>
    </section>
  );
}
