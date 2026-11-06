import { NextResponse } from "next/server";
import { destinations } from "@/lib/journeys/destinations";
import { validateInquiry, makeReference, type InquiryInput } from "@/lib/journeys/inquiry";

/**
 * POST /api/journeys/inquiries — validates on the server, stores the request, emails a notification if configured.
 *   Storage (server-side only):  SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY   (table: package_inquiries)
 *   Email (optional):            RESEND_API_KEY, JOURNEYS_TO_EMAIL, JOURNEYS_FROM_EMAIL
 *   Local development:           JOURNEYS_MODE=log writes the inquiry to the server console only.
 * A request is NEVER reported as saved unless it was stored (or explicitly logged in dev mode).
 */
const hits = new Map<string, number[]>();
const tooMany = (ip: string) => {
  const now = Date.now();
  const r = (hits.get(ip) ?? []).filter((t) => now - t < 600_000);
  r.push(now);
  hits.set(ip, r);
  return r.length > 5;
};
const s = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");
const arr = (v: unknown, max: number, item = 60) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").slice(0, max).map((x) => (x as string).slice(0, item)) : []);

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ error: "bad_request" }, { status: 400 }); }

  const startedAt = Number(b.startedAt);
  if (s(b.website, 100) !== "" || (Number.isFinite(startedAt) && Date.now() - startedAt < 3000)) return NextResponse.json({ ok: true, reference: makeReference() });

  const slugs = new Set(destinations.map((d) => d.slug));
  const stops = Array.isArray(b.stops)
    ? (b.stops as { slug?: unknown; nights?: unknown }[]).slice(0, 12).flatMap((x) => (typeof x.slug === "string" && slugs.has(x.slug) && Number(x.nights) >= 1 && Number(x.nights) <= 30 ? [{ slug: x.slug, nights: Math.floor(Number(x.nights)) }] : []))
    : [];
  const input: InquiryInput = {
    fullName: s(b.fullName, 200), email: s(b.email, 254), country: s(b.country, 100),
    travelFrom: s(b.travelFrom, 10), travelTo: s(b.travelTo, 10),
    travelers: Number(b.travelers), days: b.days ? Number(b.days) : stops.reduce((n, x) => n + x.nights, 0) + 1,
    destinations: arr(b.destinations, 12).filter((d) => slugs.has(d)), stops,
    accommodationPref: s(b.accommodationPref, 20), budgetBand: s(b.budgetBand, 20), budgetNote: s(b.budgetNote, 200),
    experiences: arr(b.experiences, 12, 80), specialRequests: s(b.specialRequests, 4000),
  };
  const errors = validateInquiry(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "invalid", errors }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (tooMany(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const reference = makeReference();
  const row = {
    reference, full_name: input.fullName, email: input.email, country: input.country,
    travel_from: input.travelFrom || null, travel_to: input.travelTo || null, travelers: input.travelers, days: input.days,
    destinations: input.destinations, stops: input.stops, accommodation_pref: input.accommodationPref, budget_band: input.budgetBand,
    budget_note: input.budgetNote, experiences: input.experiences, special_requests: input.specialRequests,
  };

  if (process.env.JOURNEYS_MODE === "log") {
    console.log("[journeys:log]", JSON.stringify(row));
    return NextResponse.json({ ok: true, reference });
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const r = await fetch(`${url}/rest/v1/package_inquiries`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(row),
    });
    if (!r.ok) { console.error("[journeys] supabase", r.status, await r.text()); return NextResponse.json({ error: "store_failed" }, { status: 502 }); }
  } catch (e) { console.error("[journeys] supabase", e); return NextResponse.json({ error: "store_failed" }, { status: 502 }); }

  // Notification is best-effort: the inquiry is already safely stored.
  const rk = process.env.RESEND_API_KEY, to = process.env.JOURNEYS_TO_EMAIL, from = process.env.JOURNEYS_FROM_EMAIL;
  if (rk && to && from) {
    const line = (x: string) => x.replace(/[\r\n]+/g, " ");
    fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${rk}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, reply_to: input.email, subject: `Journeys inquiry ${reference} — ${line(input.fullName)}`,
        text: `${reference}\n${line(input.fullName)} <${line(input.email)}> · ${line(input.country)}\nTravelers: ${input.travelers} · Days: ${input.days}\nStops: ${input.stops.map((x) => `${x.slug} (${x.nights}n)`).join(", ") || input.destinations.join(", ")}\nBudget: ${input.budgetBand}\n\n${input.specialRequests}` }),
    }).catch(() => {});
  }
  return NextResponse.json({ ok: true, reference });
}
