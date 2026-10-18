import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogAlt = "EARTGALLA — Kenyan Contemporary Art";

/** The site's default social-share card: wordmark, tagline, a gold hairline — nothing that isn't already on the site. */
export function renderCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#131211",
          color: "#f4efe6",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 6, color: "#c9a24a", textTransform: "uppercase" }}>
          Nairobi / Kenya — Contemporary Art
        </div>
        <div style={{ fontSize: 128, letterSpacing: 10, marginTop: 28, lineHeight: 1 }}>EARTGALLA</div>
        <div style={{ width: 120, height: 2, background: "#c9a24a", marginTop: 36 }} />
        <div style={{ fontSize: 40, marginTop: 36, color: "#b9b3a8" }}>Kenyan art, told differently.</div>
      </div>
    ),
    { ...ogSize },
  );
}
