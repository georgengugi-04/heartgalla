import type { Crop } from "./browser";
import type { RGB } from "@/lib/borrowedpalette/color";
import type { BrushSettings, PaintTool, ToolId } from "@/lib/borrowedpalette/engine";
import type { PaletteModel } from "@/lib/borrowedpalette/paletteModel";

export type Mode = "free" | "translate" | "limited" | "evolve";
export const MODES: { id: Mode; label: string; title: string; how: string }[] = [
  { id: "free", label: "Free", title: "Free draw", how: "Paint with the borrowed palette, or add and pick any colour you like." },
  { id: "translate", label: "Translation", title: "Colour Translation", how: "The original artwork stays beside your canvas. Make your own interpretation of it using only these colours." },
  { id: "limited", label: "Limited 3", title: "Limited Palette Challenge", how: "Choose just three colours from the palette. Everything you draw must come from those three." },
  { id: "evolve", label: "Evolution", title: "Palette Evolution", how: "Change the saturation, temperature and brightness to grow a new version of the palette. The original is always one tap away." },
];

/** Everything about the studio that is not pixels. Saved with the artwork. */
export type StudioSnapshot = {
  artistId: string;
  workSlug: string;
  crop: Crop | null;
  ignoreBg: boolean;
  model: PaletteModel;
  mode: Mode;
  color: RGB;
  tool: ToolId;
  tools: Record<PaintTool, BrushSettings>;
  title: string;
  creator: string;
  grid: boolean;
};
