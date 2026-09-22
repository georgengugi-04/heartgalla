"use client";
import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { GeoLocation, RING_LABELS, countsForLocation } from "@/lib/geography";

export default function RadialMap({
  locations,
  onSelect,
}: {
  locations: GeoLocation[];
  onSelect: (loc: GeoLocation) => void;
}) {
  const [hovered, setHovered] = useState<GeoLocation | null>(null);
  const reduced = useReducedMotion();
  const size = 520;
  const c = size / 2;
  const ringGap = 90;

  return (
    <div className="relative mx-auto" style={{ width: size, maxWidth: "100%", aspectRatio: "1/1" }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" role="img" aria-label="A radial map centered on Kenya, EARTGALLA's home, with rings for East Africa, Africa, and World as the story travels outward.">
        {RING_LABELS.map((r, i) => {
          if (i === 0) return null; // center point has no ring
          const radius = i * ringGap;
          return (
            <g key={r.level}>
              <circle
                cx={c}
                cy={c}
                r={radius}
                fill="none"
                stroke="rgba(244,239,230,0.12)"
                strokeDasharray="2 6"
                strokeWidth={1}
              />
              <text
                x={c}
                y={c - radius - 10}
                textAnchor="middle"
                className="label-mono"
                fill="rgba(244,239,230,0.3)"
                fontSize="10"
                letterSpacing="1.5"
              >
                {r.label}
              </text>
            </g>
          );
        })}

        {/* pulsing rings behind Kenya marker */}
        <motion.circle
          cx={c}
          cy={c}
          r={10}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={1}
          animate={reduced ? { opacity: 0.4 } : { r: [10, 34, 10], opacity: [0.6, 0, 0.6] }}
          transition={reduced ? { duration: 0 } : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />

        {locations.map((loc) => (
          <g key={loc.id} transform={`translate(${c}, ${c})`}>
            <motion.circle
              r={8}
              fill="var(--color-gold)"
              className="cursor-pointer"
              whileHover={{ scale: 1.3 }}
              onMouseEnter={() => setHovered(loc)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(loc)}
              onBlur={() => setHovered(null)}
              onClick={() => onSelect(loc)}
              tabIndex={0}
              role="button"
              aria-label={`Explore the archive for ${loc.name}`}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(loc); }}
            />
          </g>
        ))}
      </svg>

      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-6 bg-[#1c1a17] border border-gold/30 rounded-lg px-5 py-4 pointer-events-none min-w-[200px]"
        >
          <p className="label-mono text-gold mb-2">{hovered.name.toUpperCase()}</p>
          {(() => {
            const c = countsForLocation(hovered);
            return (
              <div className="flex gap-5 label-mono text-ivory/60">
                <span>{c.stories} {c.stories === 1 ? "STORY" : "STORIES"}</span>
                <span>{c.artists} {c.artists === 1 ? "ARTIST" : "ARTISTS"}</span>
                <span>{c.works} WORKS</span>
              </div>
            );
          })()}
        </motion.div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="label-mono text-ivory/25 mt-24">More locations, mapped as the archive grows.</span>
      </div>
    </div>
  );
}
