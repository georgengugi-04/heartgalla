/**
 * Build-time image dimensions for files in /public (JPEG and PNG only).
 * Server-side only — uses fs, so import it from server components / lib code
 * that runs during rendering, never from a "use client" file.
 *
 * Why: the collection gallery frames each artwork at its true aspect ratio so
 * nothing is cropped and nothing shifts while images load. Reading the header
 * at build time means the sizes can never go stale when a new image is added.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

export type ImageSize = { width: number; height: number };

const cache = new Map<string, ImageSize | null>();

function readJpeg(buf: Buffer): ImageSize | null {
  let i = 2; // skip SOI
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    // SOF0–SOF15 except DHT (C4), JPG (C8) and DAC (CC)
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) { i += 2; continue; }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return null;
}

function readPng(buf: Buffer): ImageSize | null {
  if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

/** `src` is a public URL such as "/art/lenny/between-hours.jpg". Returns null if unreadable. */
export function getImageSize(src: string): ImageSize | null {
  if (cache.has(src)) return cache.get(src) ?? null;
  let size: ImageSize | null = null;
  try {
    const buf = readFileSync(path.join(process.cwd(), "public", src));
    size = buf[0] === 0xff && buf[1] === 0xd8 ? readJpeg(buf) : readPng(buf);
  } catch {
    size = null;
  }
  cache.set(src, size);
  return size;
}
