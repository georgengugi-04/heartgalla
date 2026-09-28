"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#131211", color: "#f4efe6", fontFamily: "Georgia, serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: 24 }}>
          <div>
            <p style={{ color: "#c9a24a", letterSpacing: 3, fontSize: 13, textTransform: "uppercase" }}>EARTGALLA</p>
            <h1 style={{ fontWeight: 400, fontSize: 40, margin: "16px 0" }}>Something went wrong.</h1>
            <p style={{ color: "#b9b3a8", maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.6 }}>
              The page couldn&apos;t load. Please try again.
            </p>
            <button
              onClick={reset}
              style={{ background: "none", color: "#c9a24a", border: "1px solid #c9a24a", borderRadius: 999, padding: "12px 24px", cursor: "pointer", letterSpacing: 2, fontSize: 13 }}
            >
              TRY AGAIN
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
