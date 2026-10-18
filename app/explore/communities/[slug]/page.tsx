import type { Metadata } from "next";
import { notFound } from "next/navigation";
import RecordView from "@/components/atlas/RecordView";
import { communities, getCommunity, practices } from "@/lib/atlas/data";

type Params = { slug: string };

// Communities are added only once documented with the people concerned, so this list can legitimately be empty.
export const dynamicParams = false;
export function generateStaticParams(): Params[] {
  return communities.filter((c) => c.status === "published").map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const c = getCommunity((await params).slug);
  if (!c) return { title: "Not found | EARTGALLA" };
  return { title: `${c.names.primary} | EARTGALLA`, description: c.summary ?? undefined };
}

export default async function CommunityPage({ params }: { params: Promise<Params> }) {
  const c = getCommunity((await params).slug);
  if (!c || c.status !== "published") notFound();
  return (
    <RecordView
      record={c}
      kind="Community"
      facts={[{ label: "Languages", value: c.languages.join(", ") }]}
      related={[
        { heading: "Practices", links: practices.filter((p) => c.practiceIds.includes(p.id)).map((p) => ({ label: p.names.primary, href: `/explore/practices/${p.slug}` })) },
        { heading: "Related communities", links: communities.filter((x) => c.relatedCommunityIds.includes(x.id)).map((x) => ({ label: x.names.primary, href: `/explore/communities/${x.slug}` })) },
      ]}
    >
      <p className="border-t border-ivory/15 pt-6 text-sm text-ivory/65">{c.diversityNote}</p>
    </RecordView>
  );
}
