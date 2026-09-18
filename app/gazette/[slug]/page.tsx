import { stories, artists } from "@/lib/data";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

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
      </div>
    </article>
  );
}
