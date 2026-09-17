export const metadata = { title: "About | EARTGALLA" };

export default function AboutPage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24 max-w-3xl">
      <p className="label-mono text-ivory/50 mb-3">ABOUT</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-10">We Are Building.</h1>
      <p className="font-editorial text-xl leading-relaxed text-ivory/85 mb-6">
        EARTGALLA is a Kenyan art and culture platform — early, and serious about it.
        We're discovering, documenting, and presenting emerging creative talent to local
        and global audiences, starting with three artists whose work we believe in.
      </p>
      <p className="text-ivory/70 leading-relaxed mb-6">
        This is not an established institution with decades of history. It's a founding
        collection, a small roster, and a platform being built in public. We'd rather be
        honest about being young than pretend to a scale we haven't earned yet.
      </p>
      <p className="text-ivory/70 leading-relaxed">
        Every artwork here has an artist and a story behind it — nothing on this site is
        stock imagery standing in for real work.
      </p>
    </div>
  );
}
