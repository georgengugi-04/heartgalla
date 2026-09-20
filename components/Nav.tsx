"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const LINKS = [
  { href: "/gallery", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/gazette", label: "Gazette" },
  { href: "/stories", label: "Stories" },
  { href: "/wear", label: "Wear" },
  { href: "/art-lab", label: "Art Lab" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Escape closes the mobile menu
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname?.startsWith(href));

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-charcoal/70 backdrop-blur-md border-b border-ivory/10">
      <div className="flex items-center justify-between px-6 md:px-10 py-4 md:py-5">
        <Link href="/" className="flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm" data-cursor="view">
          <img src="/brand/icon-only.png" alt="EARTGALLA" className="h-8 md:h-9 w-auto" />
          <span className="font-editorial text-lg md:text-xl tracking-tight text-ivory hidden sm:inline">
            EART<em className="not-italic font-normal opacity-70">GALLA</em>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor="view"
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`label-mono transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm ${
                isActive(l.href) ? "text-ivory opacity-100" : "text-ivory hover:opacity-60 opacity-80"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-ivory label-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold px-3 py-1.5 border border-ivory/25 rounded-full"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-nav"
            aria-label="Mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden bg-charcoal overflow-hidden border-t border-ivory/10"
          >
            <div className="px-6 pb-8 pt-2 flex flex-col gap-5">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`font-editorial text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold rounded-sm ${isActive(l.href) ? "text-gold" : "text-ivory"}`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
