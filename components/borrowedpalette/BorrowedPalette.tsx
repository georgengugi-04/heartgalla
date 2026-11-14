"use client";
import { useMemo, useState } from "react";
import { studioArtists } from "@/lib/borrowedpalette/artworks";
import ArtistGate, { type Start } from "./ArtistGate";
import ErrorBoundary from "./ErrorBoundary";
import Studio from "./Studio";

/** The Borrowed Palette: choose an artist, then work with their colours in a real drawing studio. */
export default function BorrowedPalette() {
  const artists = useMemo(() => studioArtists(), []);
  const [start, setStart] = useState<Start | null>(null);
  const [run, setRun] = useState(0);
  return (
    <ErrorBoundary onReset={() => { setStart(null); setRun((n) => n + 1); }}>
      {start ? <Studio key={run} start={start} artists={artists} onExit={() => setStart(null)} /> : <ArtistGate artists={artists} onStart={(s) => { setRun((n) => n + 1); setStart(s); }} />}
    </ErrorBoundary>
  );
}
