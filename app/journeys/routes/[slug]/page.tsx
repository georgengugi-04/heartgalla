import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import RouteMap from "@/components/journeys/RouteMap";
import UseRoute from "@/components/journeys/UseRoute";
import { bySlug } from "@/lib/journeys/destinations";
import { suggestedRoutes } from "@/lib/journeys/routes";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => suggestedRoutes.map((r) => ({ slug: r.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const r = suggestedRoutes.find((x) => x.slug === slug);
  return r ? { title: `${r.name} | EARTGALLA Journeys`, description: r.blurb } : {};
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const r = suggestedRoutes.find((x) => x.slug === slug);
  if (!r) notFound();
  const nights = r.stops.reduce((n, s) => n + s.nights, 0);
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <nav aria-label="Breadcrumb" className="label-mono text-ivory/50"><Link href="/journeys/planner" className="hover:text-gold">Planner</Link> / Suggested routes</nav>
      <p className="label-mono mt-8 text-gold">Suggested route · draft</p>
      <h1 className="font-editorial mt-3 text-5xl md:text-6xl">{r.name}</h1>
      <p className="mt-5 max-w-2xl text-xl text-ivory/80">{r.blurb}</p>
      <p className="label-mono mt-4 text-ivory/60">{r.stops.map((s) => `${bySlug(s.slug)?.name} (${s.nights}n)`).join(" → ")} · {nights} nights · {nights + 1} days</p>
      <p className="label-mono mt-1 text-terracotta">Feasibility: not yet verified. No prices or accommodation selected.</p>
      {r.draftNote && <p className="mt-6 max-w-prose border-l-2 border-gold pl-4 text-sm text-ivory/70">{r.draftNote}</p>}
      <div className="mt-8"><UseRoute stops={r.stops} /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_24rem]">
        <div>
          {r.days ? (
            <ol className="divide-y divide-ivory/10 border-y border-ivory/10">
              {r.days.map((d) => (
                <li key={d.day} className="grid gap-3 py-6 sm:grid-cols-[6rem_1fr]">
                  <p className="label-mono text-gold">Day {d.day}</p>
                  <div>
                    <h2 className="font-editorial text-2xl">{d.title}</h2>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-ivory/80">{d.plan.map((x) => <li key={x}>{x}</li>)}</ul>
                    {d.stay && <p className="label-mono mt-3 text-ivory/50">Overnight: {d.stay}</p>}
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="max-w-prose text-ivory/70">A day-by-day plan for this route has not been written yet. Use it as a starting point in the planner.</p>
          )}
          {r.verify && (
            <section className="mt-12">
              <h2 className="font-editorial text-3xl">Still to verify</h2>
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-ivory/70">{r.verify.map((v) => <li key={v}>{v}</li>)}</ul>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start"><RouteMap stops={r.stops.map((s) => s.slug)} /></aside>
      </div>
    </div>
  );
}
