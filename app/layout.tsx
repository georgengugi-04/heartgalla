import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import IntroSplash from "@/components/intro/IntroSplash";
import { INTRO_GUARD_SCRIPT } from "@/components/intro/introGuard";
import PageIntro from "@/components/pageintro/PageIntro";
import { PAGE_INTRO_GUARD_SCRIPT } from "@/components/pageintro/pageIntroGuard";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://eartgalla.vercel.app"),
  title: {
    default: "EARTGALLA — Kenyan Contemporary Art",
    template: "%s",
  },
  // every page names its own address ("./" resolves against metadataBase + the page's path)
  alternates: { canonical: "./" },
  description:
    "EARTGALLA is a Kenyan art and culture platform discovering, documenting and presenting emerging creative talent to local and global audiences.",
  openGraph: {
    title: "EARTGALLA — Kenyan Contemporary Art",
    description: "Kenyan art, told differently.",
    type: "website",
    siteName: "EARTGALLA",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "EARTGALLA — Kenyan Contemporary Art",
    description: "Kenyan art, told differently.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* first-visit intro: tags <html> before first paint if the visitor has already seen it */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD_SCRIPT }} />
        {/* each page's short opening message: hides itself from the first frame if it shouldn't play */}
        <script dangerouslySetInnerHTML={{ __html: PAGE_INTRO_GUARD_SCRIPT }} />
        <noscript>
          <style>{`[data-intro-root]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-charcoal text-ivory">
        <a
          href="#main"
          className="label-mono sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:border focus:border-gold focus:bg-charcoal focus:px-4 focus:py-3 focus:text-ivory"
        >
          Skip to content
        </a>
        <IntroSplash />
        <PageIntro />
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
