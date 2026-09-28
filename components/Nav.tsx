"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const LINKS = [
  { href: "/gallery", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/gazette", label: "Gazette" },
  { href: "/stories", label: "Stories" },
  { href: "/wear", label: "Wear" },
  { href: "/art-lab", label: "Art Lab" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Nav() {
  const pathname = usePathname() ?? "/";
  // The menu is "open for" the page it was opened on, so any route change (a link, or the browser's Back) closes it.
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const toggle = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpenPath(null);
        toggle.current?.focus(); // keyboard users land back where they were
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ivory/10 bg-charcoal/70 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-3 md:px-10 md:py-4">
        <Link
          href="/"
          aria-label="EARTGALLA — home"
          className="flex min-h-11 items-center gap-2.5 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          data-cursor="view"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/icon-only.png" alt="" className="h-8 w-auto md:h-9" />
          <span aria-hidden="true" className="hidden font-editorial text-lg tracking-tight text-ivory sm:inline md:text-xl">
            EART<em className="font-normal not-italic opacity-70">GALLA</em>
          </span>
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor="view"
              aria-current={isActive(l.href) ? "page" : undefined}
              className={`label-mono inline-flex min-h-11 items-center border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                isActive(l.href) ? "border-gold text-ivory" : "border-transparent text-ivory/80 hover:text-ivory"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          ref={toggle}
          type="button"
          onClick={() => setOpenPath(open ? null : pathname)}
          className="label-mono min-h-11 rounded-full border border-ivory/25 px-4 text-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold md:hidden"
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
            className="overflow-hidden border-t border-ivory/10 bg-charcoal md:hidden"
          >
            <div className="flex flex-col px-6 pb-6 pt-2">
              {LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`flex min-h-12 items-center rounded-sm font-editorial text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                    isActive(l.href) ? "text-gold" : "text-ivory"
                  }`}
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
