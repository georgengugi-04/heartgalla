"use client";
import { useEffect, useRef, useState } from "react";
import { destinations, bySlug } from "@/lib/journeys/destinations";
import { BUDGET_BANDS, INTERESTS, STAY_PREFS } from "@/lib/journeys/inquiry";
import { totalNights, useTrip } from "@/lib/journeys/trip";

const field = "mt-2 block min-h-12 w-full border border-ivory/20 bg-transparent px-4 text-ivory placeholder:text-ivory/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold";
type State = { kind: "idle" } | { kind: "sending" } | { kind: "done"; reference: string } | { kind: "error"; message: string; fields?: Record<string, string> };

export default function InquiryForm() {
  const trip = useTrip();
  const started = useRef(0);
  useEffect(() => { started.current = Date.now(); }, []);
  const [extra, setExtra] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [state, setState] = useState<State>({ kind: "idle" });
  const picked = Array.from(new Set([...trip.map((s) => s.slug), ...extra]));
  const toggle = <T,>(l: T[], v: T) => (l.includes(v) ? l.filter((x) => x !== v) : [...l, v]);
  const err = (k: string) => (state.kind === "error" ? state.fields?.[k] : undefined);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const f = new FormData(e.currentTarget);
    setState({ kind: "sending" });
    try {
      const r = await fetch("/api/journeys/inquiries", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: f.get("fullName"), email: f.get("email"), country: f.get("country"), travelFrom: f.get("travelFrom"), travelTo: f.get("travelTo"),
          travelers: Number(f.get("travelers")), days: f.get("days") ? Number(f.get("days")) : undefined,
          destinations: picked, stops: trip, accommodationPref: f.get("accommodationPref"), budgetBand: f.get("budgetBand"), budgetNote: f.get("budgetNote"),
          experiences: interests, specialRequests: f.get("specialRequests"), website: f.get("website"), startedAt: started.current,
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.reference) return setState({ kind: "done", reference: j.reference });
      if (r.status === 400) return setState({ kind: "error", message: "Please check the highlighted fields.", fields: j.errors });
      if (r.status === 429) return setState({ kind: "error", message: "Too many requests from this connection. Please try again in a few minutes." });
      if (r.status === 503) return setState({ kind: "error", message: "Journey requests can’t be received through the site yet. Please contact us on Instagram or through the contact page, and we’ll plan it with you." });
      setState({ kind: "error", message: "We couldn’t save your request. Nothing was sent. Please try again." });
    } catch {
      setState({ kind: "error", message: "We couldn’t reach the server. Nothing was sent. Please check your connection and try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className="border border-gold/50 p-8">
        <p className="label-mono text-gold">Request received</p>
        <h2 className="font-editorial mt-3 text-4xl">Your reference is {state.reference}</h2>
        <p className="mt-4 max-w-prose text-ivory/80">This is a request for a personalised itinerary and quotation. <strong className="font-medium">It is not a booking</strong>: nothing is reserved and you have not been charged. Our team or an authorised partner will respond with a proposed itinerary and price. Please keep your reference.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 md:grid-cols-2">
      <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      {state.kind === "error" && <p role="alert" className="border border-kenya-red p-4 md:col-span-2">{state.message}</p>}

      <label>Full name<input name="fullName" required autoComplete="name" className={field} aria-invalid={!!err("fullName")} /><span className="mt-1 block text-sm text-terracotta">{err("fullName")}</span></label>
      <label>Email<input name="email" type="email" required autoComplete="email" className={field} aria-invalid={!!err("email")} /><span className="mt-1 block text-sm text-terracotta">{err("email")}</span></label>
      <label>Country of residence<input name="country" required autoComplete="country-name" className={field} aria-invalid={!!err("country")} /><span className="mt-1 block text-sm text-terracotta">{err("country")}</span></label>
      <label>Number of travelers<input name="travelers" type="number" min={1} max={50} defaultValue={2} required className={field} aria-invalid={!!err("travelers")} /><span className="mt-1 block text-sm text-terracotta">{err("travelers")}</span></label>
      <label>Preferred start date<input name="travelFrom" type="date" className={field} /></label>
      <label>Preferred end date<input name="travelTo" type="date" className={field} aria-invalid={!!err("travelTo")} /><span className="mt-1 block text-sm text-terracotta">{err("travelTo")}</span></label>
      <label>Trip length in days<input name="days" type="number" min={1} max={60} placeholder={trip.length ? String(totalNights(trip) + 1) : "e.g. 10"} className={field} /></label>

      <fieldset className="md:col-span-2">
        <legend>Destinations{trip.length > 0 && <span className="label-mono ml-3 text-gold">from your planner, in order</span>}</legend>
        {trip.length > 0 && <p className="mt-2 text-ivory/70">{trip.map((s) => `${bySlug(s.slug)?.name} (${s.nights}n)`).join(" → ")}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {destinations.filter((d) => !trip.some((s) => s.slug === d.slug)).map((d) => (
            <button key={d.slug} type="button" aria-pressed={extra.includes(d.slug)} onClick={() => setExtra(toggle(extra, d.slug))} className={`label-mono min-h-11 rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${extra.includes(d.slug) ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>{d.name}</button>
          ))}
        </div>
        <span className="mt-1 block text-sm text-terracotta">{err("destinations")}</span>
      </fieldset>

      <label>Accommodation preference<select name="accommodationPref" defaultValue="any" className={field}>{STAY_PREFS.map((o) => <option key={o.value} value={o.value} className="bg-charcoal">{o.label}</option>)}</select></label>
      <label>Budget range<select name="budgetBand" defaultValue="" required className={field} aria-invalid={!!err("budgetBand")}><option value="" disabled className="bg-charcoal">Choose…</option>{BUDGET_BANDS.map((o) => <option key={o.value} value={o.value} className="bg-charcoal">{o.label}</option>)}</select><span className="mt-1 block text-sm text-terracotta">{err("budgetBand")}</span></label>
      <label className="md:col-span-2">Budget note (optional, with currency)<input name="budgetNote" maxLength={200} placeholder="e.g. around 1,500 USD per person, excluding flights" className={field} /></label>

      <fieldset className="md:col-span-2">
        <legend>Experiences you’re drawn to</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {INTERESTS.map((i) => (
            <button key={i} type="button" aria-pressed={interests.includes(i)} onClick={() => setInterests(toggle(interests, i))} className={`label-mono min-h-11 rounded-full border px-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${interests.includes(i) ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>{i}</button>
          ))}
        </div>
      </fieldset>
      <label className="md:col-span-2">Special requests<textarea name="specialRequests" rows={5} maxLength={4000} className={`${field} py-3`} /></label>

      <div className="md:col-span-2">
        <button type="submit" disabled={state.kind === "sending"} className="label-mono min-h-12 rounded-full bg-gold px-8 text-charcoal transition-colors hover:bg-ivory disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">{state.kind === "sending" ? "Sending…" : "Send my request"}</button>
        <p className="mt-3 max-w-prose text-sm text-ivory/50">Sending this form requests a personalised quotation. It does not book or reserve anything and does not take payment.</p>
      </div>
    </form>
  );
}
