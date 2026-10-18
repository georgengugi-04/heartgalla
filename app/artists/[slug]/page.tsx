import { artists, stories, worksByArtist } from "@/lib/data";
import { UNVERIFIED_TITLES } from "@/lib/catalogueChecks";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export function generateStaticParams() {
  return artists.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) return { title: "Artist not found | EARTGALLA" };
  const title = `${artist.name} — EARTGALLA`;
  const description = artist.bio ?? `${artist.name}, part of the EARTGALLA roster of Kenyan artists.`;
  const image = worksByArtist(artist.id)[0]?.image ?? artist.coverImage;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "profile", siteName: "EARTGALLA" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artist = artists.find((a) => a.slug === slug);
  if (!artist) notFound();
  const works = worksByArtist(artist.id);
  const hero = works[0]?.image ?? artist.coverImage;
  const first = artist.name.split(" ")[0];
  const articles = stories.filter((s) => s.artists.includes(artist.id));
  const social = Object.entries(artist.socialLinks).filter(([, url]) => !!url) as [string, string][];

  // the works we're confident about lead the "selected" wall; the rest stay one click away in the full gallery
  const confident = works.filter((w) => !UNVERIFIED_TITLES.has(w.slug));
  const selected = (confident.length ? confident : works).slice(0, 9);

  // what a complete profile has, and which parts this one doesn't have yet — shown plainly, never faked
  const parts = [
    { label: "Portrait", done: !!artist.portrait },
    { label: "Artistic practice", done: !!artist.statement },
    { label: "Story", done: articles.length > 0 },
  ];
  const incomplete = parts.some((p) => !p.done);

  return (
    <div className="pb-24">
      {/* HERO */}
      <div className="relative flex h-[62vh] items-end md:h-[70vh]">
        <Image src={hero} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/25 to-charcoal/10" />
        <div className="relative z-10 flex items-end gap-5 px-6 pb-12 md:px-10 md:pb-14">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-gold/60 bg-charcoal/80 shadow-lg md:h-28 md:w-28">
            {artist.portrait ? (
              <Image src={artist.portrait} alt={`Portrait of ${artist.name}`} fill sizes="112px" className="object-cover" />
            ) : (
              <Image src="/brand/icon-only.png" alt="" fill sizes="112px" className="object-contain p-4 opacity-70 md:p-6" />
            )}
          </div>
          <div className="min-w-0">
            {artist.location && <p className="label-mono mb-3 text-ivory/70">{artist.location}</p>}
            <h1 className="font-editorial text-5xl leading-[0.98] md:text-7xl">{artist.name}</h1>
          </div>
        </div>
      </div>

      {/* INTRODUCTION · PRACTICE · FACTS */}
      <div className="grid gap-12 px-6 pt-14 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:gap-16 md:px-10">
        <div className="min-w-0">
          <section aria-labelledby="intro">
            <h2 id="intro" className="label-mono mb-4 text-ivory/60">
              INTRODUCTION
            </h2>
            {artist.bio ? (
              <p className="max-w-prose text-lg leading-relaxed text-ivory/85">{artist.bio}</p>
            ) : (
              <p className="italic text-ivory/60">{artist.name}&apos;s introduction is on its way.</p>
            )}
          </section>

          <section aria-labelledby="practice" className="mt-12">
            <h2 id="practice" className="label-mono mb-4 text-ivory/60">
              ARTISTIC PRACTICE
            </h2>
            {artist.statement ? (
              <p className="max-w-prose font-editorial text-2xl leading-relaxed">{artist.statement}</p>
            ) : (
              <p className="max-w-prose italic text-ivory/60">
                Coming soon — this is being written with {first}, in {first === artist.name ? "their" : "his"} own words where possible.
              </p>
            )}
          </section>
        </div>

        <aside className="min-w-0 space-y-10" aria-label={`${artist.name} at a glance`}>
          <dl className="grid grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-ivory/10 pt-6">
            {artist.location && (
              <>
                <dt className="label-mono text-ivory/60">Based in</dt>
                <dd>{artist.location}</dd>
              </>
            )}
            <dt className="label-mono text-ivory/60">On EARTGALLA</dt>
            <dd>
              {works.length} work{works.length === 1 ? "" : "s"}
            </dd>
            {social.map(([name, url]) => (
              <div key={name} className="contents">
                <dt className="label-mono text-ivory/60 capitalize">{name}</dt>
                <dd>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:text-gold hover:underline">
                    Visit profile
                  </a>
                </dd>
              </div>
            ))}
          </dl>

          {incomplete && (
            <div className="border border-ivory/15 p-5" aria-labelledby="in-progress">
              <h2 id="in-progress" className="label-mono mb-3 text-gold">
                PROFILE IN PROGRESS
              </h2>
              <p className="mb-4 text-sm leading-relaxed text-ivory/75">
                {first} is part of the EARTGALLA roster. The rest of the profile will be added here as it&apos;s confirmed with {first === artist.name ? "them" : "him"}.
              </p>
              <ul className="space-y-1.5 text-sm">
                {parts.map((p) => (
                  <li key={p.label} className="flex items-center justify-between gap-4">
                    <span className="text-ivory/85">{p.label}</span>
                    <span className={p.done ? "label-mono text-gold" : "label-mono text-ivory/60"}>{p.done ? "Published" : "Coming soon"}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Link
            href={`/contact?artist=${artist.slug}&topic=commission#form`}
            className="label-mono inline-flex min-h-12 items-center rounded-full border border-gold px-7 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal"
          >
            ENQUIRE ABOUT {first.toUpperCase()}
          </Link>
        </aside>
      </div>

      {/* SELECTED WORKS */}
      <section aria-labelledby="works" className="mt-20 px-6 md:px-10">
        <div className="mb-6 flex items-end justify-between gap-6">
          <h2 id="works" className="label-mono text-ivory/60">
            SELECTED WORKS
          </h2>
          {works.length > selected.length && (
            <Link href="/gallery" className="label-mono inline-flex min-h-11 items-center text-ivory/70 hover:text-ivory">
              ALL {works.length} IN THE GALLERY →
            </Link>
          )}
        </div>
        {selected.length === 0 ? (
          <p className="italic text-ivory/60">Works by {artist.name} will appear here.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {selected.map((w) => (
              <li key={w.id}>
                <Link href={`/gallery/${w.slug}`} data-cursor="view" className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
                  <span className="relative block aspect-[4/5] overflow-hidden bg-black/25">
                    <Image src={w.image} alt="" fill sizes="(max-width: 768px) 50vw, 33vw" className="object-contain p-3 transition-transform duration-700 group-hover:scale-[1.03]" />
                  </span>
                  <span className="mt-3 block font-editorial text-xl leading-tight">{w.title}</span>
                  {w.medium && <span className="label-mono mt-1 block text-ivory/60">{w.medium}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* IN THE GAZETTE */}
      {articles.length > 0 && (
        <section aria-labelledby="gazette" className="mt-20 px-6 md:px-10">
          <h2 id="gazette" className="label-mono mb-6 text-ivory/60">
            IN THE GAZETTE
          </h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {articles.map((s) => (
              <li key={s.id}>
                <Link href={`/gazette/${s.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-5 border-t border-ivory/10 pt-6 md:grid-cols-[9rem_1fr]">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-black/25">
                    <Image src={s.coverImage} alt="" fill sizes="144px" className="object-cover" />
                  </span>
                  <span>
                    <span className="label-mono block text-ivory/60">{s.category}</span>
                    <span className="mt-1 block font-editorial text-xl leading-snug group-hover:italic">{s.title}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
