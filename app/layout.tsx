import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import IntroSplash from "@/components/intro/IntroSplash";
import { INTRO_GUARD_SCRIPT } from "@/components/intro/introGuard";

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
    default: "EARTGALLA — Kenyan Art, Global Stage",
    template: "%s",
  },
  description:
    "EARTGALLA is a Kenyan art and culture platform discovering, documenting and presenting emerging creative talent to local and global audiences.",
  openGraph: {
    title: "EARTGALLA — Kenyan Art, Global Stage",
    description: "Kenyan art, told differently.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_GUARD_SCRIPT }} />
        <noscript>
          <style>{`[data-intro-root]{display:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-full flex flex-col bg-charcoal text-ivory">
        <IntroSplash />
        <div className="grain" aria-hidden="true" />
        <Cursor />
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
