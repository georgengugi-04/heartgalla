import { ISO, isValidDate } from "./trip-dates";
import type { Travellers } from "./budget";
import type { TripStop } from "./itinerary";

export type SharedTrip = { stops: TripStop[]; start: string; end: string; travellers: Travellers };

/** `?t=nairobi.2~nakuru.3&d=2027-01-10&r=2027-01-15&a=2&c=1`. Short, readable, and safe to paste into a message. */
export function encodeTrip(t: SharedTrip): string {
  const p = new URLSearchParams();
  p.set("t", t.stops.map((s) => `${s.slug}.${s.nights}`).join("~"));
  if (t.start) p.set("d", t.start);
  if (t.end) p.set("r", t.end);
  p.set("a", String(t.travellers.adults));
  if (t.travellers.children) p.set("c", String(t.travellers.children));
  return p.toString();
}

const int = (v: string | null | undefined, min: number, max: number, fallback: number) => {
  if (v === null || v === undefined || !/^\d{1,3}$/.test(v)) return fallback;
  const n = Number(v);
  return n >= min && n <= max ? n : fallback;
};

/**
 * Reads a shared trip from URL parameters. Never trusts them: unknown or repeated destinations are dropped, nights are
 * clamped to valid values, bad dates are ignored. Returns null if nothing usable is left.
 */
export function decodeTrip(get: (k: string) => string | null | undefined, knownSlugs: ReadonlySet<string>): SharedTrip | null {
  const raw = get("t");
  if (!raw || raw.length > 600) return null;
  const seen = new Set<string>();
  const stops: TripStop[] = [];
  for (const part of raw.split("~").slice(0, 12)) {
    const [slug, n] = part.split(".");
    if (!slug || !knownSlugs.has(slug) || seen.has(slug)) continue;
    seen.add(slug);
    stops.push({ slug, nights: int(n, 1, 30, 1) });
  }
  if (!stops.length) return null;
  const d = get("d") ?? "", r = get("r") ?? "";
  return {
    stops,
    start: ISO.test(d) && isValidDate(d) ? d : "",
    end: ISO.test(r) && isValidDate(r) ? r : "",
    travellers: { adults: int(get("a"), 1, 20, 2), children: int(get("c"), 0, 20, 0) },
  };
}
