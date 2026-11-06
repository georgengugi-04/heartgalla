import type { SuggestedRoute, TravelPackage } from "./types";

/** Starting points only. Transfers are NOT yet checked for time or transport, so none is marked verified. */
export const suggestedRoutes: SuggestedRoute[] = [
  {
    slug: "sgr-coast-conservation-culture",
    name: "SGR Coast: Conservation & Culture",
    blurb: "Nairobi to the coast by train, then Mombasa, Haller Park, Watamu and Diani. Nature, heritage and community-led culture.",
    stops: [{ slug: "nairobi", nights: 1 }, { slug: "mombasa", nights: 1 }, { slug: "watamu", nights: 3 }, { slug: "diani", nights: 2 }],
    feasibility: "unverified",
    draftNote: "Draft for a specific client brief. Revised from an earlier 7-day version: Kaya Kinondo moved to Diani (it is on the south coast), Day 6 lightened, and an extra night added in Diani so the Wasini day trip does not clash with the train.",
    days: [
      { day: 1, title: "Nairobi", plan: ["Arrival and rest.", "Nairobi cultural orientation (museum or gallery visit)."], stay: "Nairobi" },
      { day: 2, title: "Nairobi to Mombasa by SGR", plan: ["Morning Madaraka Express to Mombasa Terminus (Miritini). The usual morning service departs at 08:00. Check the portal when booking.", "Transfer to Old Town.", "Afternoon: Old Town and Fort Jesus, at an unhurried pace."], stay: "Mombasa" },
      { day: 3, title: "Mombasa to Haller Park to Watamu", plan: ["Haller Park, Bamburi: guided walk on the quarry-to-forest story, wildlife and giraffe feeding. Plan around the feeding times the park confirms.", "Drive north to Watamu.", "Late afternoon: Mida Creek by boat (mangroves, birds)."], stay: "Watamu" },
      { day: 4, title: "Watamu: nature", plan: ["Arabuko Sokoke Forest with a guide.", "Afternoon: Watamu Marine National Park snorkelling and a talk at Local Ocean Conservation."], stay: "Watamu" },
      { day: 5, title: "Watamu: heritage and food", plan: ["Gedi Ruins.", "Afternoon at leisure or a Swahili cooking session with a local host."], stay: "Watamu" },
      { day: 6, title: "Watamu to Diani", plan: ["Long transfer south. Confirm the best route and crossing with the driver.", "If time allows: a community-led visit to Kaya Kinondo, arranged in advance through the Mijikenda community and following their protocols."], stay: "Diani" },
      { day: 7, title: "Wasini and Kisite", plan: ["Full-day boat trip from Shimoni: reef snorkelling, dolphins, seafood lunch."], stay: "Diani" },
      { day: 8, title: "Diani to Nairobi by SGR", plan: ["Transfer to Mombasa Terminus.", "Afternoon Madaraka Express to Nairobi Terminus (Syokimau); the usual afternoon service departs at 15:00.", "Connect to JKIA with a generous buffer."] },
    ],
    verify: [
      "SGR timetable and class availability on the travel dates",
      "Haller Park opening hours, entry fees and feeding times",
      "Whether Nguuni Nature Sanctuary is open to visitors and where it is relative to Haller Park",
      "Kaya Kinondo visit: who arranges it, fees, dress and conduct rules",
      "Drive times and the crossing for Watamu to Diani and Diani to Mombasa Terminus",
      "Wasini and Kisite operator, departure and return times",
      "Any accommodation: none is selected yet",
    ],
  },
  { slug: "cultural-journey", name: "The Kenya Cultural Journey", blurb: "Nairobi, then the central highlands and Mount Kenya, finishing in the Rift Valley.", stops: [{ slug: "nairobi", nights: 2 }, { slug: "nyeri", nights: 2 }, { slug: "nanyuki", nights: 2 }, { slug: "nakuru", nights: 2 }], feasibility: "unverified" },
  { slug: "rift-valley-discovery", name: "The Rift Valley Discovery", blurb: "Lakes, crater and gorge country west of Nairobi.", stops: [{ slug: "nairobi", nights: 2 }, { slug: "naivasha", nights: 2 }, { slug: "nakuru", nights: 2 }], feasibility: "unverified" },
  { slug: "coastal-heritage", name: "The Coastal Heritage Journey", blurb: "Swahili coast from Mombasa north to Lamu.", stops: [{ slug: "mombasa", nights: 2 }, { slug: "diani", nights: 2 }, { slug: "malindi", nights: 2 }, { slug: "lamu", nights: 3 }], feasibility: "unverified" },
  { slug: "complete-kenya", name: "The Complete Kenya Experience", blurb: "Highlands, Rift Valley and coast in one trip.", stops: [{ slug: "nairobi", nights: 2 }, { slug: "naivasha", nights: 2 }, { slug: "nakuru", nights: 2 }, { slug: "nanyuki", nights: 2 }, { slug: "mombasa", nights: 3 }], feasibility: "unverified" },
];

/**
 * Package tiers exist; priced packages do not yet. Operators and accommodation partners are not onboarded, so every
 * package is "quote on request" with no price. Admin screens fill these in; nothing here is a live price.
 */
export const packages: TravelPackage[] = [
  { slug: "budget-discovery", tier: "budget", name: "Budget Discovery", stops: [], accommodationCategory: "Budget guesthouses and hostels", included: [], excluded: [], price: null, status: "quote_on_request" },
  { slug: "comfort-journeys", tier: "comfort", name: "Comfort Journeys", stops: [], accommodationCategory: "Mid-range hotels and lodges", included: [], excluded: [], price: null, status: "quote_on_request" },
  { slug: "premium-experiences", tier: "premium", name: "Premium Experiences", stops: [], accommodationCategory: "Premium lodges and boutique stays", included: [], excluded: [], price: null, status: "quote_on_request" },
];

export const TIER_COPY = {
  budget: { label: "A · Budget Discovery", text: "Affordable stays, local transport, low-cost attractions and flexible itineraries." },
  comfort: { label: "B · Comfort Journeys", text: "Mid-range stays, convenient transport and guided cultural experiences across several destinations." },
  premium: { label: "C · Premium Experiences", text: "Premium stays, private transport, specialist guides and exclusive experiences where genuinely available." },
} as const;
