import { RGB, artDNA } from "@/lib/palette";

// A minor pentatonic across ~2.5 octaves — no interval in this set can clash,
// so however the colors land, the result stays listenable.
const SCALE = [196.0, 220.0, 261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

function rgbToHsl({ r, g, b }: RGB) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export type ToneParams = {
  freq: number;
  gain: number;      // 0–1, driven by lightness
  cutoff: number;     // lowpass filter Hz, driven by saturation
  pan: number;        // -1..1
  detune: number;     // cents
};

export type Sonification = {
  tones: ToneParams[];
  tempoMs: number;    // ms between arpeggio notes
  mode: "drone" | "arpeggio" | "pulse";
  reverbMix: number;  // 0–1
  dna: ReturnType<typeof artDNA>;
};

/**
 * Turns a real extracted palette into a small set of audio-graph parameters.
 * Explicitly an artistic interpretation (same spirit as Art DNA elsewhere in
 * the Lab) — colour has no true pitch, this is one honest way of listening.
 */
export function sonifyPalette(palette: RGB[]): Sonification {
  const dna = artDNA(palette);

  const tones: ToneParams[] = palette.map((c, i) => {
    const { h, s, l } = rgbToHsl(c);
    const idx = Math.floor((h / 360) * SCALE.length) % SCALE.length;
    let freq = SCALE[idx];
    if (l > 0.72) freq *= 2;       // very light colors sing an octave up
    if (l < 0.22) freq *= 0.5;     // very dark colors drop an octave

    return {
      freq,
      gain: 0.12 + l * 0.18,
      cutoff: 500 + s * 4500,
      pan: (i / (palette.length - 1 || 1)) * 1.6 - 0.8,
      detune: (s - 0.5) * 20,
    };
  });

  const mode: Sonification["mode"] =
    dna.energy === "Dynamic" ? "arpeggio" : dna.energy === "Earthbound" ? "drone" : "pulse";
  const tempoMs = dna.energy === "Dynamic" ? 260 : dna.energy === "Calm" ? 620 : 900;
  const reverbMix = dna.form === "Layered" ? 0.55 : dna.form === "Organic" ? 0.35 : 0.15;

  return { tones, tempoMs, mode, reverbMix, dna };
}
