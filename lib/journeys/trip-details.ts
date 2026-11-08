"use client";
import { useSyncExternalStore } from "react";
import { EMPTY_BUDGET, type BudgetInputs } from "./budget";
import { ISO, isValidDate } from "./trip-dates";

/** Everything about the trip that is not the list of stops: dates, travellers and the budget worksheet. Kept on this device only. */
export type Details = { start: string; end: string; adults: number; children: number; budget: BudgetInputs };
export const DEFAULT_DETAILS: Details = { start: "", end: "", adults: 2, children: 0, budget: EMPTY_BUDGET };

const KEY = "egj-trip-details";
const EVT = "egj-trip-details-change";
let cache: { raw: string | null; value: Details } = { raw: null, value: DEFAULT_DETAILS };

const str = (v: unknown, max = 24) => (typeof v === "string" ? v.slice(0, max) : "");
const int = (v: unknown, min: number, max: number, fb: number) => (typeof v === "number" && Number.isInteger(v) && v >= min && v <= max ? v : fb);
const date = (v: unknown) => (typeof v === "string" && ISO.test(v) && isValidDate(v) ? v : "");

/** Reads and re-validates stored details, so a hand-edited or old value can never break the planner. */
export function sanitise(x: unknown): Details {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
  const b = (o.budget && typeof o.budget === "object" ? o.budget : {}) as Record<string, unknown>;
  const legs = (b.transportPerLeg && typeof b.transportPerLeg === "object" ? b.transportPerLeg : {}) as Record<string, unknown>;
  const transportPerLeg: Record<string, string> = {};
  for (const [k, v] of Object.entries(legs).slice(0, 12)) if (/^[a-z0-9-]{1,60}>[a-z0-9-]{1,60}$/.test(k)) transportPerLeg[k] = str(v);
  return {
    start: date(o.start), end: date(o.end), adults: int(o.adults, 1, 20, 2), children: int(o.children, 0, 20, 0),
    budget: { roomRate: str(b.roomRate), rooms: str(b.rooms, 3), foodPerPerson: str(b.foodPerPerson), activitiesPerPerson: str(b.activitiesPerPerson), transportPerLeg, other: str(b.other) },
  };
}

function read(): Details {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    cache = { raw, value: raw ? sanitise(JSON.parse(raw)) : DEFAULT_DETAILS };
    return cache.value;
  } catch {
    return DEFAULT_DETAILS;
  }
}
export function setDetails(patch: Partial<Details>) {
  const next = sanitise({ ...read(), ...patch });
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: works until reload */ }
  window.dispatchEvent(new Event(EVT));
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
};
export const useDetails = () => useSyncExternalStore(subscribe, read, () => DEFAULT_DETAILS);
