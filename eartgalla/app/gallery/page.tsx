import GalleryGrid from "@/components/GalleryGrid";

export const metadata = { title: "Gallery | EARTGALLA" };

export default function GalleryPage() {
  return (
    <div className="pt-32 px-6 md:px-10 pb-24">
      <p className="label-mono text-ivory/50 mb-3">THE GALLERY</p>
      <h1 className="font-editorial text-4xl md:text-6xl mb-14">Original Works</h1>
      <GalleryGrid />
    </div>
  );
}
