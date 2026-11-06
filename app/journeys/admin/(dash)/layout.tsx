import type { Metadata } from "next";
import Link from "next/link";
import { requireStaff } from "@/lib/journeys/admin/auth";
import { signOut } from "../actions";

export const metadata: Metadata = { title: "Journeys admin | EARTGALLA", robots: { index: false, follow: false } };

export default async function Layout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  return (
    <div className="mx-auto max-w-6xl px-6 pb-24 pt-28 md:px-10">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-ivory/10 pb-4">
        <nav aria-label="Admin" className="label-mono flex gap-6">
          <Link href="/journeys/admin" className="hover:text-gold">Overview</Link>
          <Link href="/journeys/admin/inquiries" className="hover:text-gold">Inquiries</Link>
        </nav>
        <form action={signOut} className="flex items-center gap-4">
          <span className="label-mono text-ivory/50">{staff.email} · {staff.role.replace("_", " ")}</span>
          <button type="submit" className="label-mono min-h-11 rounded-full border border-ivory/30 px-5 hover:border-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold">Sign out</button>
        </form>
      </header>
      <div className="pt-10">{children}</div>
    </div>
  );
}
