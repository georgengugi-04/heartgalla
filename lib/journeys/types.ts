/**
 * EartGalla Journeys — content model.
 * Rule carried over from the rest of EartGalla: nothing is invented. Anything not verified is `null`
 * and the UI says so. Seed content is `draft` until a person with local knowledge has reviewed it.
 */
export type Category = "culture" | "nature" | "heritage" | "coast" | "adventure" | "local";
export type ReviewStatus = "draft" | "reviewed";

export type Photo = {
  src: string; alt: string; width: number; height: number;
  /** photographer / source line shown under the image; "to be confirmed" until licence is checked */
  credit: string;
  licence: "pexels" | "unsplash" | "unconfirmed";
  /** optional: name of the attraction this photo belongs to (must match Attraction.name exactly) */
  attraction?: string;
};
export type Attraction = { name: string; kind: Category; note: string; photos?: Photo[] };

export type Destination = {
  slug: string;
  name: string;
  county: string;
  region: string;
  /** approximate town centre; used only for the schematic map, never for distances */
  lat: number;
  lng: number;
  tagline: string;
  hero?: Photo;
  /** extra photos for the destination that are not tied to one attraction */
  gallery?: Photo[];
  summary: string;
  categories: Category[];
  attractions: Attraction[];
  culture: string;
  experiences: string[];
  /** suggested nights, as a planning starting point, not a promise */
  suggestedNights: { min: number; max: number };
  bestTime: string | null;
  transport: string | null;
  related: string[];
  reviewStatus: ReviewStatus;
};

export type Feasibility = "unverified" | "verified";
export type RouteDay = { day: number; title: string; plan: string[]; stay?: string };
export type SuggestedRoute = {
  slug: string;
  /** optional day-by-day plan; `verify` lists every claim that still needs a phone call or portal check */
  days?: RouteDay[];
  verify?: string[];
  draftNote?: string;
  name: string;
  blurb: string;
  stops: { slug: string; nights: number }[];
  feasibility: Feasibility;
};

export type PackageTier = "budget" | "comfort" | "premium";
export type PackageStatus = "quote_on_request" | "indicative" | "confirmed";
export type TravelPackage = {
  slug: string;
  tier: PackageTier;
  name: string;
  stops: { slug: string; nights: number }[];
  accommodationCategory: string;
  included: string[];
  excluded: string[];
  price: { amount: number; currency: string; basis: "per_person" | "per_group" } | null;
  status: PackageStatus;
};
