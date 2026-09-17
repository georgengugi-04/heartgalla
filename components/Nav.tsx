"use client";
import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/gallery", label: "Art" },
  { href: "/artists", label: "Artists" },
  { href: "/gazette", label: "Gazette" },
  { href: "/wear", label: "Wear" },
  { href: "/art-lab", label: "Art Lab" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference">
      <div className="flex items-center justify-between px-6 md:px-10 py-5">
        <Link href="/" className="flex items-center gap-2.5" data-cursor="view">
          <img src="/brand/icon-only.png" alt="EARTGALLA" className="h-8 md:h-9 w-auto" />
          <span className="font-editorial text-lg md:text-xl tracking-tight text-ivory hidden sm:inline">
            EART<em className="not-italic font-normal opacity-70">GALLA</em>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              data-cursor="view"
              className="label-mono text-ivory hover:opacity-60 transition-opacity"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden text-ivory label-mono"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? "CLOSE" : "MENU"}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-charcoal px-6 pb-8 flex flex-col gap-5">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="font-editorial text-2xl text-ivory">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
