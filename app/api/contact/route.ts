import { NextResponse } from "next/server";
import { TOPICS, validate, type ContactInput } from "@/lib/contact";

/**
 * POST /api/contact — validates on the server (never trust the browser), then delivers the message.
 *
 * Delivery is configured with environment variables (server-side only; nothing here reaches the browser):
 *   RESEND_API_KEY       your Resend API key
 *   CONTACT_TO_EMAIL     where messages should arrive
 *   CONTACT_FROM_EMAIL   a sender your Resend account is allowed to use
 * For local development / staging, CONTACT_MODE=log writes the message to the server log instead of sending it.
 * If neither is set the route answers 503 "not_configured", and the form tells the visitor honestly.
 */
const hits = new Map<string, number[]>(); // best-effort, per server instance
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) for (const [k, v] of hits) if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
  return recent.length > MAX_HITS;
}
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // spam traps: a hidden field real visitors never fill, and a form that was "filled" in under two seconds
  const startedAt = Number(body.startedAt);
  if (str(body.website, 200) !== "" || (Number.isFinite(startedAt) && Date.now() - startedAt < 2000)) {
    return NextResponse.json({ ok: true }); // look successful, send nothing
  }

  const input: ContactInput = {
    name: str(body.name, 300),
    email: str(body.email, 300),
    topic: str(body.topic, 40),
    message: str(body.message, 6000),
    work: str(body.work, 100),
    artist: str(body.artist, 100),
  };
  const errors = validate(input);
  if (Object.keys(errors).length) return NextResponse.json({ error: "invalid", errors }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (tooMany(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const topic = TOPICS.find((t) => t.value === input.topic)?.label ?? input.topic;
  const subject = oneLine(`EARTGALLA — ${topic}${input.work ? ` — ${input.work}` : ""}`);
  const text = [
    `From: ${oneLine(input.name)} <${oneLine(input.email)}>`,
    `About: ${topic}`,
    input.work ? `Artwork: ${oneLine(input.work)}` : null,
    input.artist ? `Artist: ${oneLine(input.artist)}` : null,
    "",
    input.message.trim(),
  ]
    .filter((l) => l !== null)
    .join("\n");

  if (process.env.CONTACT_MODE === "log") {
    console.log(`[contact:log] ${subject}\n${text}`);
    return NextResponse.json({ ok: true });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !to || !from) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [to], reply_to: oneLine(input.email), subject, text }),
    });
    if (!r.ok) return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }
}
