import { Suspense } from "react";
import Link from "next/link";
import ContactForm from "@/components/contact/ContactForm";

export const metadata = {
  title: "Contact — EARTGALLA",
  description: "Ask about an artwork, commission a piece, or talk to EARTGALLA about a collaboration.",
};

const WAYS = [
  { title: "Enquire about an artwork", body: "Open any work in the gallery and choose “Enquire about this work” — it fills in the piece for you. Availability and price are shared directly." },
  { title: "Commission or collaborate", body: "Interested in a commission from one of the artists, or in working with EARTGALLA? Choose it below and tell us a little about the idea." },
  { title: "Press & partners", body: "Writing about Kenyan art, or thinking about a partnership? Start here, or see the partners page." },
];

export default function ContactPage() {
  return (
    <div className="px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono mb-3 text-ivory/60">CONTACT</p>
      <h1 className="mb-6 font-editorial text-4xl md:text-6xl">Get in touch</h1>
      <p className="mb-14 max-w-xl text-lg text-ivory/75">
        Write to EARTGALLA about an artwork, a commission or a collaboration. Tell us what you&apos;re looking for, and we&apos;ll take it from there.
      </p>

      <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="order-2 space-y-10 lg:order-1">
          <ul className="space-y-8">
            {WAYS.map((w) => (
              <li key={w.title} className="border-t border-ivory/10 pt-5">
                <h2 className="mb-2 font-editorial text-2xl">{w.title}</h2>
                <p className="max-w-md text-ivory/70">{w.body}</p>
              </li>
            ))}
          </ul>
          <div className="border-t border-ivory/10 pt-5">
            <h2 className="label-mono mb-3 text-ivory/60">ELSEWHERE</h2>
            <p className="flex flex-wrap gap-x-6 gap-y-2">
              <a href="https://www.instagram.com/eartgalla" target="_blank" rel="noopener noreferrer" className="label-mono inline-flex min-h-11 items-center text-ivory underline-offset-4 hover:text-gold hover:underline">Instagram</a>
              <a href="https://www.tiktok.com/@eartgalla" target="_blank" rel="noopener noreferrer" className="label-mono inline-flex min-h-11 items-center text-ivory underline-offset-4 hover:text-gold hover:underline">TikTok</a>
              <Link href="/for-partners" className="label-mono inline-flex min-h-11 items-center text-ivory underline-offset-4 hover:text-gold hover:underline">For partners</Link>
            </p>
          </div>
        </div>

        <div className="order-1 max-w-xl lg:order-2">
          <Suspense fallback={<p className="label-mono text-ivory/60" role="status">Loading the form…</p>}>
            <ContactForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
