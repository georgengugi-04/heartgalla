/** Calendar-date helpers. Dates are plain "YYYY-MM-DD" strings, so there is no time-zone drift. */
export const ISO = /^\d{4}-\d{2}-\d{2}$/;
const MS_DAY = 86_400_000;

export const toUtc = (iso: string) => {
  if (!ISO.test(iso)) return NaN;
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d);
  const back = new Date(t);
  return back.getUTCFullYear() === y && back.getUTCMonth() === m - 1 && back.getUTCDate() === d ? t : NaN; // rejects 2027-02-31
};
export const isValidDate = (iso: string) => !Number.isNaN(toUtc(iso));
export const addDays = (iso: string, n: number) => new Date(toUtc(iso) + n * MS_DAY).toISOString().slice(0, 10);
export const nightsBetween = (from: string, to: string) => Math.round((toUtc(to) - toUtc(from)) / MS_DAY);

/** Today's date in Kenya (UTC+3, no daylight saving), so "today" is right for Kenyan visitors at any hour. */
export const todayInKenya = (now: Date = new Date()) => new Date(now.getTime() + 3 * 3_600_000).toISOString().slice(0, 10);

export const MAX_ADVANCE_DAYS = 730;

export type DateCheck = { ok: true } | { ok: false; field: "start" | "end"; message: string };

/** Checks a departure date, and an optional return date. Empty dates are allowed (the traveller may not have chosen yet). */
export function checkDates(start: string, end: string, today: string): DateCheck {
  if (start && !isValidDate(start)) return { ok: false, field: "start", message: "Enter the departure date as a real calendar date." };
  if (end && !isValidDate(end)) return { ok: false, field: "end", message: "Enter the return date as a real calendar date." };
  if (start && nightsBetween(today, start) < 0) return { ok: false, field: "start", message: "The departure date is in the past. Choose today or a later date." };
  if (start && nightsBetween(today, start) > MAX_ADVANCE_DAYS) return { ok: false, field: "start", message: "We can only plan up to two years ahead. Choose an earlier departure date." };
  if (start && end && nightsBetween(start, end) < 1) return { ok: false, field: "end", message: "The return date must be at least one day after the departure date." };
  if (start && end && nightsBetween(start, end) > 90) return { ok: false, field: "end", message: "That is more than 90 nights. For a longer stay, please tell us in your request." };
  return { ok: true };
}

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(toUtc(iso)));
