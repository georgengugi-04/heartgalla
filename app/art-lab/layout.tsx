// Art Lab (including every experiment page under it, and The Art Dialogue) is
// designed as a dark room, independent of the site-wide light/dark toggle — see
// lib/theme.ts. This just re-asserts data-theme="dark" for this whole route
// segment; CSS custom properties inherit down from here regardless of what <html>
// is set to.
export default function ArtLabLayout({ children }: { children: React.ReactNode }) {
  return <div data-theme="dark">{children}</div>;
}
