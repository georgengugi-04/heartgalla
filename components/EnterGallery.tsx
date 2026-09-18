"use client";
import { motion } from "motion/react";
import Link from "next/link";
import Image from "next/image";
import type { Artwork, Artist } from "@/lib/types";

type Item = { artwork: Artwork; artist: Artist };

export default function EnterGallery({ items }: { items: Item[] }) {
  return (
    <section className="py-24 md:py-40 px-6 md:px-10">
      <p className="label-mono text-ivory/50 mb-10">02 — ENTER THE GALLERY</p>
      <div className="flex flex-col gap-28 md:gap-40">
        {items.map(({ artwork, artist }, i) => (
          <motion.div
            key={artwork.id}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col md:flex-row gap-8 md:gap-16 items-center ${
              i % 2 === 1 ? "md:flex-row-reverse" : ""
            }`}
          >
            <Link
              href={`/gallery/${artwork.slug}`}
              data-cursor="view"
              className="relative block w-full md:w-3/5 aspect-[4/5] overflow-hidden group"
            >
              <motion.div className="w-full h-full" whileHover={{ scale: 1.04 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-cover"
                />
              </motion.div>
            </Link>
            <div className="w-full md:w-2/5">
              <p className="label-mono text-gold mb-3">{String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-editorial text-3xl md:text-4xl leading-tight mb-3">{artwork.title}</h3>
              <p className="text-ivory/70 mb-1">{artist.name}</p>
              {artwork.medium && <p className="label-mono text-ivory/40">{artwork.medium}</p>}
              <Link href={`/gallery/${artwork.slug}`} data-cursor="view" className="inline-block mt-6 label-mono border-b border-ivory/30 pb-1">
                View Artwork
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
