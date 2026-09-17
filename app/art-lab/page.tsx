export const metadata = { title: "Art Lab | EARTGALLA" };

const EXPERIMENTS = [
  { title: "Generative Pattern Studies", status: "In Progress", desc: "Exploring algorithmic patterns drawn from motifs across the current collection." },
  { title: "AI-Assisted Fashion Concepts", status: "Planned", desc: "Architecture for turning a painting into a garment concept — see Wear the Art." },
  { title: "Interactive Artwork", status: "Planned", desc: "Pieces designed to respond to the viewer, not just be viewed." },
  { title: "AR Wall Preview", status: "Research", desc: "Letting a collector see a piece on their own wall before buying." },
];

export default function ArtLabPage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24">
      <p className="label-mono text-ivory/50 mb-3">EARTGALLA ART LAB</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-6">Where Technology Meets Art</h1>
      <p className="text-ivory/60 max-w-xl mb-16">
        EARTGALLA isn't only presenting paintings — it's building the infrastructure for
        discovering, wearing, and experiencing Kenyan creativity. This page tracks what
        we're actually building, honestly labeled by status.
      </p>
      <div className="grid md:grid-cols-2 gap-px bg-ivory/10">
        {EXPERIMENTS.map((e) => (
          <div key={e.title} className="bg-charcoal p-8">
            <p className="label-mono text-gold mb-3">{e.status.toUpperCase()}</p>
            <h2 className="font-editorial text-2xl mb-3">{e.title}</h2>
            <p className="text-ivory/60">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
