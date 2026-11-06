import Link from "next/link";
import { supabaseServer } from "@/lib/journeys/supabase/server";

export default async function Page({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const sb = await supabaseServer();
  let q = sb.from("package_inquiries").select("id, reference, full_name, country, travelers, days, budget_band, status, created_at").order("created_at", { ascending: false }).limit(100);
  if (status && /^[a-z_]{3,12}$/.test(status)) q = q.eq("status", status);
  const { data, error } = await q;
  return (
    <>
      <h1 className="font-editorial text-4xl">Inquiries</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {["all", "new", "in_review", "quoted", "accepted", "declined", "closed"].map((s) => (
          <Link key={s} href={s === "all" ? "/journeys/admin/inquiries" : `/journeys/admin/inquiries?status=${s}`} className={`label-mono inline-flex min-h-11 items-center rounded-full border px-4 ${(status ?? "all") === s ? "border-gold bg-gold text-charcoal" : "border-ivory/20 hover:border-gold"}`}>{s.replace("_", " ")}</Link>
        ))}
      </div>
      {error && <p role="alert" className="mt-6 border border-kenya-red p-4">Couldn’t load inquiries.</p>}
      {data && data.length === 0 && <p className="mt-8 text-ivory/70">No inquiries here yet.</p>}
      {data && data.length > 0 && (
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="label-mono text-ivory/50"><tr><th className="py-2 pr-4">Reference</th><th className="pr-4">Name</th><th className="pr-4">Country</th><th className="pr-4">Group</th><th className="pr-4">Budget</th><th className="pr-4">Status</th><th>Received</th></tr></thead>
            <tbody className="divide-y divide-ivory/10">
              {data.map((r) => (
                <tr key={r.id}>
                  <td className="py-3 pr-4"><Link href={`/journeys/admin/inquiries/${r.id}`} className="underline underline-offset-4 hover:text-gold">{r.reference}</Link></td>
                  <td className="pr-4">{r.full_name}</td><td className="pr-4">{r.country}</td><td className="pr-4">{r.travelers}</td><td className="pr-4">{r.budget_band}</td><td className="pr-4">{String(r.status).replace("_", " ")}</td>
                  <td>{new Date(r.created_at).toLocaleDateString("en-GB")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
