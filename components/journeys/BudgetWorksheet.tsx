"use client";
import { buildLegs, type TripStop } from "@/lib/journeys/itinerary";
import { computeBudget, defaultRooms, formatKes, legKey } from "@/lib/journeys/budget";
import { setDetails, useDetails } from "@/lib/journeys/trip-details";
import type { Destination } from "@/lib/journeys/types";

const field = "mt-2 block min-h-12 w-full border border-ivory/20 bg-transparent px-4 text-ivory placeholder:text-ivory/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
const CATS = { accommodation: "Accommodation", food: "Food", activities: "Activities and fees", transport: "Transport", other: "Other" } as const;

export default function BudgetWorksheet({ trip, destinations }: { trip: TripStop[]; destinations: Destination[] }) {
  const d = useDetails();
  const legs = buildLegs(trip, destinations);
  const b = computeBudget(d.budget, trip, { adults: d.adults, children: d.children });
  const set = (patch: Partial<typeof d.budget>) => setDetails({ budget: { ...d.budget, ...patch } });
  const name = (slug: string) => destinations.find((x) => x.slug === slug)?.name ?? slug;
  const money = (id: string, label: string, value: string, onChange: (v: string) => void, hint?: string) => (
    <label key={id}>{label}
      <input inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="KES" className={field} />
      {hint && <span className="mt-1 block text-sm text-ivory/50">{hint}</span>}
    </label>
  );
  return (
    <section aria-labelledby="budget" className="print:break-inside-avoid">
      <h2 id="budget" className="font-editorial text-3xl">Budget worksheet</h2>
      <p className="mt-2 max-w-prose text-sm text-ivory/60">We don’t have verified prices yet, so we don’t invent any. Enter your own figures in Kenyan shillings and the worksheet adds them up. It is your estimate, <strong className="font-semibold">not a quotation</strong>. Real prices are confirmed by our team or an authorised partner.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 print:hidden">
        {money("room", "Room, per night", d.budget.roomRate, (v) => set({ roomRate: v }))}
        <label>Rooms
          <input inputMode="numeric" value={d.budget.rooms} onChange={(e) => set({ rooms: e.target.value })} placeholder={`${defaultRooms({ adults: d.adults, children: d.children })} (one per 2 adults)`} className={field} />
        </label>
        {money("food", "Food, per person per day", d.budget.foodPerPerson, (v) => set({ foodPerPerson: v }))}
        {money("act", "Activities and entry fees, per person per day", d.budget.activitiesPerPerson, (v) => set({ activitiesPerPerson: v }))}
        {legs.map((l) => money(legKey(l.fromSlug, l.toSlug), `Transport: ${l.from} → ${l.to}, whole group`, d.budget.transportPerLeg[legKey(l.fromSlug, l.toSlug)] ?? "", (v) => set({ transportPerLeg: { ...d.budget.transportPerLeg, [legKey(l.fromSlug, l.toSlug)]: v } })))}
        {money("other", "Anything else, whole trip", d.budget.other, (v) => set({ other: v }))}
      </div>

      <div aria-live="polite" className="mt-6">
        {!b.entered ? (
          <p className="text-ivory/60">Enter at least one figure to see your totals.</p>
        ) : (
          <>
            {b.invalid.length > 0 && <p role="alert" className="mb-4 border border-kenya-red p-3 text-sm">Check these figures, they must be numbers: {b.invalid.join(", ")}. They are left out of the totals.</p>}
            <p className="font-editorial text-4xl">{formatKes(b.total)} <span className="label-mono text-ivory/50">your estimate</span></p>
            <p className="mt-1 text-ivory/80">{formatKes(b.perPerson)} per person · {formatKes(b.perDay)} per day · {b.people} {b.people === 1 ? "traveller" : "travellers"}, {b.rooms} {b.rooms === 1 ? "room" : "rooms"}, {b.days} days</p>
            <div className="mt-6 grid gap-8 md:grid-cols-2">
              <table className="w-full text-left text-sm">
                <caption className="label-mono pb-2 text-left text-ivory/50">By category</caption>
                <tbody className="divide-y divide-ivory/10">
                  {(Object.keys(CATS) as (keyof typeof CATS)[]).map((k) => <tr key={k}><td className="py-2">{CATS[k]}</td><td className="text-right">{formatKes(b.byCategory[k])}</td></tr>)}
                </tbody>
              </table>
              <table className="w-full text-left text-sm">
                <caption className="label-mono pb-2 text-left text-ivory/50">By destination (a transfer counts at the stop you arrive at)</caption>
                <tbody className="divide-y divide-ivory/10">
                  {b.byStop.map((s) => <tr key={s.slug}><td className="py-2">{name(s.slug)}</td><td className="text-right">{formatKes(s.total)}</td></tr>)}
                </tbody>
              </table>
            </div>
            <p className="mt-4 max-w-prose text-sm text-ivory/50">Estimate based only on the figures you entered. Not a quotation, and no price here has been confirmed by an operator.</p>
          </>
        )}
      </div>
    </section>
  );
}
