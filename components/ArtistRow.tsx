"use client";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { artists, worksByArtist } from "@/lib/data";

export default function ArtistRow() {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <p className="label-mono text-ivory/50 mb-10">03 — MEET THE ARTISTS</p>
      <div className="flex flex-col md:flex-row border-t border-ivory/10">
        {artists.map((artist) => {
          const cover = worksByArtist(artist.id)[0]?.image ?? artist.coverImage;
          const active = hovered === artist.id;
          return (
            <Link
              href={`/artists/${artist.slug}`}
              key={artist.id}
              data-cursor="view"
              onMouseEnter={() => setHovered(artist.id)}
              onMouseLeave={() => setHovered(null)}
              className="relative flex-1 border-b md:border-b-0 md:border-r border-ivory/10 last:border-r-0 overflow-hidden group"
              style={{ minHeight: "60vh" }}
            >
              <motion.img
                src={cover}
                alt={artist.name}
                className="absolute inset-0 w-full h-full object-cover"
                animate={{ scale: active ? 1.08 : 1, filter: active ? "grayscale(0)" : "grayscale(0.4)" }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/10 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                <p className="font-editorial text-2xl md:text-3xl">{artist.name}</p>
                {artist.status === "pending" && (
                  <p className="label-mono text-ivory/40 mt-1">Profile coming soon</p>
                )}
                <motion.p
                  className="label-mono mt-3 border-b border-ivory/40 pb-1 w-fit"
                  animate={{ opacity: active ? 1 : 0.6 }}
                >
                  View Profile
                </motion.p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
