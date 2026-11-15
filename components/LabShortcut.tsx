"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** A small "Art Lab" button that appears once you've scrolled past the top of a page, so the Lab is one tap away anywhere. */
export default function LabShortcut() {
  const path = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 500);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  // Not inside the Lab itself, or the admin area
  if (path.startsWith("/art-lab") || path.startsWith("/journeys/admin")) return null;
  return (
    <Link
      href="/art-lab/borrowed-palette"
      aria-label="Open the Art Lab: make your own picture with an artist's colours"
      tabIndex={scrolled ? 0 : -1}
      aria-hidden={!scrolled}
      className={`label-mono fixed right-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full border border-gold bg-charcoal/90 px-5 text-gold shadow-lg backdrop-blur-sm transition-all duration-300 hover:bg-gold hover:text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ivory md:right-8 motion-reduce:transition-none ${scrolled ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <span aria-hidden className="flex gap-0.5"><i className="h-2.5 w-2.5 rounded-full bg-[#E7B037]" /><i className="h-2.5 w-2.5 rounded-full bg-[#143F71]" /><i className="h-2.5 w-2.5 rounded-full bg-[#A5391B]" /></span>
      ART LAB
    </Link>
  );
}
