/**
 * The intro's music — synthesised live with the Web Audio API, so there is no audio file to license,
 * host or download. Roughly 18 seconds: a warm pad moving Dm9 → B♭maj7 → Gm9 → Fmaj9 → Cadd9
 * (it darkens on "why do we practice?" and opens up on "great"), a soft low root, and sparse
 * thumb-piano-style plucks with a little echo, all in a gentle hall.
 *
 * The chord changes are aligned with the visual timeline in IntroSplash (SCENE_STARTS there).
 * If the visitor unlocks sound late, `startIntroMusic(ctx, fromSeconds)` joins the music
 * at the matching moment instead of starting from the top.
 *
 * Works with a real AudioContext and with an OfflineAudioContext (used to test loudness).
 */

/** Length of the whole piece, including its fade-out. */
export const INTRO_SECONDS = 18.0;
/** Overall loudness (0–1). Everything is quiet by design — this is a background bed, not a track. */
export const MUSIC_VOLUME = 0.5;

const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

type Chord = { at: number; until: number; bass: number; pad: number[] };

// Times are seconds on the intro clock; they match the scene changes in IntroSplash.
const CHORDS: Chord[] = [
  { at: 0.0, until: 3.3, bass: 38, pad: [50, 53, 57, 60, 64] }, //  Dm9    — "Art does not need to be seen."
  { at: 3.3, until: 6.9, bass: 46, pad: [50, 53, 57, 62] }, //      B♭maj7 — "practice makes perfect / no one is perfect"
  { at: 6.9, until: 9.6, bass: 43, pad: [58, 62, 65, 69] }, //      Gm9    — "So why do we practice?"
  { at: 9.6, until: 14.0, bass: 41, pad: [57, 60, 64, 67] }, //     Fmaj9  — "…still be great."
  { at: 14.0, until: 18.0, bass: 36, pad: [55, 60, 62, 64, 67] }, // Cadd9  — the resolution / EARTGALLA
];

// [time, midi note, loudness] — a sparse, pentatonic-leaning pattern that follows the chords.
const PLUCKS: [number, number, number][] = [
  [1.1, 74, 0.1], [2.3, 69, 0.08],
  [3.9, 77, 0.1], [4.7, 74, 0.09], [5.5, 69, 0.09], [6.2, 72, 0.08],
  [7.4, 70, 0.09], [8.4, 74, 0.08],
  [10.0, 69, 0.1], [10.5, 72, 0.1], [11.0, 76, 0.11], [11.5, 77, 0.1], [12.0, 81, 0.1], [12.5, 79, 0.09], [13.1, 76, 0.09],
  [14.3, 79, 0.1], [14.9, 84, 0.09], [15.6, 86, 0.08], [16.4, 79, 0.07], [17.1, 76, 0.06],
];

export type MusicHandle = {
  /** Fade out over `seconds` and silence everything. */
  stop: (seconds?: number) => void;
  /** Mute / unmute without stopping the piece. */
  setMuted: (muted: boolean) => void;
};

function makeReverb(ctx: BaseAudioContext, seconds = 2.8): ConvolverNode {
  const rate = ctx.sampleRate;
  const len = Math.floor(rate * seconds);
  const ir = ctx.createBuffer(2, len, rate);
  for (let c = 0; c < 2; c++) {
    const d = ir.getChannelData(c);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

export function startIntroMusic(ctx: BaseAudioContext, fromSeconds = 0): MusicHandle {
  const now = ctx.currentTime + 0.05;
  const at = (t: number) => now + Math.max(0, t - fromSeconds); // intro-clock time → context time

  // signal chain: voices → dry + hall → soft compressor → master → speakers
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, now);
  master.gain.linearRampToValueAtTime(MUSIC_VOLUME, now + 1.6);
  const fadeStart = at(INTRO_SECONDS - 2.4);
  master.gain.setValueAtTime(MUSIC_VOLUME, Math.max(fadeStart, now + 1.6));
  master.gain.linearRampToValueAtTime(0, at(INTRO_SECONDS));

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -20;
  comp.ratio.value = 4;
  comp.attack.value = 0.05;
  comp.release.value = 0.4;

  const bus = ctx.createGain();
  const hall = makeReverb(ctx);
  const wet = ctx.createGain();
  wet.gain.value = 0.36;
  bus.connect(comp);
  bus.connect(hall);
  hall.connect(wet);
  wet.connect(comp);
  comp.connect(master);
  master.connect(ctx.destination);

  // a soft echo that only the plucks feed
  const echoIn = ctx.createGain();
  const echo = ctx.createDelay(1);
  echo.delayTime.value = 0.42;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.3;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = "lowpass";
  echoTone.frequency.value = 2200;
  echoIn.connect(echo);
  echo.connect(echoTone);
  echoTone.connect(feedback);
  feedback.connect(echo);
  echoTone.connect(bus);

  const oscillators: OscillatorNode[] = [];
  const track = <T extends OscillatorNode>(o: T) => {
    oscillators.push(o);
    return o;
  };

  // ── pad: two slightly detuned oscillators through a filter that slowly opens ──
  function padVoice(freq: number, start: number, end: number, level: number) {
    const t0 = at(start);
    const t1 = at(end) + 1.6; // let the release overlap the next chord for a smooth change
    if (t1 <= now) return;
    const attack = start < fromSeconds ? 0.5 : 1.4;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 0.4;
    lp.frequency.setValueAtTime(520, t0);
    lp.frequency.linearRampToValueAtTime(1700, t1 - 1.0);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(level, t0 + attack);
    g.gain.setValueAtTime(level, Math.max(t0 + attack, t1 - 1.6));
    g.gain.linearRampToValueAtTime(0, t1);
    for (const [type, cents] of [["triangle", -6], ["sine", 5]] as const) {
      const o = track(ctx.createOscillator());
      o.type = type;
      o.frequency.value = freq;
      o.detune.value = cents;
      o.connect(lp);
      o.start(t0);
      o.stop(t1 + 0.1);
    }
    lp.connect(g);
    g.connect(bus);
  }

  for (const c of CHORDS) {
    if (at(c.until) + 1.6 <= now) continue;
    for (const n of c.pad) padVoice(midi(n), c.at, c.until, 0.05);
    // the low root, felt more than heard
    const t0 = at(c.at);
    const t1 = at(c.until) + 1.4;
    const o = track(ctx.createOscillator());
    o.type = "sine";
    o.frequency.value = midi(c.bass);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.16, t0 + 1.2);
    g.gain.setValueAtTime(0.16, Math.max(t0 + 1.2, t1 - 1.4));
    g.gain.linearRampToValueAtTime(0, t1);
    o.connect(g);
    g.connect(bus);
    o.start(t0);
    o.stop(t1 + 0.1);
  }

  // ── plucks: a soft sine with a quick octave "tine" — thumb-piano-like, not a synth lead ──
  for (const [time, note, vel] of PLUCKS) {
    if (time < fromSeconds) continue;
    const t0 = at(time);
    const f = midi(note);
    const tone = ctx.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 3600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vel, t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.5);
    const tine = ctx.createGain();
    tine.gain.setValueAtTime(0.0001, t0);
    tine.gain.linearRampToValueAtTime(vel * 0.35, t0 + 0.004);
    tine.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
    const a = track(ctx.createOscillator());
    a.type = "sine";
    a.frequency.value = f;
    const b = track(ctx.createOscillator());
    b.type = "sine";
    b.frequency.value = f * 2.01;
    a.connect(g);
    b.connect(tine);
    g.connect(tone);
    tine.connect(tone);
    tone.connect(bus);
    tone.connect(echoIn);
    a.start(t0);
    b.start(t0);
    a.stop(t0 + 1.6);
    b.stop(t0 + 0.5);
  }

  let muted = false;
  return {
    stop(seconds = 1.2) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + seconds);
      const end = t + seconds + 0.1;
      for (const o of oscillators) {
        try {
          o.stop(end);
        } catch {
          /* already stopped */
        }
      }
    },
    setMuted(next) {
      if (next === muted) return;
      muted = next;
      const t = ctx.currentTime;
      const target = next ? 0 : MUSIC_VOLUME;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(target, t + 0.4);
    },
  };
}
