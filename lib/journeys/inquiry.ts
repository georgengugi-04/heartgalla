export type InquiryInput = {
  fullName: string; email: string; country: string; travelFrom: string; travelTo: string; travelers: number; days: number;
  destinations: string[]; stops: { slug: string; nights: number }[]; accommodationPref: string; budgetBand: string; budgetNote: string;
  experiences: string[]; specialRequests: string;
};
export const BUDGET_BANDS = [
  { value: "budget", label: "Budget" }, { value: "mid", label: "Mid-range" }, { value: "premium", label: "Premium" }, { value: "unsure", label: "Not sure yet" },
] as const;
export const STAY_PREFS = [
  { value: "any", label: "No preference" }, { value: "budget", label: "Budget-friendly" }, { value: "mid", label: "Mid-range" },
  { value: "luxury", label: "Luxury" }, { value: "beach", label: "Beachfront" }, { value: "safari", label: "Safari lodge" },
] as const;
export const INTERESTS = ["Art & craft", "Heritage sites", "Food", "Music & dance", "Community-led visits", "Wildlife", "Beaches", "Hiking"];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export function validateInquiry(i: InquiryInput) {
  const e: Record<string, string> = {};
  if (i.fullName.trim().length < 2) e.fullName = "Please enter your name.";
  if (!EMAIL.test(i.email)) e.email = "Please enter a valid email address.";
  if (i.country.trim().length < 2) e.country = "Please tell us where you live.";
  if (!Number.isInteger(i.travelers) || i.travelers < 1 || i.travelers > 50) e.travelers = "Enter between 1 and 50 travelers.";
  if (!i.stops.length && !i.destinations.length) e.destinations = "Choose at least one destination.";
  if (!["budget", "mid", "premium", "unsure"].includes(i.budgetBand)) e.budgetBand = "Choose a budget range.";
  if (i.travelFrom && i.travelTo && i.travelTo < i.travelFrom) e.travelTo = "The end date is before the start date.";
  return e;
}
/** EGJ-2026-XXXXXX — unambiguous characters, unique in the database. */
export function makeReference() {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const b = crypto.getRandomValues(new Uint8Array(6));
  return `EGJ-${new Date().getFullYear()}-${Array.from(b, (x) => c[x % c.length]).join("")}`;
}
