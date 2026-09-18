export const metadata = { title: "About | EARTGALLA" };

export default function AboutPage() {
  return (
    <div className="pb-24">
      <div className="relative h-[55vh] md:h-[65vh] flex items-end mb-16">
        <img src="/brand/clean/nairobi-skyline.jpg" alt="Nairobi, Kenya" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/20 to-transparent" />
        <div className="relative z-10 px-6 md:px-10 pb-10">
          <p className="label-mono text-ivory/60 mb-3">ABOUT</p>
          <h1 className="font-editorial text-4xl md:text-6xl">We Are Building.</h1>
        </div>
      </div>
      <div className="px-6 md:px-10 max-w-3xl">
      <p className="font-editorial text-xl leading-relaxed text-ivory/85 mb-6">
        EARTGALLA is a Kenyan art and culture platform — early, and serious about it.
        We&apos;re discovering, documenting, and presenting emerging creative talent to local
        and global audiences, starting with three artists whose work we believe in.
      </p>
      <p className="text-ivory/70 leading-relaxed mb-6">
        This is not an established institution with decades of history. It&apos;s a founding
        collection, a small roster, and a platform being built in public. We&apos;d rather be
        honest about being young than pretend to a scale we haven&apos;t earned yet.
      </p>
      <p className="text-ivory/70 leading-relaxed">
        Every artwork here has an artist and a story behind it — nothing on this site is
        stock imagery standing in for real work.
      </p>
      </div>
    </div>
  );
}
