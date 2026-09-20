"use client";
import { useCallback, useEffect, useRef } from "react";
import { RGB } from "@/lib/palette";

export type Stage = "whole" | "colour" | "texture" | "form";

type Cell = {
  col: number; row: number;
  // origin slot — the cell's true position/size within the whole image
  ox: number; oy: number; ow: number; oh: number;
  // natural-image source rect, for crisp drawImage crops
  sx: number; sy: number; sw: number; sh: number;
  color: RGB;
  jitterSeed: number;
  formSkip: boolean; // true for cells hidden during FORM to reveal bigger shapes
};

const COLS_DESKTOP = 16;
const ROWS_DESKTOP = 20;
const COLS_MOBILE = 10;
const ROWS_MOBILE = 13;

export function useLivingCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  imgRef: React.RefObject<HTMLImageElement | null>
) {
  const cellsRef = useRef<Cell[]>([]);
  const stageRef = useRef<Stage>("whole");
  const progressRef = useRef(0); // 0 = fully "whole", 1 = fully in current stage
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.5 });
  const reducedMotionRef = useRef(false);
  const readyRef = useRef(false);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const buildCells = useCallback(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;

    const mobile = rect.width < 560;
    const cols = mobile ? COLS_MOBILE : COLS_DESKTOP;
    const rows = mobile ? ROWS_MOBILE : ROWS_DESKTOP;

    // sample the image at a small working resolution for average cell colour
    const sample = document.createElement("canvas");
    sample.width = cols;
    sample.height = rows;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    let pixels: Uint8ClampedArray | null = null;
    if (sctx) {
      try {
        sctx.drawImage(img, 0, 0, cols, rows);
        pixels = sctx.getImageData(0, 0, cols, rows).data;
      } catch {
        pixels = null;
      }
    }

    const cells: Cell[] = [];
    const cw = rect.width / cols;
    const ch = rect.height / rows;
    const nw = img.naturalWidth, nh = img.naturalHeight;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 4;
        const color: RGB = pixels
          ? { r: pixels[idx], g: pixels[idx + 1], b: pixels[idx + 2] }
          : { r: 184, g: 151, b: 79 };
        cells.push({
          col: c, row: r,
          ox: c * cw, oy: r * ch, ow: cw, oh: ch,
          sx: (c / cols) * nw, sy: (r / rows) * nh, sw: nw / cols, sh: nh / rows,
          color,
          jitterSeed: Math.random() * Math.PI * 2,
          formSkip: (c + r) % 3 === 0,
        });
      }
    }
    cellsRef.current = cells;
    readyRef.current = true;
  }, [canvasRef, imgRef]);

  const setStage = useCallback((stage: Stage) => {
    stageRef.current = stage;
  }, []);

  const setPointer = useCallback((fx: number, fy: number) => {
    pointerRef.current = { x: fx, y: fy };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const c = canvasRef.current;
      const parent = c?.parentElement;
      if (!c || !parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = parent.clientWidth * dpr;
      c.height = parent.clientHeight * dpr;
      c.style.width = parent.clientWidth + "px";
      c.style.height = parent.clientHeight + "px";
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildCells();
    }
    resize();
    window.addEventListener("resize", resize);

    // pause the render loop while the canvas is scrolled off-screen — several
    // of these run at once on /art-lab now, no reason to burn CPU/battery
    // animating something nobody can see
    const visibleRef = { current: true };
    const io = new IntersectionObserver(
      (entries) => {
        const isVisible = entries[0]?.isIntersecting ?? true;
        visibleRef.current = isVisible;
        if (isVisible && rafRef.current === null) {
          rafRef.current = requestAnimationFrame(frame);
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(canvas);

    let t = 0;
    function frame() {
      const c = canvasRef.current;
      if (!c || !ctx) return;
      const rect = c.getBoundingClientRect();
      t += 1;
      ctx.clearRect(0, 0, rect.width, rect.height);

      // ease progress toward 1 whenever stage isn't "whole", else back toward 0
      const target = stageRef.current === "whole" ? 0 : 1;
      const speed = reducedMotionRef.current ? 1 : 0.045;
      progressRef.current += (target - progressRef.current) * speed;
      const p = progressRef.current;

      const img = imgRef.current;
      const stage = stageRef.current;
      const px = (pointerRef.current.x - 0.5) * 10;
      const py = (pointerRef.current.y - 0.5) * 10;

      for (const cell of cellsRef.current) {
        // gentle whole-image parallax, scaled down as deconstruction progresses
        const parallaxX = px * (1 - p);
        const parallaxY = py * (1 - p);

        let dx = cell.ox, dy = cell.oy, dw = cell.ow, dh = cell.oh, opacity = 1;
        let drawMode: "image" | "color" | "hidden" = "image";
        let filter = "none";

        if (stage === "colour") {
          const gap = cell.ow * 0.16;
          dx = cell.ox + gap / 2; dy = cell.oy + gap / 2;
          dw = cell.ow - gap; dh = cell.oh - gap;
          drawMode = "color";
        } else if (stage === "texture") {
          const jitter = reducedMotionRef.current ? 0 : Math.sin(t * 0.02 + cell.jitterSeed) * 3;
          dx = cell.ox + jitter; dy = cell.oy + Math.cos(t * 0.017 + cell.jitterSeed) * (reducedMotionRef.current ? 0 : 3);
          dw = cell.ow * 0.92; dh = cell.oh * 0.92;
          filter = "grayscale(0.55) contrast(1.35) saturate(1.1)";
          opacity = 0.92;
        } else if (stage === "form") {
          if (cell.formSkip) { drawMode = "hidden"; }
          dw = cell.ow * 1.5; dh = cell.oh * 1.5;
          dx = cell.ox - (dw - cell.ow) / 2; dy = cell.oy - (dh - cell.oh) / 2;
          filter = "blur(4px)";
          opacity = 0.75;
        }

        // interpolate from whole-slot toward the stage layout using p
        const x = cell.ox + (dx - cell.ox) * p + parallaxX;
        const y = cell.oy + (dy - cell.oy) * p + parallaxY;
        const w = cell.ow + (dw - cell.ow) * p;
        const h = cell.oh + (dh - cell.oh) * p;
        let alpha = 1 + (opacity - 1) * p;
        if (drawMode === "hidden") alpha *= Math.max(0, 1 - p * 1.3); // fade, not pop

        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.filter = p > 0.15 ? filter : "none";

        if (drawMode === "color" && p > 0.1) {
          ctx.fillStyle = `rgb(${cell.color.r}, ${cell.color.g}, ${cell.color.b})`;
          ctx.fillRect(x, y, w, h);
        } else if (img) {
          ctx.drawImage(img, cell.sx, cell.sy, cell.sw, cell.sh, x, y, w, h);
        }
        ctx.restore();
      }

      rafRef.current = visibleRef.current ? requestAnimationFrame(frame) : null;
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("resize", resize);
      io.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [buildCells, canvasRef, imgRef]);

  return { buildCells, setStage, setPointer };
}
