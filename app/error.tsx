"use client";
import { useEffect } from "react";
import Link from "next/link";

/** Shown when a page hits an unexpected error. Friendly, and always offers a way forward. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 pb-24 pt-32 text-center">
      <p className="label-mono mb-4 text-gold">SOMETHING WENT WRONG</p>
      <h1 className="mb-4 font-editorial text-4xl md:text-6xl">This page didn&apos;t load.</h1>
      <p className="mb-10 max-w-md text-ivory/70">
        That&apos;s on our side, not yours. Try again — or head back to the gallery; the work is still here.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="label-mono rounded-full border border-gold px-6 py-3 text-gold transition-colors hover:bg-gold hover:text-charcoal"
        >
          TRY AGAIN
        </button>
        <Link href="/gallery" className="label-mono rounded-full border border-ivory/40 px-6 py-3 transition-colors hover:border-ivory">
          BACK TO THE GALLERY
        </Link>
      </div>
    </div>
  );
}
