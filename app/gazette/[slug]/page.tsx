import { stories, artists } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  if (!story) return { title: "Story Not Found | EARTGALLA" };
  const title = `${story.title} | EARTGALLA Gazette`;
  return {
    title,
    description: story.excerpt,
    openGraph: { title, description: story.excerpt, images: [{ url: story.coverImage }], type: "article" },
    twitter: { card: "summary_large_image", title, description: story.excerpt, images: [story.coverImage] },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = stories.find((s) => s.slug === slug);
  if (!story) notFound();
  const relatedArtists = artists.filter((a) => story.artists.includes(a.id));

  // same category first, then fill from the rest — never the story itself
  const others = stories.filter((s) => s.slug !== story.slug);
  const sameCategory = others.filter((s) => s.category === story.category);
  const rest = others.filter((s) => s.category !== story.category);
  const more = [...sameCategory, ...rest].slice(0, 3);

  return (
    <article className="pt-28 pb-24">
      <div className="px-6 md:px-10 max-w-3xl mx-auto">
        <p className="label-mono text-gold mb-4">{story.category}</p>
        <h1 className="font-editorial text-4xl md:text-6xl leading-tight mb-8">{story.title}</h1>
      </div>
      <div className="aspect-[16/9] max-w-5xl mx-auto overflow-hidden mb-10">
        <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
      </div>
      <div className="px-6 md:px-10 max-w-3xl mx-auto">
        <p className="font-editorial text-xl leading-relaxed text-ivory/85 mb-8">{story.excerpt}</p>
        {story.content ? (
          <div className="flex flex-col gap-6">
            {story.content.map((p, i) => (
              <p key={i} className="text-ivory/75 leading-relaxed">{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-ivory/50 italic">Full story coming soon.</p>
        )}
        {relatedArtists.length > 0 && (
          <p className="label-mono text-ivory/40 mt-10">Featuring: {relatedArtists.map((a) => a.name).join(", ")}</p>
        )}

        {more.length > 0 && (
          <div className="mt-20 pt-10 border-t border-ivory/10">
            <p className="label-mono text-ivory/50 mb-6">MORE FROM THE GAZETTE</p>
            <div className="grid sm:grid-cols-3 gap-6">
              {more.map((s) => (
                <Link key={s.id} href={`/gazette/${s.slug}`} data-cursor="read" className="group block">
                  <div className="aspect-[4/3] overflow-hidden mb-3">
                    <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <p className="label-mono text-ivory/40 mb-1">{s.category}</p>
                  <p className="font-editorial text-lg leading-snug group-hover:text-gold transition-colors">{s.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
