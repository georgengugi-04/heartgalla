"use client";
import { useEffect, useRef, useCallback } from "react";
import { RGB, rgbToCss } from "@/lib/palette";

type Particle = {
  x: number; y: number; vx: number; vy: number;
  size: number; color: RGB; alpha: number; life: number; maxLife: number;
};

type Settings = { particles: number; flow: number; grain: number; chaos: number };

export function useAlchemyCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  palette: RGB[],
  settings: Settings,
  active: boolean
) {
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: -9999, y: -9999, down: false });
  const frozenRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const tRef = useRef(0);

  const spawn = useCallback((w: number, h: number, n: number) => {
    const arr: Particle[] = [];
    for (let i = 0; i < n; i++) {
      const color = palette[Math.floor(Math.random() * palette.length)] ?? { r: 184, g: 151, b: 79 };
      arr.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 1 + Math.random() * 2.4,
        color,
        alpha: 0.25 + Math.random() * 0.5,
        life: 0,
        maxLife: 400 + Math.random() * 600,
      });
    }
    particlesRef.current = arr;
  }, [palette]);

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    canvas.style.width = parent.clientWidth + "px";
    canvas.style.height = parent.clientHeight + "px";
    const ctx = canvas.getContext("2d");
    ctx?.scale(dpr, dpr);
  }, [canvasRef]);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [resize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = () => canvas.getBoundingClientRect();
    spawn(rect().width, rect().height, Math.round(settings.particles));
  }, [palette, settings.particles, spawn, canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function frame() {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      tRef.current += 1;

      // gentle fade for trailing effect rather than hard clear
      ctx.fillStyle = "rgba(19,18,17,0.10)";
      ctx.fillRect(0, 0, w, h);

      if (!frozenRef.current) {
        const t = tRef.current * 0.01;
        for (const p of particlesRef.current) {
          // organic flow field via layered sine waves, scaled by "flow"
          const flow = settings.flow / 50;
          const chaos = settings.chaos / 50;
          const angle = Math.sin(p.x * 0.006 + t) + Math.cos(p.y * 0.006 - t);
          p.vx += Math.cos(angle) * 0.02 * flow + (Math.random() - 0.5) * 0.06 * chaos;
          p.vy += Math.sin(angle) * 0.02 * flow + (Math.random() - 0.5) * 0.06 * chaos;

          // pointer influence — gentle swirl, not chaotic repulsion
          const dx = p.x - pointerRef.current.x, dy = p.y - pointerRef.current.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const force = (1 - dist / 120) * (pointerRef.current.down ? 0.9 : 0.35);
            p.vx += (dy / (dist || 1)) * force;
            p.vy += (-dx / (dist || 1)) * force;
          }

          p.vx *= 0.96; p.vy *= 0.96;
          p.x += p.vx; p.y += p.vy;
          p.life += 1;

          if (p.x < -20) p.x = w + 20; if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20; if (p.y > h + 20) p.y = -20;
          if (p.life > p.maxLife) { p.life = 0; p.x = Math.random() * w; p.y = Math.random() * h; }

          const flicker = 0.7 + 0.3 * Math.sin(p.life * 0.05);
          ctx.beginPath();
          ctx.fillStyle = rgbToCss(p.color, p.alpha * flicker);
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }

        // grain overlay
        const grainAmount = settings.grain / 100;
        if (grainAmount > 0) {
          const dots = Math.round(grainAmount * 40);
          for (let i = 0; i < dots; i++) {
            ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
            ctx.fillRect(Math.random() * w, Math.random() * h, 1, 1);
          }
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    if (reducedMotionRef.current) {
      // single static render, no loop
      frame();
    } else {
      rafRef.current = requestAnimationFrame(frame);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, settings, canvasRef]);

  const onPointerMove = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    pointerRef.current.x = clientX - rect.left;
    pointerRef.current.y = clientY - rect.top;
  }, [canvasRef]);

  const onPointerDown = useCallback(() => { pointerRef.current.down = true; }, []);
  const onPointerUp = useCallback(() => { pointerRef.current.down = false; }, []);

  const burst = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left, y = clientY - rect.top;
    for (const p of particlesRef.current) {
      const dx = p.x - x, dy = p.y - y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist < 160) {
        const force = (1 - dist / 160) * 3.2;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
    }
  }, [canvasRef]);

  const setFrozen = useCallback((v: boolean) => { frozenRef.current = v; }, []);

  const regenerate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    spawn(rect.width, rect.height, Math.round(settings.particles));
  }, [spawn, settings.particles, canvasRef]);

  return { onPointerMove, onPointerDown, onPointerUp, burst, setFrozen, regenerate };
}
