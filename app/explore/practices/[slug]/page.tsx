import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RecordView from "@/components/atlas/RecordView";
import { getPractice, practices } from "@/lib/atlas/data";
import { artists, artworks } from "@/lib/data";

type Params = { slug: string };

// every valid slug is prebuilt, so an unknown one is a real 404
export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return practices.filter((p) => p.status === "published" || p.status === "in-review").map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = getPractice((await params).slug);
  if (!p) return { title: "Not found | EARTGALLA" };
  return { title: `${p.names.primary} | EARTGALLA`, description: p.summary ?? undefined };
}

export default async function PracticePage({ params }: { params: Promise<Params> }) {
  const p = getPractice((await params).slug);
  if (!p || p.status === "draft" || p.status === "withdrawn") notFound();
  return (
    <RecordView
      record={p}
      kind="Practice"
      facts={[
        { label: "Materials", value: p.materials.join(", ") },
        { label: "Techniques", value: p.techniques.join(", ") },
        { label: "Era", value: p.era.join(" and ") },
        { label: "Classified as", value: p.classifications.map((c) => c.label).join(", ") },
      ]}
      related={[
        { heading: "Makers", links: artists.filter((a) => p.artistIds.includes(a.id)).map((a) => ({ label: a.name, href: `/artists/${a.slug}` })) },
        { heading: "Works", links: artworks.filter((w) => p.artworkIds.includes(w.id)).map((w) => ({ label: w.title, href: `/gallery/${w.slug}` })) },
      ]}
    />
  );
}
