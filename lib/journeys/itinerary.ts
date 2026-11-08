import { haversineKm } from "./geo";
import { addDays, isValidDate } from "./trip-dates";
import type { Destination } from "./types";

export type TripStop = { slug: string; nights: number };
export type Leg = { fromSlug: string; toSlug: string; from: string; to: string; straightLineKm: number; warning: string | null };
export type DayKind = "arrival" | "stay" | "transfer" | "departure";
export type Day = {
  number: number; date: string | null; kind: DayKind; stopSlug: string; title: string;
  leg: Leg | null; sleepsIn: string | null; suggestions: string[]; notes: string[];
};

/** Straight-line thresholds. Roads are longer than the crow flies, so these err on the side of warning early. */
export const LONG_LEG_KM = 200;
export const VERY_LONG_LEG_KM = 400;

export function buildLegs(stops: TripStop[], dests: Destination[]): Leg[] {
  const by = new Map(dests.map((d) => [d.slug, d]));
  const legs: Leg[] = [];
  for (let i = 0; i + 1 < stops.length; i++) {
    const a = by.get(stops[i].slug), b = by.get(stops[i + 1].slug);
    if (!a || !b) continue;
    const km = Math.round(haversineKm(a, b));
    legs.push({
      fromSlug: a.slug, toSlug: b.slug, from: a.name, to: b.name, straightLineKm: km,
      warning: km >= VERY_LONG_LEG_KM ? `${a.name} to ${b.name} is a very long transfer (about ${km} km in a straight line). Road travel would take most of a day or more. Ask us about alternatives.`
        : km >= LONG_LEG_KM ? `${a.name} to ${b.name} is a long transfer (about ${km} km in a straight line). Allow most of a day.` : null,
    });
  }
  return legs;
}

/** What to suggest at a stop, in the editors' order: experiences first, then named attractions. Nothing is invented. */
const pool = (d: Destination) => (d.experiences.length ? d.experiences : d.attractions.map((a) => a.name));

/**
 * Day-by-day plan from the stops. Rules:
 *  - you sleep at stop i for `nights` nights; the day you move on is a transfer day (you arrive at the next stop that day);
 *  - the last day is a departure day;
 *  - suggestions come only from the destination's own experiences/attractions, never repeat within a stop, and when they run
 *    out the day says so honestly instead of making something up.
 */
export function buildItinerary(stops: TripStop[], dests: Destination[], startDate: string | null = null): Day[] {
  const by = new Map(dests.map((d) => [d.slug, d]));
  const known = stops.filter((s) => by.has(s.slug));
  if (!known.length) return [];
  const legs = buildLegs(known, dests);
  const days: Day[] = [];
  const date = (n: number) => (startDate && isValidDate(startDate) ? addDays(startDate, n - 1) : null);
  const push = (d: Omit<Day, "number" | "date">) => days.push({ ...d, number: days.length + 1, date: date(days.length + 1) });

  known.forEach((s, i) => {
    const d = by.get(s.slug)!;
    const ideas = [...pool(d)];
    const leg = i === 0 ? null : legs[i - 1];
    const below = s.nights < d.suggestedNights.min;
    for (let n = 0; n < s.nights; n++) {
      const notes: string[] = [];
      let kind: DayKind = n === 0 ? (i === 0 ? "arrival" : "transfer") : "stay";
      if (n === 0 && leg?.warning) notes.push(leg.warning);
      if (n === 0 && leg) notes.push(`About ${leg.straightLineKm} km in a straight line. Road distance and time are longer and will be confirmed in your quotation.`);
      if (n === 0 && below) notes.push(`${d.name}: we suggest at least ${d.suggestedNights.min} ${d.suggestedNights.min === 1 ? "night" : "nights"}. This plan gives ${s.nights}.`);
      const suggestions: string[] = [];
      const wanted = n === 0 ? 0 : 1; // arrival and transfer days are left light
      for (let k = 0; k < wanted; k++) { const idea = ideas.shift(); if (idea) suggestions.push(idea); }
      if (n > 0 && suggestions.length === 0) notes.push("Free time, or an experience arranged with a local partner.");
      if (n === 0 && i === 0) kind = "arrival";
      push({
        kind, stopSlug: s.slug, sleepsIn: s.slug, leg: n === 0 ? leg : null, suggestions, notes,
        title: n === 0 ? (leg ? `Travel from ${leg.from} to ${d.name}` : `Arrive in ${d.name}`) : `A day in ${d.name}`,
      });
    }
  });
  const last = by.get(known[known.length - 1].slug)!;
  push({ kind: "departure", stopSlug: last.slug, sleepsIn: null, leg: null, suggestions: [], notes: ["Onward travel from the last stop is not planned here. We confirm it in your quotation."], title: `Depart from ${last.name}` });
  return days;
}

/**
 * Makes the stops add up to `target` nights by changing the LAST stop. Returns null when that is impossible without
 * dropping a stop (the caller then explains instead of silently changing the plan).
 */
export function fitNightsToTarget(stops: TripStop[], target: number): TripStop[] | null {
  if (!stops.length || !Number.isInteger(target) || target < stops.length) return null;
  const before = stops.slice(0, -1).reduce((n, s) => n + s.nights, 0);
  const lastNights = target - before;
  if (lastNights < 1 || lastNights > 30) return null;
  return stops.map((s, i) => (i === stops.length - 1 ? { ...s, nights: lastNights } : s));
}
