import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import AddToTrip from "@/components/journeys/AddToTrip";
import RouteMap from "@/components/journeys/RouteMap";
import { bySlug, destinations, CATEGORY_LABEL } from "@/lib/journeys/destinations";

type P = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => destinations.map((d) => ({ slug: d.slug }));
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const d = bySlug((await params).slug);
  return d ? { title: `${d.name}, ${d.county} | EARTGALLA Journeys`, description: d.summary } : {};
}

export default async function Page({ params }: P) {
  const d = bySlug((await params).slug);
  if (!d) notFound();
  const pending = "Not yet verified. We’ll add this once it has been checked with local sources.";
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <nav aria-label="Breadcrumb" className="label-mono text-ivory/50"><Link href="/journeys/destinations" className="hover:text-gold">Destinations</Link> / {d.name}</nav>
      <p className="label-mono mt-8 text-gold">{d.county} County · {d.region}</p>
      <h1 className="font-editorial mt-3 text-6xl md:text-7xl">{d.name}</h1>
      <p className="mt-5 max-w-2xl text-xl text-ivory/80">{d.tagline}</p>
      {d.hero && (
        <figure className="mt-10">
          <Image src={d.hero.src} alt={d.hero.alt} width={d.hero.width} height={d.hero.height} priority sizes="(min-width: 1152px) 1100px, 100vw" className="h-auto max-h-[70vh] w-full object-cover" />
          <figcaption className="label-mono mt-2 text-ivory/50">{d.hero.credit}</figcaption>
        </figure>
      )}
      <div className="mt-8"><AddToTrip slug={d.slug} nights={d.suggestedNights.min} /></div>

      <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-14">
          <section><h2 className="font-editorial text-3xl">About {d.name}</h2><p className="mt-4 max-w-prose leading-relaxed text-ivory/80">{d.summary}</p></section>
          <section>
            <h2 className="font-editorial text-3xl">Main attractions</h2>
            <ul className="mt-5 divide-y divide-ivory/10 border-y border-ivory/10">
              {d.attractions.map((a) => (<li key={a.name} className="py-4"><p className="font-medium">{a.name} <span className="label-mono ml-2 text-ivory/50">{CATEGORY_LABEL[a.kind]}</span></p><p className="mt-1 text-sm text-ivory/70">{a.note}</p>
                {a.photos && (
                  <ul className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
                    {a.photos.map((ph) => (
                      <li key={ph.src}>
                        <figure className="m-0">
                          <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(min-width: 768px) 280px, 50vw" className="aspect-[4/3] h-auto w-full object-cover" />
                          <figcaption className="label-mono mt-1 text-[0.65rem] text-ivory/40">{ph.credit}</figcaption>
                        </figure>
                      </li>
                    ))}
                  </ul>
                )}
              </li>))}
            </ul>
          </section>
          {d.gallery && d.gallery.length > 0 && (
            <section>
              <h2 className="font-editorial text-3xl">Gallery</h2>
              <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                {d.gallery.map((ph) => (
                  <li key={ph.src}>
                    <figure className="m-0">
                      <Image src={ph.src} alt={ph.alt} width={ph.width} height={ph.height} sizes="(min-width: 768px) 280px, 50vw" className="aspect-[4/3] h-auto w-full object-cover" />
                      <figcaption className="label-mono mt-1 text-[0.65rem] text-ivory/40">{ph.credit}</figcaption>
                    </figure>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section><h2 className="font-editorial text-3xl">Culture and community</h2><p className="mt-4 max-w-prose leading-relaxed text-ivory/80">{d.culture}</p></section>
          <section><h2 className="font-editorial text-3xl">Recommended experiences</h2><ul className="mt-4 list-disc space-y-2 pl-5 text-ivory/80">{d.experiences.map((e) => <li key={e}>{e}</li>)}</ul></section>
          <section><h2 className="font-editorial text-3xl">Plan your stay</h2>
            <dl className="mt-4 grid gap-6 sm:grid-cols-2">
              <div><dt className="label-mono text-ivory/50">Suggested stay</dt><dd className="mt-1">{d.suggestedNights.min}–{d.suggestedNights.max} nights</dd></div>
              <div><dt className="label-mono text-ivory/50">Best time to visit</dt><dd className="mt-1 text-ivory/70">{d.bestTime ?? pending}</dd></div>
              <div><dt className="label-mono text-ivory/50">Getting there</dt><dd className="mt-1 text-ivory/70">{d.transport ?? pending}</dd></div>
              <div><dt className="label-mono text-ivory/50">Accommodation and packages</dt><dd className="mt-1 text-ivory/70">No verified listings yet. <Link href="/journeys/build-your-journey" className="underline underline-offset-4 hover:text-gold">Request a quotation</Link>.</dd></div>
            </dl>
          </section>
          {d.related.length > 0 && (<section><h2 className="font-editorial text-3xl">Related destinations</h2><ul className="mt-4 flex flex-wrap gap-2">{d.related.map((r) => { const x = bySlug(r); return x ? <li key={r}><Link href={`/journeys/destinations/${r}`} className="label-mono inline-flex min-h-11 items-center rounded-full border border-ivory/20 px-4 hover:border-gold">{x.name}</Link></li> : null; })}</ul></section>)}
          {d.reviewStatus === "draft" && <p className="border-l-2 border-gold pl-4 text-sm text-ivory/60">Draft content. This page is being reviewed with local partners. Photography will be added from verified, credited sources.</p>}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start"><RouteMap stops={[d.slug]} /></aside>
      </div>
    </div>
  );
}
