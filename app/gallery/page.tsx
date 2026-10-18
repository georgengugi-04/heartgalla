import GalleryGrid from "@/components/GalleryGrid";
import { artworks } from "@/lib/data";
import { getImageSize } from "@/lib/image-size";

export const metadata = {
  title: "The Gallery — EARTGALLA",
  description: "Original works by the artists on EARTGALLA. Open any piece to see it whole, read about it, or enquire.",
};

export default function GalleryPage() {
  // real pixel sizes, read once at build time, so every image reserves its exact space (no layout shift)
  const dims = Object.fromEntries(artworks.map((a) => [a.slug, getImageSize(a.image) ?? { width: 4, height: 5 }]));
  return (
    <div className="px-6 pb-24 pt-32 md:px-10">
      <p className="label-mono mb-3 text-ivory/60">THE GALLERY</p>
      <h1 className="mb-10 font-editorial text-4xl md:text-6xl">Original Works</h1>
      <GalleryGrid dims={dims} />
    </div>
  );
}
