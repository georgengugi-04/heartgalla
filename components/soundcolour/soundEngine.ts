import type { RGB } from "@/lib/palette";

/**
 * The Sound of Colour — how a palette becomes a chord.
 *
 *   hue         → which note (five sectors of the colour wheel → the five notes of a D major pentatonic scale,
 *                 so any palette lands on notes that sit well together)
 *   lightness   → which octave (dark colours low, light colours high)
 *   saturation  → how open the sound is (vivid colours ring brighter; greys are soft and round)
 *
 * It is one honest way of hearing a picture — a choice, not a law of nature — and the page says so.
 */
const SCALE = [0, 2, 4, 7, 9]; // D E F♯ A B, as semitones above the root
const ROOT = 38; // D2 (MIDI)
const NAMES = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

export type ChordNote = { midi: number; name: string; rgb: RGB; brightness: number };

function hsl({ r, g, b }: RGB) {
  const R = r / 255, G = g / 255, B = b / 255;
  const max = Math.max(R, G, B), min = Math.min(R, G, B);
  const l = (max + min) / 2;
  const d = max - min;
  if (d === 0) return { h: 0, s: 0, l };
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = max === R ? ((G - B) / d) % 6 : max === G ? (B - R) / d + 2 : (R - G) / d + 4;
  h = (h * 60 + 360) % 360;
  return { h, s, l };
}

export const noteName = (midi: number) => `${NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

/** A palette → up to five distinct notes, low to high. */
export function paletteToChord(palette: RGB[]): ChordNote[] {
  const used = new Set<number>();
  const notes: ChordNote[] = [];
  for (const rgb of palette) {
    const { h, s, l } = hsl(rgb);
    const degree = s < 0.08 ? 0 : Math.min(4, Math.floor(h / 72)); // greys sit on the root
    const octave = l < 0.25 ? 0 : l < 0.45 ? 1 : l < 0.65 ? 2 : 3;
    let midi = ROOT + 12 * octave + SCALE[degree];
    while (used.has(midi) && midi < ROOT + 12 * 4) midi += 12; // never two identical notes
    if (used.has(midi)) continue;
    used.add(midi);
    notes.push({ midi, name: noteName(midi), rgb, brightness: s });
  }
  return notes.sort((a, b) => a.midi - b.midi);
}

export const CHORD_SECONDS = 9;

export type Playing = { stop: () => void; setVolume: (v: number) => void };

function hall(ctx: AudioContext, seconds = 2.4): ConvolverNode {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

/** Sound the chord: the notes swell in one after another, hold, and fade. `volume` is 0–1. */
export function playChord(ctx: AudioContext, notes: ChordNote[], volume: number, onEnd: () => void): Playing {
  const t0 = ctx.currentTime + 0.05;
  const master = ctx.createGain();
  master.gain.value = volume * 0.5;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 4;
  const wet = ctx.createGain();
  wet.gain.value = 0.34;
  const room = hall(ctx);
  const bus = ctx.createGain();
  bus.connect(comp);
  bus.connect(room);
  room.connect(wet);
  wet.connect(comp);
  comp.connect(master);
  master.connect(ctx.destination);

  const oscs: OscillatorNode[] = [];
  const per = 0.9 / Math.max(1, notes.length);
  notes.forEach((n, i) => {
    const start = t0 + i * 0.45;
    const end = t0 + CHORD_SECONDS;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 500 + n.brightness * 2600; // vivid colours ring brighter
    lp.Q.value = 0.5;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(per, start + 1.6);
    g.gain.setValueAtTime(per, end - 2.4);
    g.gain.linearRampToValueAtTime(0, end);
    for (const [type, cents] of [["triangle", -5], ["sine", 4]] as const) {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = freq(n.midi);
      o.detune.value = cents;
      o.connect(lp);
      o.start(start);
      o.stop(end + 0.1);
      oscs.push(o);
    }
    lp.connect(g);
    g.connect(bus);
  });
  const timer = window.setTimeout(onEnd, CHORD_SECONDS * 1000);

  return {
    setVolume(v) {
      master.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.05);
    },
    stop() {
      window.clearTimeout(timer);
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.5);
      oscs.forEach((o) => {
        try {
          o.stop(t + 0.6);
        } catch {
          /* already stopped */
        }
      });
    },
  };
}
