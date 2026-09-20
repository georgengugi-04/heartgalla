import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-ivory/10 mt-32 px-6 md:px-10 py-14">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div>
          <img src="/brand/icon-wordmark.png" alt="EARTGALLA" className="h-16 w-auto mb-2" />
          <p className="label-mono opacity-50 mt-2">Kenyan Art · Global Stage</p>
        </div>
        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 label-mono opacity-80">
          <Link href="/gallery">Art</Link>
          <Link href="/artists">Artists</Link>
          <Link href="/gazette">Gazette</Link>
          <Link href="/stories">Stories</Link>
          <Link href="/wear">Wear the Art</Link>
          <Link href="/art-lab">Art Lab</Link>
          <Link href="/about">About</Link>
          <Link href="/for-partners">For Partners</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="flex flex-col gap-3">
          <div className="flex gap-4 label-mono">
            <a href="https://www.instagram.com/eartgalla" target="_blank" rel="noopener">Instagram</a>
            <a href="https://www.tiktok.com/@eartgalla" target="_blank" rel="noopener">TikTok</a>
          </div>
          <p className="label-mono opacity-40">Kenya</p>
        </div>
      </div>
      <p className="label-mono opacity-30 mt-14">© {new Date().getFullYear()} EARTGALLA. Building, not claiming.</p>
    </footer>
  );
}
