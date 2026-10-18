import Image from "next/image";
import { developer } from "@/lib/developer";

export const metadata = {
  title: "About — EARTGALLA",
  description: "EARTGALLA is a Kenyan art and culture platform, early and serious about it — and how it came together.",
};

// The eight beats of the EARTGALLA brand storyboard, with the captions it was drawn with. Nothing here is added:
// the images and the words are the ones already on the homepage's "How We Got Here" reel.
const JOURNEY = [
  { src: "/brand/panels/idea-sketch.jpg", title: "The idea takes shape", alt: "A faint gold line sketch of the EARTGALLA monogram on a dark ground" },
  { src: "/brand/panels/brush-gold-monogram.jpg", title: "Art comes to life", alt: "A brush finishing the gold EARTGALLA monogram in a spray of gold dust" },
  { src: "/brand/panels/logo-reveal-silk.jpg", title: "The logo reveals", alt: "The EARTGALLA logo revealed against dark silk" },
  { src: "/brand/panels/painted-face-story.jpg", title: "The story begins", alt: "A painted face with the words “Kenyan art, told differently”" },
  { src: "/brand/panels/gallery-interior.jpg", title: "Discover the artists", alt: "A dim gallery hung with paintings" },
  { src: "/brand/panels/wear-the-art-jacket.jpg", title: "Wear the art", alt: "A jacket printed with an EARTGALLA artwork, with the words “Art beyond canvas”" },
  { src: "/brand/panels/nairobi-skyline.jpg", title: "A global stage", alt: "The Nairobi skyline at dusk under the words “Contemporary art”" },
  { src: "/brand/panels/logo-with-ribbons.jpg", title: "The journey continues", alt: "The EARTGALLA logo with ribbons of red, green and gold" },
];

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div className="relative mb-16 flex h-[55vh] items-end md:h-[65vh]">
        <Image src="/brand/clean/nairobi-skyline.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        <div className="relative z-10 px-6 pb-10 md:px-10">
          <p className="label-mono mb-3 text-ivory/70">ABOUT</p>
          <h1 className="font-editorial text-4xl md:text-6xl">We Are Building.</h1>
        </div>
      </div>

      <div className="max-w-3xl px-6 md:px-10">
        <p className="mb-6 font-editorial text-xl leading-relaxed text-ivory/90 md:text-2xl">
          EARTGALLA is a Kenyan art and culture platform — early, and serious about it. We&apos;re discovering, documenting, and presenting
          emerging creative talent to local and global audiences, starting with three artists whose work we believe in.
        </p>
        <p className="mb-6 leading-relaxed text-ivory/75">
          This is not an established institution with decades of history. It&apos;s a founding collection, a small roster, and a platform being built in
          public. We&apos;d rather be honest about being young than pretend to a scale we haven&apos;t earned yet.
        </p>
        <p className="leading-relaxed text-ivory/75">
          Every artwork here has an artist and a story behind it — nothing on this site is stock imagery standing in for real work.
        </p>
      </div>

      {/* HOW WE GOT HERE — a timeline, told in the storyboard's own eight beats */}
      <section aria-labelledby="journey" className="mt-24 px-6 md:px-10">
        <p className="label-mono mb-3 text-ivory/60">HOW WE GOT HERE</p>
        <h2 id="journey" className="mb-3 font-editorial text-3xl md:text-5xl">From an idea to a stage.</h2>
        <p className="mb-14 max-w-xl text-ivory/70">Eight beats from the EARTGALLA brand storyboard — the way we first drew the story, in order.</p>
        <ol className="relative max-w-4xl border-l border-gold/40 pl-8 md:pl-12">
          {JOURNEY.map((j, i) => (
            <li key={j.title} className="relative mb-12 last:mb-0 md:grid md:grid-cols-[minmax(0,320px)_1fr] md:items-center md:gap-10">
              <span
                aria-hidden="true"
                className="absolute -left-[2.55rem] top-1 grid h-5 w-5 place-items-center rounded-full border border-gold/60 bg-charcoal md:-left-[3.55rem] md:top-1/2 md:-translate-y-1/2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              </span>
              <div className="relative mb-4 aspect-[3/2] overflow-hidden bg-black/30 md:mb-0">
                <Image src={j.src} alt={j.alt} fill sizes="(max-width: 768px) 80vw, 320px" className="object-cover" />
              </div>
              <div>
                <p className="label-mono mb-2 text-gold">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="font-editorial text-2xl md:text-3xl">{j.title}</h3>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="max-w-3xl px-6 md:px-10">
        <section id="built-by" aria-labelledby="built-by-h" className="mt-24 scroll-mt-24 border-t border-ivory/10 pt-10">
          <h2 id="built-by-h" className="label-mono mb-4 text-ivory/60">BUILT BY</h2>
          <p className="mb-2 font-editorial text-2xl">
            {developer.name} <span className="text-ivory/60">({developer.alias})</span>
          </p>
          <p className="mb-1 leading-relaxed text-ivory/75">
            {developer.role}. {developer.study} {developer.brand}
          </p>
          <p className="label-mono mt-5 flex flex-wrap gap-x-6 gap-y-1 text-ivory/70">
            {developer.links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center hover:text-ivory">
                {l.label}
              </a>
            ))}
          </p>
        </section>
      </div>
    </div>
  );
}
