import { stories, artists } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  if (!story) return { title: "Story not found | EARTGALLA" };
  const title = `${story.title} | EARTGALLA Gazette`;
  return {
    title,
    description: story.excerpt,
    openGraph: { title, description: story.excerpt, images: [{ url: story.coverImage }], type: "article", siteName: "EARTGALLA", ...(story.publishedAt ? { publishedTime: story.publishedAt } : {}) },
    twitter: { card: "summary_large_image", title, description: story.excerpt, images: [story.coverImage] },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = stories.findIndex((s) => s.slug === slug);
  if (i === -1) notFound();
  const story = stories[i];
  const relatedArtists = artists.filter((a) => story.artists.includes(a.id));
  const more = [stories[(i + 1) % stories.length], stories[(i + 2) % stories.length]].filter((s) => s.id !== story.id);

  // reading time is worked out from the text itself, so it is never a made-up number
  const words = (story.content ?? []).join(" ").split(/\s+/).filter(Boolean).length;
  const minutes = words ? Math.max(1, Math.round(words / 200)) : 0;
  const date = story.publishedAt ? new Date(story.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

  return (
    <article className="pb-24 pt-28">
      <header className="mx-auto max-w-3xl px-6 md:px-10">
        <Link href="/gazette" className="label-mono mb-8 inline-flex min-h-11 items-center text-ivory/70 hover:text-ivory">← THE GAZETTE</Link>
        <p className="label-mono mb-5 text-gold">
          {story.category}
          {minutes > 0 && <span className="text-ivory/60"> · {minutes} min read</span>}
        </p>
        <h1 className="mb-8 font-editorial text-4xl leading-[1.05] md:text-6xl">{story.title}</h1>
        <p className="font-editorial text-xl italic leading-relaxed text-ivory/85 md:text-2xl">{story.excerpt}</p>
        <p className="label-mono mt-8 text-ivory/60">
          {story.author ? `By ${story.author}` : "EARTGALLA Gazette"}
          {date && <> · <time dateTime={story.publishedAt}>{date}</time></>}
        </p>
      </header>

      <figure className="mx-auto my-12 max-w-5xl px-0 md:px-10">
        <div className="relative aspect-[16/9] overflow-hidden bg-black/30">
          <Image src={story.coverImage} alt="" fill priority sizes="(max-width: 1024px) 100vw, 1024px" className="object-cover" />
        </div>
      </figure>

      <div className="mx-auto max-w-[40rem] px-6 md:px-0">
        {story.content ? (
          <div className="flex flex-col gap-7 text-[1.1875rem] leading-[1.85] text-ivory/85">
            {story.content.map((p, n) => (
              <p key={n} className={n === 0 ? "first-letter:float-left first-letter:mr-3 first-letter:font-editorial first-letter:text-[4.2rem] first-letter:leading-[0.85] first-letter:text-gold" : undefined}>
                {p}
              </p>
            ))}
          </div>
        ) : (
          <p className="italic text-ivory/60">The full story is coming soon.</p>
        )}

        {relatedArtists.length > 0 && (
          <aside aria-labelledby="featuring" className="mt-16 border-t border-ivory/10 pt-8">
            <h2 id="featuring" className="label-mono mb-4 text-ivory/60">FEATURING</h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-2">
              {relatedArtists.map((a) => (
                <li key={a.id}>
                  <Link href={`/artists/${a.slug}`} className="inline-flex min-h-11 items-center font-editorial text-2xl underline-offset-4 hover:text-gold hover:underline">{a.name} →</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more" className="mx-auto mt-20 max-w-5xl px-6 md:px-10">
          <h2 id="more" className="label-mono mb-6 text-ivory/60">MORE FROM THE GAZETTE</h2>
          <ul className="grid gap-6 md:grid-cols-2">
            {more.map((s) => (
              <li key={s.id}>
                <Link href={`/gazette/${s.slug}`} className="group grid grid-cols-[7rem_1fr] items-center gap-5 border-t border-ivory/10 pt-6">
                  <span className="relative block aspect-[4/3] overflow-hidden bg-black/25">
                    <Image src={s.coverImage} alt="" fill sizes="112px" className="object-cover" />
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
    </article>
  );
}
