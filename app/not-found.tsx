import Link from "next/link";

export const metadata = { title: "Page Not Found | EARTGALLA" };

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 pt-20">
      <img src="/brand/icon-only.png" alt="" className="w-16 h-16 opacity-50 mb-8" aria-hidden="true" />
      <p className="label-mono text-ivory/50 mb-4">404</p>
      <h1 className="font-editorial text-3xl md:text-5xl mb-6">This piece isn&apos;t on the wall.</h1>
      <p className="text-ivory/60 max-w-sm mb-10">
        The page you were looking for does not exist, or has moved. Here is the way back to the collection.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/" className="label-mono border border-ivory/30 rounded-full px-6 py-3">Home</Link>
        <Link href="/gallery" className="label-mono border border-ivory/30 rounded-full px-6 py-3">Gallery</Link>
      </div>
    </div>
  );
}
