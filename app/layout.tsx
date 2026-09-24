import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import IntroHost from "@/components/intro/IntroHost";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://eartgalla.vercel.app"),
  title: {
    default: "EARTGALLA — Kenyan Art, Global Stage",
    template: "%s",
  },
  description:
    "EARTGALLA is a Kenyan art and culture platform discovering, documenting and presenting emerging creative talent to local and global audiences.",
  openGraph: {
    title: "EARTGALLA — Kenyan Art, Global Stage",
    description: "Kenyan art, told differently.",
    type: "website",
    images: [{ url: "/brand/icon-wordmark.png", width: 1037, height: 675, alt: "EARTGALLA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EARTGALLA — Kenyan Art, Global Stage",
    description: "Kenyan art, told differently.",
    images: ["/brand/icon-wordmark.png"],
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
        <IntroHost />
        <PageIntro />
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
