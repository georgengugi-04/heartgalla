import { ogAlt, ogSize, renderCard } from "./_og/card";

export const alt = ogAlt;
export const size = ogSize;
export const contentType = "image/png";
export default function Image() {
  return renderCard();
}
