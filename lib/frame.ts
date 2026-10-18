import type { CSSProperties } from "react";

/** Slow, intentional easing used across the gallery and the Art Dialogue. */
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1];

/** Same `sizes` everywhere an artwork is shown large, so the browser reuses one cached variant. */
export const ARTWORK_SIZES = "(max-width: 768px) 100vw, 70vw";

/**
 * An exact-aspect box that *contains* an artwork inside a `container-type: size` parent:
 * the artwork is never cropped and its box never depends on the image having loaded,
 * so nothing shifts. `height` is a percentage of the container's height (default 100).
 */
export function frameStyle(
  width: number,
  height: number,
  opts: { height?: number; maxWidth?: string } = {},
): CSSProperties {
  const ratio = width / height;
  const h = opts.height ?? 100;
  const maxW = opts.maxWidth ?? "100cqw";
  return {
    aspectRatio: `${width} / ${height}`,
    width: `min(${maxW}, calc(${h}cqh * ${ratio.toFixed(5)}))`,
  };
}
