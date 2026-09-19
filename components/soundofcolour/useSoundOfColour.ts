"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sonification, ToneParams } from "@/lib/sonify";

type ToneNodes = {
  osc: OscillatorNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  panner: StereoPannerNode;
  params: ToneParams;
};

// short algorithmic decay — no external audio file, just generated noise
function buildImpulse(ctx: AudioContext, seconds = 2.2) {
  const len = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.2);
    }
  }
  return buffer;
}

export type ActiveTone = { index: number; triggeredAt: number; durationMs: number };

export function useSoundOfColour() {
  const [playing, setPlaying] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const tonesRef = useRef<ToneNodes[]>([]);
  const masterRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number | null>(null);
  const activeRef = useRef<ActiveTone>({ index: -1, triggeredAt: 0, durationMs: 0 });
  const sonRef = useRef<Sonification | null>(null);

  const teardown = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    for (const t of tonesRef.current) {
      try { t.osc.stop(); } catch {}
    }
    tonesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
    setPlaying(false);
  }, []);

  const start = useCallback((son: Sonification, volume: number) => {
    teardown();
    sonRef.current = son;
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    masterRef.current = master;

    // shared reverb send, mixed by form-derived amount
    const convolver = ctx.createConvolver();
    convolver.buffer = buildImpulse(ctx);
    const wet = ctx.createGain();
    wet.gain.value = son.reverbMix * 0.6;
    convolver.connect(wet);
    wet.connect(master);

    const nodes: ToneNodes[] = son.tones.map((params) => {
      const osc = ctx.createOscillator();
      osc.type = son.mode === "arpeggio" ? "triangle" : "sine";
      osc.frequency.value = params.freq;
      osc.detune.value = params.detune;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = params.cutoff;

      const gain = ctx.createGain();
      gain.gain.value = 0;

      const panner = ctx.createStereoPanner();
      panner.pan.value = params.pan;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(panner);
      panner.connect(master);
      panner.connect(convolver);

      osc.start();
      return { osc, filter, gain, panner, params };
    });
    tonesRef.current = nodes;

    const attackMs = son.mode === "arpeggio" ? 30 : son.mode === "pulse" ? 150 : 800;
    const decayMs = son.mode === "arpeggio" ? son.tempoMs * 0.5 : son.mode === "pulse" ? son.tempoMs * 0.8 : son.tempoMs * 1.5;

    let i = 0;
    function pluck() {
      const audioCtx = ctxRef.current;
      const node = tonesRef.current[i];
      if (!audioCtx || !node) return;
      const now = audioCtx.currentTime;
      const g = node.gain.gain;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(node.params.gain, now + attackMs / 1000);
      g.linearRampToValueAtTime(0, now + (attackMs + decayMs) / 1000);
      activeRef.current = { index: i, triggeredAt: performance.now(), durationMs: attackMs + decayMs };
      i = (i + 1) % tonesRef.current.length;
    }
    pluck();
    timerRef.current = window.setInterval(pluck, son.tempoMs);
    setPlaying(true);
  }, [teardown]);

  const setVolume = useCallback((v: number) => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.linearRampToValueAtTime(v, ctxRef.current.currentTime + 0.05);
    }
  }, []);

  useEffect(() => teardown, [teardown]);

  return { playing, start, stop: teardown, setVolume, activeRef };
}
