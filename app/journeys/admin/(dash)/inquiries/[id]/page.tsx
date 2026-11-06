import Link from "next/link";
import { notFound } from "next/navigation";
import { QuotationForm, StatusForm } from "@/components/journeys/AdminForms";
import { bySlug } from "@/lib/journeys/destinations";
import { supabaseServer } from "@/lib/journeys/supabase/server";

const STATUSES = ["new", "in_review", "quoted", "accepted", "declined", "closed"] as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const sb = await supabaseServer();
  const { data: i } = await sb.from("package_inquiries").select("*").eq("id", id).maybeSingle();
  if (!i) notFound();
  const { data: quotes } = await sb.from("quotations").select("id, message, total_amount, currency, valid_until, visitor_response, created_at").eq("inquiry_id", id).order("created_at", { ascending: false });
  const stops = (Array.isArray(i.stops) ? i.stops : []) as { slug: string; nights: number }[];
  const row = (k: string, v: React.ReactNode) => <div><dt className="label-mono text-ivory/50">{k}</dt><dd className="mt-1 break-words">{v || "—"}</dd></div>;
  return (
    <>
      <p className="label-mono"><Link href="/journeys/admin/inquiries" className="text-ivory/50 hover:text-gold">Inquiries</Link> / {i.reference}</p>
      <h1 className="font-editorial mt-3 text-4xl">{i.full_name}</h1>
      <dl className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {row("Reference", i.reference)}{row("Email", <a className="underline underline-offset-4" href={`mailto:${i.email}`}>{i.email}</a>)}{row("Country", i.country)}
        {row("Travelers", i.travelers)}{row("Dates", [i.travel_from, i.travel_to].filter(Boolean).join(" → "))}{row("Days", i.days)}
        {row("Budget", [i.budget_band, i.budget_note].filter(Boolean).join(" · "))}{row("Accommodation", i.accommodation_pref)}{row("Experiences", (i.experiences ?? []).join(", "))}
        {row("Route", stops.length ? stops.map((s) => `${bySlug(s.slug)?.name ?? s.slug} (${s.nights}n)`).join(" → ") : (i.destinations ?? []).map((d: string) => bySlug(d)?.name ?? d).join(", "))}
        {row("Received", new Date(i.created_at).toLocaleString("en-GB"))}{row("Status", String(i.status).replace("_", " "))}
      </dl>
      {i.special_requests && <section className="mt-8"><h2 className="label-mono text-ivory/50">Special requests</h2><p className="mt-2 max-w-prose whitespace-pre-wrap">{i.special_requests}</p></section>}

      <section className="mt-12"><h2 className="font-editorial text-2xl">Status</h2><div className="mt-4"><StatusForm id={i.id} current={i.status} statuses={STATUSES} /></div></section>

      <section className="mt-12">
        <h2 className="font-editorial text-2xl">Quotations</h2>
        {quotes && quotes.length > 0 ? (
          <ul className="mt-4 divide-y divide-ivory/10 border-y border-ivory/10">
            {quotes.map((q) => (
              <li key={q.id} className="py-4">
                <p className="label-mono text-ivory/50">{new Date(q.created_at).toLocaleString("en-GB")}{q.total_amount != null && ` · ${q.currency} ${q.total_amount}`}{q.valid_until && ` · valid until ${q.valid_until}`}{q.visitor_response && ` · visitor: ${q.visitor_response.replace("_", " ")}`}</p>
                <p className="mt-2 max-w-prose whitespace-pre-wrap">{q.message}</p>
              </li>
            ))}
          </ul>
        ) : <p className="mt-4 text-ivory/60">No quotation yet.</p>}
        <h3 className="font-editorial mt-10 text-xl">New quotation</h3>
        <p className="mt-1 max-w-prose text-sm text-ivory/50">Saving records the proposal and marks the inquiry as quoted. Nothing is emailed to the visitor yet. Send it yourself, and only quote prices you have confirmed.</p>
        <div className="mt-4"><QuotationForm id={i.id} /></div>
      </section>
    </>
  );
}
