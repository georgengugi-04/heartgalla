"use client";
import { motion, AnimatePresence } from "motion/react";
import { useMemo, useState } from "react";
import RadialMap from "./RadialMap";
import ArchiveGallery, { ArchiveItem } from "./ArchiveGallery";
import ExhibitionView from "./ExhibitionView";
import { locations, archiveForLocation, GeoLocation } from "@/lib/geography";

type View = "map" | "archive";

export default function ArtWithoutBorders() {
  const [view, setView] = useState<View>("map");
  const [activeLocation, setActiveLocation] = useState<GeoLocation | null>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const archive: ArchiveItem[] = useMemo(
    () => (activeLocation ? archiveForLocation(activeLocation) : []),
    [activeLocation]
  );

  function selectLocation(loc: GeoLocation) {
    setActiveLocation(loc);
    setView("archive");
  }

  function backToMap() {
    setView("map");
    setActiveLocation(null);
    setOpenIndex(null);
  }

  return (
    <section className="py-16 md:py-24 border-t border-ivory/10 overflow-hidden">
      <div className="px-6 md:px-10 mb-14 text-center">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-5 label-mono text-ivory/50">
          <span className="text-electric">EXPERIMENT 05</span>
          <span>·</span><span>INTERACTIVE</span><span>·</span><span>EARTGALLA ART LAB</span>
        </div>
        <h2 className="font-editorial text-4xl md:text-6xl leading-[0.95] mb-4">ART WITHOUT BORDERS</h2>
        <p className="font-editorial italic text-xl md:text-2xl text-ivory/70 max-w-md mx-auto">
          Stories begin somewhere. They do not have to stay there.
        </p>
        {view === "map" && (
          <p className="label-mono text-gold mt-6">EXPLORE THE ARCHIVE ↓</p>
        )}
        {view === "archive" && (
          <button onClick={backToMap} className="label-mono text-ivory/50 hover:text-ivory mt-6 border-b border-ivory/20 pb-1">
            ← BACK TO THE MAP
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === "map" ? (
          <motion.div
            key="map"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="px-6 md:px-10"
          >
            <RadialMap locations={locations} onSelect={selectLocation} />
          </motion.div>
        ) : (
          <motion.div
            key="archive"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {activeLocation && (
              <p className="text-center label-mono text-ivory/50 mb-6">{activeLocation.name.toUpperCase()}</p>
            )}
            <ArchiveGallery items={archive} onSelect={(_, i) => setOpenIndex(i)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {openIndex !== null && (
          <ExhibitionView
            items={archive}
            index={openIndex}
            onIndexChange={setOpenIndex}
            onClose={() => setOpenIndex(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
