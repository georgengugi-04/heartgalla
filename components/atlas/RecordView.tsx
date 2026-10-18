import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { AtlasRecordBase, Claim, ClaimKind } from "@/lib/atlas/types";

const CLAIM_HEADING: Record<ClaimKind, { title: string; note: string }> = {
  verified: { title: "Documented", note: "Checked against a source listed below." },
  attributed: { title: "In their words", note: "Accounts given by the people named. We present them as theirs, not as settled fact." },
  interpretation: { title: "Readings", note: "Interpretations and opinions, shown as such." },
};

const PERMISSION_LABEL = {
  public: "Open to share",
  "attribution-required": "Share with credit",
  "community-restricted": "Restricted by the community",
  withheld: "Permission not held",
} as const;

export type Related = { heading: string; links: { label: string; href: string }[] };

export default function RecordView({
  record,
  kind,
  facts,
  related,
  children,
}: {
  record: AtlasRecordBase;
  kind: string;
  facts?: { label: string; value: string }[];
  related?: Related[];
  children?: ReactNode;
}) {
  const sourceById = new Map(record.sources.map((s) => [s.id, s]));
  const groups = (["verified", "attributed", "interpretation"] as ClaimKind[])
    .map((k) => ({ k, claims: record.claims.filter((c) => c.kind === k) }))
    .filter((g) => g.claims.length > 0);

  return (
    <article className="px-6 pb-24 pt-32 md:px-10">
      <nav aria-label="Breadcrumb" className="mb-8 text-sm text-ivory/60">
        <ol className="flex flex-wrap gap-2">
          <li><Link href="/explore" className="underline underline-offset-4">Explore</Link></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{record.names.primary}</li>
        </ol>
      </nav>

      <header className="grid items-end gap-10 md:grid-cols-2">
        <div>
          <p className="text-sm text-gold">{kind}</p>
          <h1 className="mt-2 font-editorial text-4xl leading-tight md:text-6xl">{record.names.primary}</h1>
          {record.names.alternates && record.names.alternates.length > 0 && (
            <p className="mt-3 text-ivory/65">Also known as {record.names.alternates.join(", ")}</p>
          )}
          {record.summary && <p className="mt-6 max-w-prose text-lg leading-relaxed text-ivory/80">{record.summary}</p>}
        </div>
        {record.coverImage && (
          <div className="relative aspect-[4/3] overflow-hidden bg-ivory/5">
            <Image src={record.coverImage} alt={`${record.names.primary}: cover image`} fill priority sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
          </div>
        )}
      </header>

      {record.status !== "published" && (
        <p role="note" className="mt-10 max-w-prose border-l-2 border-gold pl-4 text-ivory/80">
          This record is still in review. Some details, including who made which works, are being confirmed with the people concerned.
        </p>
      )}

      <div className="mt-16 grid gap-16 lg:grid-cols-[minmax(0,40rem)_1fr]">
        <div className="space-y-14">
          {facts && facts.length > 0 && (
            <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {facts.filter((f) => f.value).map((f) => (
                <div key={f.label}>
                  <dt className="text-sm text-ivory/55">{f.label}</dt>
                  <dd className="mt-1 text-ivory/90">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {groups.length === 0 ? (
            <p className="text-ivory/70">No documented claims have been added to this record yet.</p>
          ) : (
            groups.map(({ k, claims }) => (
              <section key={k} aria-labelledby={`claims-${k}`}>
                <h2 id={`claims-${k}`} className="font-editorial text-2xl">{CLAIM_HEADING[k].title}</h2>
                <p className="mt-1 text-sm text-ivory/55">{CLAIM_HEADING[k].note}</p>
                <ul className="mt-5 space-y-5">
                  {claims.map((c: Claim, i) => (
                    <li key={i} className="leading-relaxed text-ivory/85">
                      <p>{c.text}</p>
                      <p className="mt-1 text-sm text-ivory/55">
                        {c.speaker ? `${c.speaker}. ` : ""}
                        {c.sourceIds.map((id) => sourceById.get(id)?.title).filter(Boolean).join("; ")}
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}
          {children}
        </div>

        <aside className="space-y-12 text-sm">
          {related?.filter((r) => r.links.length > 0).map((r) => (
            <section key={r.heading} aria-label={r.heading}>
              <h2 className="font-editorial text-xl">{r.heading}</h2>
              <ul className="mt-3 space-y-2">
                {r.links.map((l) => (
                  <li key={l.href}><Link href={l.href} className="text-ivory/85 underline underline-offset-4 hover:text-ivory">{l.label}</Link></li>
                ))}
              </ul>
            </section>
          ))}

          <section aria-label="Credit and permission">
            <h2 className="font-editorial text-xl">Credit and permission</h2>
            <ul className="mt-3 space-y-1 text-ivory/80">
              {record.attribution.map((a) => <li key={a.name + a.role}>{a.name}, {a.role.replace("-", " ")}</li>)}
            </ul>
            <p className="mt-4 text-ivory/80">{PERMISSION_LABEL[record.permission.level]}. {record.permission.commercial ? "Commercial use is permitted." : "Not cleared for commercial use."}</p>
            {record.permission.grantedBy && <p className="mt-1 text-ivory/60">Granted by: {record.permission.grantedBy}</p>}
            {record.permission.note && <p className="mt-1 text-ivory/60">{record.permission.note}</p>}
          </section>

          <section aria-label="Sources and review">
            <h2 className="font-editorial text-xl">Sources and review</h2>
            <ul className="mt-3 space-y-2 text-ivory/80">
              {record.sources.map((s) => <li key={s.id}>{s.title}, {s.holder}{s.date ? `, ${s.date}` : ""}</li>)}
            </ul>
            <p className="mt-4 text-ivory/60">
              {record.reviewedBy ? `Reviewed by ${record.reviewedBy}.` : "Not yet reviewed."} Updated {record.updatedAt}.
            </p>
            <Link href="/contact" className="mt-4 inline-block min-h-11 underline underline-offset-4">Request a correction or withdrawal</Link>
          </section>
        </aside>
      </div>
    </article>
  );
}
