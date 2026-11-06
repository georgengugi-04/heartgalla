import Link from "next/link";
import { supabaseServer } from "@/lib/journeys/supabase/server";

export default async function Page() {
  const sb = await supabaseServer();
  const count = async (status?: string) => {
    let q = sb.from("package_inquiries").select("id", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    return (await q).count ?? 0;
  };
  const [all, fresh, review, quoted] = await Promise.all([count(), count("new"), count("in_review"), count("quoted")]);
  const cards = [["New", fresh], ["In review", review], ["Quoted", quoted], ["All inquiries", all]] as const;
  return (
    <>
      <h1 className="font-editorial text-4xl">Overview</h1>
      <ul className="mt-8 grid gap-px bg-ivory/10 sm:grid-cols-4">
        {cards.map(([l, n]) => <li key={l} className="bg-charcoal p-6"><p className="label-mono text-ivory/50">{l}</p><p className="font-editorial mt-2 text-5xl">{n}</p></li>)}
      </ul>
      <p className="mt-8"><Link href="/journeys/admin/inquiries" className="label-mono underline underline-offset-4 hover:text-gold">Open inquiries</Link></p>
      <p className="mt-10 max-w-prose text-sm text-ivory/50">Destinations, packages and accommodation are still managed in code (lib/journeys). Editing them here comes once the public pages read from the database.</p>
    </>
  );
}
