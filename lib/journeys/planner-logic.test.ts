import { describe, expect, it } from "vitest";
import { destinations } from "./destinations";
import { EMPTY_BUDGET, computeBudget, defaultRooms, legKey, parseMoney } from "./budget";
import { haversineKm } from "./geo";
import { buildItinerary, buildLegs, fitNightsToTarget, type TripStop } from "./itinerary";
import { decodeTrip, encodeTrip } from "./share";
import { addDays, checkDates, isValidDate, nightsBetween, todayInKenya } from "./trip-dates";

const slugs = new Set(destinations.map((d) => d.slug));
const trip: TripStop[] = [{ slug: "nairobi", nights: 2 }, { slug: "naivasha", nights: 1 }, { slug: "nakuru", nights: 2 }];

describe("geo", () => {
  it("measures straight-line distance sensibly", () => {
    const n = destinations.find((d) => d.slug === "nairobi")!, m = destinations.find((d) => d.slug === "mombasa")!;
    expect(haversineKm(n, n)).toBe(0);
    expect(haversineKm(n, m)).toBeGreaterThan(400); // about 440 km as the crow flies
    expect(haversineKm(n, m)).toBeLessThan(480);
    expect(haversineKm(n, m)).toBeCloseTo(haversineKm(m, n), 6);
  });
});

describe("dates", () => {
  it("rejects impossible calendar dates and does date maths without time-zone drift", () => {
    expect(isValidDate("2027-02-31")).toBe(false);
    expect(isValidDate("2028-02-29")).toBe(true);
    expect(isValidDate("27-01-01")).toBe(false);
    expect(addDays("2027-12-30", 3)).toBe("2028-01-02");
    expect(nightsBetween("2027-03-01", "2027-03-06")).toBe(5);
  });
  it("uses Kenya's calendar day (UTC+3)", () => {
    expect(todayInKenya(new Date("2027-01-10T21:30:00Z"))).toBe("2027-01-11");
    expect(todayInKenya(new Date("2027-01-10T20:59:00Z"))).toBe("2027-01-10");
  });
  it("validates departure and return dates", () => {
    const today = "2027-01-10";
    expect(checkDates("", "", today)).toEqual({ ok: true });
    expect(checkDates("2027-01-09", "", today)).toMatchObject({ ok: false, field: "start" });
    expect(checkDates("2027-01-10", "", today)).toEqual({ ok: true });
    expect(checkDates("2027-01-12", "2027-01-12", today)).toMatchObject({ ok: false, field: "end" });
    expect(checkDates("2027-01-12", "2027-01-11", today)).toMatchObject({ ok: false, field: "end" });
    expect(checkDates("2027-01-12", "2027-01-15", today)).toEqual({ ok: true });
    expect(checkDates("2027-02-30", "", today)).toMatchObject({ ok: false, field: "start" });
    expect(checkDates("2030-01-10", "", today)).toMatchObject({ ok: false, field: "start" });
    expect(checkDates("2027-01-12", "2027-06-12", today)).toMatchObject({ ok: false, field: "end" });
  });
});

describe("itinerary", () => {
  it("has one day per night plus a departure day, in the order of the stops", () => {
    const days = buildItinerary(trip, destinations, "2027-03-01");
    expect(days).toHaveLength(2 + 1 + 2 + 1);
    expect(days.map((d) => d.kind)).toEqual(["arrival", "stay", "transfer", "transfer", "stay", "departure"]);
    expect(days.map((d) => d.number)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(days[0].date).toBe("2027-03-01");
    expect(days[5].date).toBe("2027-03-06");
    expect(days[2].title).toBe("Travel from Nairobi to Naivasha");
    expect(days[5].sleepsIn).toBeNull();
  });
  it("never repeats a suggestion within a stop and never invents one", () => {
    const stay = (slug: string, nights: number) => buildItinerary([{ slug, nights }], destinations).filter((d) => d.kind === "stay");
    const nak = destinations.find((d) => d.slug === "nakuru")!;
    const all = stay("nakuru", 8).flatMap((d) => d.suggestions);
    expect(new Set(all).size).toBe(all.length);
    for (const s of all) expect([...nak.experiences, ...nak.attractions.map((a) => a.name)]).toContain(s);
    const empty = stay("nakuru", 8).filter((d) => d.suggestions.length === 0);
    expect(empty.length).toBeGreaterThan(0);
    for (const d of empty) expect(d.notes.join(" ")).toMatch(/Free time/);
  });
  it("flags long transfers and short stays, and says distances are straight-line", () => {
    const days = buildItinerary([{ slug: "nairobi", nights: 1 }, { slug: "lamu", nights: 1 }], destinations);
    const notes = days.flatMap((d) => d.notes).join(" ");
    expect(notes).toMatch(/very long transfer/);
    expect(notes).toMatch(/straight line/);
    expect(notes).toMatch(/we suggest at least/);
    expect(buildLegs([{ slug: "nairobi", nights: 1 }, { slug: "naivasha", nights: 1 }], destinations)[0].warning).toBeNull();
  });
  it("skips unknown stops and returns nothing for an empty trip", () => {
    expect(buildItinerary([], destinations)).toEqual([]);
    expect(buildItinerary([{ slug: "atlantis", nights: 3 }], destinations)).toEqual([]);
    expect(buildItinerary([{ slug: "atlantis", nights: 3 }, { slug: "nakuru", nights: 1 }], destinations)).toHaveLength(2);
  });
  it("fits the stops to a number of nights by changing only the last stop", () => {
    expect(fitNightsToTarget(trip, 7)).toEqual([trip[0], trip[1], { slug: "nakuru", nights: 4 }]);
    expect(fitNightsToTarget(trip, 3)).toBeNull(); // the first two stops already use 3 nights, so the last would get 0
    expect(fitNightsToTarget(trip, 2)).toBeNull(); // fewer nights than stops
    expect(fitNightsToTarget([], 4)).toBeNull();
  });
});

describe("budget worksheet", () => {
  const t = { adults: 2, children: 1 };
  it("shows nothing until the traveller has entered a figure", () => {
    expect(computeBudget(EMPTY_BUDGET, trip, t)).toEqual({ entered: false });
  });
  it("adds up accommodation, food, activities, transport and other, and splits by stop", () => {
    const b = computeBudget({ roomRate: "10,000", rooms: "", foodPerPerson: "2000", activitiesPerPerson: "1500", transportPerLeg: { [legKey("nairobi", "naivasha")]: "8000", [legKey("naivasha", "nakuru")]: "5000" }, other: "3000" }, trip, t)!;
    if (!b.entered) throw new Error("expected a budget");
    expect(b.rooms).toBe(defaultRooms(t));
    expect(b.rooms).toBe(1);
    expect(b.byCategory.accommodation).toBe(10_000 * 1 * 5);
    expect(b.byCategory.food).toBe(2000 * 3 * 6);
    expect(b.byCategory.activities).toBe(1500 * 3 * 6);
    expect(b.byCategory.transport).toBe(13_000);
    expect(b.total).toBe(50_000 + 36_000 + 27_000 + 13_000 + 3_000);
    expect(b.byStop.reduce((n, s) => n + s.total, 0) + 3_000).toBe(b.total);
    expect(b.byStop[2].transport).toBe(5_000);
    expect(b.perPerson).toBeCloseTo(b.total / 3, 6);
    expect(b.perDay).toBeCloseTo(b.total / 6, 6);
  });
  it("uses the rooms the traveller entered and ignores invalid figures, naming them", () => {
    const b = computeBudget({ ...EMPTY_BUDGET, roomRate: "5000", rooms: "2", foodPerPerson: "abc", other: "-5" }, [{ slug: "nakuru", nights: 2 }], { adults: 2, children: 0 });
    if (!b.entered) throw new Error("expected a budget");
    expect(b.rooms).toBe(2);
    expect(b.byCategory.accommodation).toBe(5000 * 2 * 2);
    expect(b.invalid).toEqual(["food", "other costs"]);
  });
  it("parses money safely", () => {
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("12 500")).toBe(12500);
    expect(parseMoney("1,250.50")).toBe(1250.5);
    expect(Number.isNaN(parseMoney("-1"))).toBe(true);
    expect(Number.isNaN(parseMoney("1e12"))).toBe(true);
    expect(Number.isNaN(parseMoney("ksh 5"))).toBe(true);
  });
});

describe("share links", () => {
  const shared = { stops: trip, start: "2027-03-01", end: "2027-03-06", travellers: { adults: 2, children: 1 } };
  it("round-trips a trip", () => {
    const qs = new URLSearchParams(encodeTrip(shared));
    expect(decodeTrip((k) => qs.get(k), slugs)).toEqual(shared);
  });
  it("does not trust the link: drops unknown and repeated stops, clamps nights, ignores bad dates and travellers", () => {
    const qs = new URLSearchParams("t=nairobi.99~atlantis.2~nairobi.3~nakuru.0&d=2027-02-31&r=nope&a=500&c=-1");
    expect(decodeTrip((k) => qs.get(k), slugs)).toEqual({ stops: [{ slug: "nairobi", nights: 1 }, { slug: "nakuru", nights: 1 }], start: "", end: "", travellers: { adults: 2, children: 0 } });
  });
  it("returns null when nothing usable is in the link", () => {
    expect(decodeTrip(() => null, slugs)).toBeNull();
    expect(decodeTrip((k) => (k === "t" ? "atlantis.2" : null), slugs)).toBeNull();
    expect(decodeTrip((k) => (k === "t" ? "x".repeat(700) : null), slugs)).toBeNull();
  });
});
