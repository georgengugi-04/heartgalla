import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/journeys/AdminForms";
import { getStaff } from "@/lib/journeys/admin/auth";
import { adminConfigured } from "@/lib/journeys/supabase/server";

export const metadata: Metadata = { title: "Staff sign-in | EARTGALLA Journeys", robots: { index: false, follow: false } };

export default async function Page() {
  if (await getStaff()) redirect("/journeys/admin");
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono text-gold">Journeys · staff</p>
      <h1 className="font-editorial mt-4 text-5xl">Sign in</h1>
      <p className="mt-4 max-w-prose text-ivory/70">For EartGalla Journeys staff. Accounts are created by a super administrator.</p>
      <div className="mt-10">
        {adminConfigured() ? <SignInForm /> : <p className="max-w-prose border border-ivory/20 p-4 text-ivory/70">Admin isn’t configured here yet. Set SUPABASE_URL and SUPABASE_ANON_KEY, then create a staff user (see supabase/README.md).</p>}
      </div>
    </div>
  );
}
