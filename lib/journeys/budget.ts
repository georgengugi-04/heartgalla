import type { TripStop } from "./itinerary";

/**
 * A budget worksheet, not a price list. EartGalla has no verified prices yet, so every figure is entered by the traveller
 * and every field starts empty. Totals are the traveller's own estimate and are never a quotation.
 */
export type BudgetInputs = {
  roomRate: string;        // per room per night
  rooms: string;           // number of rooms; empty = 1 room per 2 adults
  foodPerPerson: string;   // per person per day
  activitiesPerPerson: string; // per person per day (entry fees, guides)
  transportPerLeg: Record<string, string>; // key `${fromSlug}>${toSlug}`, the cost of that transfer for the whole group
  other: string;           // anything else, for the whole trip
};
export const EMPTY_BUDGET: BudgetInputs = { roomRate: "", rooms: "", foodPerPerson: "", activitiesPerPerson: "", transportPerLeg: {}, other: "" };

export type Travellers = { adults: number; children: number };
export const legKey = (fromSlug: string, toSlug: string) => `${fromSlug}>${toSlug}`;

/** Parses what a person typed. Accepts "12,500" and "12 500"; rejects negatives and non-numbers. */
export function parseMoney(v: string | undefined): number | null {
  if (v === undefined || v.trim() === "") return null;
  const n = Number(v.replace(/[\s,]/g, ""));
  return Number.isFinite(n) && n >= 0 && n <= 100_000_000 ? Math.round(n * 100) / 100 : NaN;
}

export type StopCost = { slug: string; accommodation: number; food: number; activities: number; transport: number; total: number };
export type Budget =
  | { entered: false }
  | { entered: true; invalid: string[]; total: number; perPerson: number; perDay: number; byCategory: Record<"accommodation" | "food" | "activities" | "transport" | "other", number>; byStop: StopCost[]; rooms: number; people: number; days: number };

export const defaultRooms = (t: Travellers) => Math.max(1, Math.ceil(t.adults / 2) + (t.children > 0 && t.adults === 0 ? 1 : 0));

export function computeBudget(inputs: BudgetInputs, stops: TripStop[], t: Travellers): Budget {
  const fields: [string, string | undefined][] = [["room rate", inputs.roomRate], ["number of rooms", inputs.rooms], ["food", inputs.foodPerPerson], ["activities", inputs.activitiesPerPerson], ["other costs", inputs.other], ...Object.entries(inputs.transportPerLeg).map(([k, v]) => [`transport ${k.replace(">", " to ")}`, v] as [string, string | undefined])];
  const parsed = fields.map(([name, v]) => [name, parseMoney(v)] as const);
  const invalid = parsed.filter(([, n]) => n !== null && Number.isNaN(n)).map(([name]) => name);
  if (parsed.every(([, n]) => n === null)) return { entered: false };
  const num = (v: string | undefined) => { const n = parseMoney(v); return n === null || Number.isNaN(n) ? 0 : n; };

  const people = Math.max(1, t.adults + t.children);
  const rooms = parseMoney(inputs.rooms) && !Number.isNaN(parseMoney(inputs.rooms)) ? Math.round(parseMoney(inputs.rooms) as number) : defaultRooms(t);
  const nights = stops.reduce((n, s) => n + s.nights, 0);
  const days = nights + 1;
  const room = num(inputs.roomRate), food = num(inputs.foodPerPerson), act = num(inputs.activitiesPerPerson);

  const byStop: StopCost[] = stops.map((s, i) => {
    const accommodation = room * rooms * s.nights;
    const dayCount = s.nights + (i === stops.length - 1 ? 1 : 0); // the last stop also gets the departure day
    const foodCost = food * people * dayCount, activities = act * people * dayCount;
    const transport = i === 0 ? 0 : num(inputs.transportPerLeg[legKey(stops[i - 1].slug, s.slug)]); // a transfer is counted at the stop you arrive at
    return { slug: s.slug, accommodation, food: foodCost, activities, transport, total: accommodation + foodCost + activities + transport };
  });
  const sum = (k: keyof StopCost) => byStop.reduce((n, s) => n + (s[k] as number), 0);
  const other = num(inputs.other);
  const byCategory = { accommodation: sum("accommodation"), food: sum("food"), activities: sum("activities"), transport: sum("transport"), other };
  const total = byCategory.accommodation + byCategory.food + byCategory.activities + byCategory.transport + other;
  return { entered: true, invalid, total, perPerson: total / people, perDay: total / days, byCategory, byStop, rooms, people, days };
}

export const formatKes = (n: number) => new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", maximumFractionDigits: 0 }).format(n);
