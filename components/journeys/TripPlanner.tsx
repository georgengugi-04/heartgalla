"use client";
import Link from "next/link";
import { destinations, bySlug } from "@/lib/journeys/destinations";
import { suggestedRoutes } from "@/lib/journeys/routes";
import { addStop, moveStop, removeStop, setNights, setTrip, totalNights, useTrip } from "@/lib/journeys/trip";
import RouteMap from "./RouteMap";
import BudgetWorksheet from "./BudgetWorksheet";
import ItineraryView from "./ItineraryView";
import ShareBar from "./ShareBar";
import SharedTripBanner from "./SharedTripBanner";
import TripDetails from "./TripDetails";
import { useDetails } from "@/lib/journeys/trip-details";

const btn = "label-mono min-h-11 min-w-11 rounded-full border border-ivory/20 px-3 transition-colors hover:border-gold disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";

<<<<<<< ours
export default function TripPlanner() {
  const trip = useTrip();
=======
export default function TripPlanner({ destinations, sharedQuery = "" }: { destinations: Destination[]; sharedQuery?: string }) {
  const bySlug = (slug: string) => destinations.find((d) => d.slug === slug);
  const trip = useTrip().filter((s) => bySlug(s.slug)); // a stop whose destination was unpublished is skipped

  const details = useDetails();
>>>>>>> theirs
  const nights = totalNights(trip);
  const available = destinations.filter((d) => !trip.some((s) => s.slug === d.slug));

  return (
    <div>
    <SharedTripBanner query={sharedQuery} destinations={destinations} />
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="space-y-14">
        <TripDetails trip={trip} />
        <section aria-labelledby="stops">
        <h2 id="stops" className="font-editorial text-3xl">Your stops</h2>
        {trip.length === 0 ? (
          <p className="mt-4 max-w-prose text-ivory/70">No stops yet. Add destinations below, or start from a suggested route.</p>
        ) : (
          <>
            <ol className="mt-6 divide-y divide-ivory/10 border-y border-ivory/10">
              {trip.map((s, i) => {
                const d = bySlug(s.slug)!;
                return (
                  <li key={s.slug} className="flex flex-wrap items-center gap-4 py-4">
                    <span className="label-mono w-6 text-gold">{i + 1}</span>
                    <div className="min-w-40 flex-1">
                      <Link href={`/journeys/destinations/${d.slug}`} className="font-editorial text-2xl hover:text-gold">{d.name}</Link>
                      <p className="label-mono text-ivory/50">Suggested {d.suggestedNights.min}–{d.suggestedNights.max} nights</p>
                    </div>
                    <div className="flex items-center gap-2 print:hidden" role="group" aria-label={`Nights in ${d.name}`}>
                      <button type="button" className={btn} onClick={() => setNights(s.slug, s.nights - 1)} disabled={s.nights <= 1} aria-label={`Fewer nights in ${d.name}`}>−</button>
                      <span className="w-20 text-center text-sm" aria-live="polite">{s.nights} {s.nights === 1 ? "night" : "nights"}</span>
                      <button type="button" className={btn} onClick={() => setNights(s.slug, s.nights + 1)} disabled={s.nights >= 30} aria-label={`More nights in ${d.name}`}>+</button>
                    </div>
                    <div className="flex items-center gap-2 print:hidden">
                      <button type="button" className={btn} onClick={() => moveStop(i, -1)} disabled={i === 0} aria-label={`Move ${d.name} earlier`}>↑</button>
                      <button type="button" className={btn} onClick={() => moveStop(i, 1)} disabled={i === trip.length - 1} aria-label={`Move ${d.name} later`}>↓</button>
                      <button type="button" className={btn} onClick={() => removeStop(s.slug)} aria-label={`Remove ${d.name}`}>Remove</button>
                    </div>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-ivory/80" aria-live="polite">
              {trip.length} {trip.length === 1 ? "stop" : "stops"} · {nights} {nights === 1 ? "night" : "nights"} on the ground · {nights + 1} days if you travel on the first and last day
            </p>
            <div className="mt-6 flex flex-wrap gap-3 print:hidden">
              <button type="button" className={btn} onClick={() => setTrip([])}>Clear trip</button>
            </div>
            <p className="mt-3 max-w-prose text-sm text-ivory/50">A request is not a booking. Transport between stops, accommodation and prices are confirmed in a quotation from our team or an authorised partner.</p>
          </>
        )}

        </section>

        {trip.length > 0 && <ItineraryView trip={trip} destinations={destinations} start={details.start} />}
        {trip.length > 0 && <BudgetWorksheet trip={trip} destinations={destinations} />}
        <ShareBar trip={trip} />

        <section aria-labelledby="add" className="print:hidden">
        <h2 id="add" className="font-editorial text-3xl">Add a destination</h2>
        <ul className="mt-4 flex flex-wrap gap-2">
          {available.map((d) => (
            <li key={d.slug}><button type="button" className={btn} onClick={() => addStop(d.slug, d.suggestedNights.min)}>+ {d.name}</button></li>
          ))}
          {available.length === 0 && <li className="text-ivory/60">Every destination is in your trip.</li>}
        </ul>

        </section>
        <section aria-labelledby="start" className="print:hidden">
        <h2 id="start" className="font-editorial text-3xl">Not sure where to start?</h2>
        <p className="mt-2 max-w-prose text-sm text-ivory/60">These are starting points. We haven’t yet checked travel times or transport for each transfer, so none is marked as confirmed.</p>
        <ul className="mt-6 grid gap-px bg-ivory/10 sm:grid-cols-2">
          {suggestedRoutes.map((r) => (
            <li key={r.slug} className="bg-charcoal p-5">
              <h3 className="font-editorial text-xl">{r.name}</h3>
              <p className="mt-1 text-sm text-ivory/60">{r.blurb}</p>
              <p className="label-mono mt-3 text-ivory/50">{r.stops.map((s) => bySlug(s.slug)?.name).join(" → ")}</p>
              <p className="label-mono mt-1 text-terracotta">Feasibility: not yet verified</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className={btn} onClick={() => setTrip(r.stops)}>Use as my trip</button>
                <Link href={`/journeys/routes/${r.slug}`} className={`${btn} inline-flex items-center`}>View route</Link>
              </div>
            </li>
          ))}
        </ul>
        </section>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <RouteMap stops={trip.map((s) => s.slug)} />
      </aside>
    </div>
    </div>
  );
}
