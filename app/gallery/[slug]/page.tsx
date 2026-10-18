import { artworks, artists } from "@/lib/data";
import { balancedOrder } from "@/lib/balance";
import { UNVERIFIED_TITLES } from "@/lib/catalogueChecks";
import { getImageSize } from "@/lib/image-size";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import ArtworkViewer from "@/components/artwork/ArtworkViewer";

const SITE = "https://eartgalla.vercel.app";
const ORDER = balancedOrder(artworks); // the order the gallery shows, so "previous / next" match it

export function generateStaticParams() {
  return artworks.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) return { title: "Artwork not found | EARTGALLA" };
  const artist = artists.find((a) => a.id === artwork.artistId);
  const title = `${artwork.title}${artist ? ` — ${artist.name}` : ""} | EARTGALLA`;
  const description =
    artwork.description ??
    `${artwork.title}${artist ? ` by ${artist.name}` : ""}${artwork.medium ? `, ${artwork.medium.toLowerCase()}` : ""} — part of the EARTGALLA collection.`;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: artwork.image }], type: "website", siteName: "EARTGALLA" },
    twitter: { card: "summary_large_image", title, description, images: [artwork.image] },
  };
}

/** What we can honestly say about availability — never more than the data does. */
function availability(a: (typeof artworks)[number]) {
  if (a.availability === "sold") return "Sold";
  if (a.availability === "available") return "Available";
  return "Enquire for availability";
}

export default async function ArtworkPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const artwork = artworks.find((a) => a.slug === slug);
  if (!artwork) notFound();
  const artist = artists.find((a) => a.id === artwork.artistId)!;
  const size = getImageSize(artwork.image) ?? { width: 4, height: 5 };

  // previous / next, in the gallery's own order
  const i = ORDER.findIndex((a) => a.id === artwork.id);
  const prev = ORDER[(i - 1 + ORDER.length) % ORDER.length];
  const next = ORDER[(i + 1) % ORDER.length];

  // discovery: more from this artist, then a work by someone else — never a work whose title is still unverified
  const clean = (a: (typeof artworks)[number]) => a.id !== artwork.id && !UNVERIFIED_TITLES.has(a.slug);
  const same = ORDER.filter((a) => a.artistId === artist.id && clean(a)).slice(0, 3);
  const others = ORDER.filter((a) => a.artistId !== artist.id && clean(a)).slice(0, 4 - same.length);
  const related = [...same, ...others];
  const moreByArtist = artworks.filter((a) => a.artistId === artist.id && a.id !== artwork.id).length;

  const facts = [
    ["Medium", artwork.medium],
    ["Year", artwork.year],
    ["Dimensions", artwork.dimensions],
    ["Collection", artwork.collection],
  ].filter(([, v]) => v !== null && v !== undefined && String(v).trim() !== "") as [string, string | number][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: artwork.title,
    image: `${SITE}${artwork.image}`,
    url: `${SITE}/gallery/${artwork.slug}`,
    creator: { "@type": "Person", name: artist.name },
    ...(artwork.medium ? { artMedium: artwork.medium } : {}),
    ...(artwork.year ? { dateCreated: String(artwork.year) } : {}),
  };

  return (
    <article className="pb-24 pt-24 md:pt-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* way back, and along */}
      <div className="mb-6 flex items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/gallery" className="label-mono inline-flex min-h-11 items-center text-ivory/70 transition-colors hover:text-ivory">
          ← THE GALLERY
        </Link>
        <nav aria-label="Other works" className="flex items-center gap-2">
          <Link href={`/gallery/${prev.slug}`} rel="prev" className="label-mono inline-flex min-h-11 items-center px-2 text-ivory/70 hover:text-ivory" aria-label={`Previous work: ${prev.title}`}>
            ← PREV
          </Link>
          <Link href={`/gallery/${next.slug}`} rel="next" className="label-mono inline-flex min-h-11 items-center px-2 text-ivory/70 hover:text-ivory" aria-label={`Next work: ${next.title}`}>
            NEXT →
          </Link>
        </nav>
      </div>

      <div className="grid gap-10 px-6 md:px-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-16">
        {/* THE ARTWORK — the hero */}
        <figure className="min-w-0">
          <ArtworkViewer src={artwork.image} alt={`${artwork.title} by ${artist.name}`} title={artwork.title} width={size.width} height={size.height} />
        </figure>

        {/* TITLE → ARTIST → FACTS → STORY → ENQUIRY */}
        <div className="min-w-0 lg:pt-4">
          <p className="label-mono mb-4 text-gold">{availability(artwork).toUpperCase()}</p>
          <h1 className="font-editorial text-4xl leading-[1.02] md:text-5xl">{artwork.title}</h1>
          <p className="mt-3">
            <Link href={`/artists/${artist.slug}`} className="label-mono text-ivory transition-colors hover:text-gold">
              {artist.name.toUpperCase()}
            </Link>
          </p>

          {facts.length > 0 && (
            <dl className="mt-8 grid max-w-md grid-cols-[auto_1fr] gap-x-8 gap-y-3 border-t border-ivory/10 pt-6">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="label-mono text-ivory/60">{k}</dt>
                  <dd className="text-ivory/90">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <section aria-labelledby="about-work" className="mt-10">
            <h2 id="about-work" className="label-mono mb-3 text-ivory/60">
              ABOUT THE WORK
            </h2>
            {artwork.description ? (
              <p className="max-w-prose text-lg leading-relaxed text-ivory/85">{artwork.description}</p>
            ) : (
              <p className="max-w-prose italic text-ivory/60">
                The story of this piece hasn&apos;t been published yet. Ask us about it and we&apos;ll share what we know.
              </p>
            )}
          </section>

          <section aria-labelledby="enquire" className="mt-10 border-t border-ivory/10 pt-8">
            <h2 id="enquire" className="label-mono mb-3 text-ivory/60">
              INTERESTED IN THIS WORK?
            </h2>
            <p className="mb-5 max-w-prose text-ivory/75">
              {artwork.price ? `KES ${artwork.price.toLocaleString()}. ` : "Price on request. "}
              Send an enquiry about this piece — availability and price are shared directly.
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href={`/contact?work=${encodeURIComponent(artwork.slug)}#form`}
                className="label-mono inline-flex min-h-12 items-center rounded-full border border-gold px-7 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal"
              >
                ENQUIRE ABOUT THIS WORK
              </Link>
              <Link href="/wear" className="label-mono inline-flex min-h-11 items-center text-ivory/70 underline-offset-4 hover:text-ivory hover:underline">
                Imagine it as a wearable →
              </Link>
            </div>
          </section>
        </div>
      </div>

      {/* THE ARTIST */}
      <section aria-labelledby="the-artist" className="mt-20 px-6 md:px-10">
        <div className="grid gap-8 border-t border-ivory/10 pt-12 md:grid-cols-[auto_1fr_auto] md:items-start md:gap-12">
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-gold/40 bg-black/30 md:h-28 md:w-28">
            {artist.portrait ? (
              <Image src={artist.portrait} alt={`Portrait of ${artist.name}`} fill sizes="112px" className="object-cover" />
            ) : (
              <Image src="/brand/icon-only.png" alt="" fill sizes="112px" className="object-contain p-6 opacity-70" />
            )}
          </div>
          <div className="min-w-0">
            <h2 id="the-artist" className="label-mono mb-2 text-ivory/60">
              ABOUT THE ARTIST
            </h2>
            <p className="font-editorial text-3xl">{artist.name}</p>
            {artist.location && <p className="label-mono mt-1 text-ivory/60">{artist.location}</p>}
            <p className="mt-4 max-w-prose leading-relaxed text-ivory/80">{artist.statement ?? artist.bio ?? `${artist.name}'s profile is being prepared.`}</p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link href={`/artists/${artist.slug}`} className="label-mono inline-flex min-h-11 items-center border-b border-ivory/40 pb-0.5 text-ivory transition-colors hover:border-gold hover:text-gold">
              MEET {artist.name.split(" ")[0].toUpperCase()} →
            </Link>
            {moreByArtist > 0 && (
              <Link href={`/gallery`} className="label-mono inline-flex min-h-11 items-center text-ivory/60 hover:text-ivory">
                {moreByArtist} more work{moreByArtist === 1 ? "" : "s"} in the gallery
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* RELATED */}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-20 px-6 md:px-10">
          <h2 id="related" className="label-mono mb-6 text-ivory/60">
            KEEP LOOKING
          </h2>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
            {related.map((r) => {
              const by = artists.find((x) => x.id === r.artistId);
              return (
                <li key={r.id}>
                  <Link href={`/gallery/${r.slug}`} data-cursor="view" className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">
                    <span className="relative block aspect-[4/5] overflow-hidden bg-black/25">
                      <Image src={r.image} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-contain p-2 transition-transform duration-700 group-hover:scale-[1.03]" />
                    </span>
                    <span className="mt-3 block font-editorial text-lg leading-tight">{r.title}</span>
                    {by && <span className="label-mono mt-1 block text-ivory/60">{by.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}
