"use client";
import { useSyncExternalStore } from "react";
import { bySlug } from "./destinations";

export type Stop = { slug: string; nights: number };
const KEY = "egj-trip";
const EVT = "egj-trip-change";
const EMPTY: Stop[] = [];
let cache: { raw: string | null; value: Stop[] } = { raw: null, value: EMPTY };

function read(): Stop[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cache.raw) return cache.value;
    const parsed = raw ? (JSON.parse(raw) as Stop[]) : EMPTY;
    const value = Array.isArray(parsed)
      ? parsed.filter((s) => s && bySlug(s.slug) && Number.isInteger(s.nights) && s.nights >= 1 && s.nights <= 30)
      : EMPTY;
    cache = { raw, value: value.length ? value : EMPTY };
    return cache.value;
  } catch {
    return EMPTY;
  }
}
/** The trip as stored right now (not the render snapshot). Use this before doing anything that could overwrite it. */
export const readTrip = read;
export function setTrip(next: Stop[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable: planner still works until reload */ }
  window.dispatchEvent(new Event(EVT));
}
const subscribe = (cb: () => void) => {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
};
export const useTrip = () => useSyncExternalStore(subscribe, read, () => EMPTY);

export const addStop = (slug: string, nights: number) => { const t = read(); if (!t.some((s) => s.slug === slug)) setTrip([...t, { slug, nights }]); };
export const removeStop = (slug: string) => setTrip(read().filter((s) => s.slug !== slug));
export const moveStop = (i: number, d: -1 | 1) => { const t = [...read()]; const j = i + d; if (j < 0 || j >= t.length) return; [t[i], t[j]] = [t[j], t[i]]; setTrip(t); };
export const setNights = (slug: string, n: number) => setTrip(read().map((s) => (s.slug === slug ? { ...s, nights: Math.min(30, Math.max(1, n)) } : s)));
export const totalNights = (t: Stop[]) => t.reduce((n, s) => n + s.nights, 0);
