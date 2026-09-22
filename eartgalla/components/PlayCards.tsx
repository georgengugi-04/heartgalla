"use client";
import { motion } from "motion/react";
import { useState } from "react";

const CARDS = [
  { img: "/art/john-cards/card-king-queen-royals.jpg", suit: "Court Card", title: "The Royals" },
  { img: "/art/john-cards/card-queen-of-hearts.jpg", suit: "♥ Hearts", title: "Queen of Hearts" },
  { img: "/art/john-cards/card-queen-of-hearts-alt.jpg", suit: "♥ Hearts", title: "Queen of Hearts — Studio View" },
  { img: "/art/john-cards/card-5-clubs-guitar.jpg", suit: "♣ Clubs", title: "Five of Clubs" },
  { img: "/art/john-cards/card-6-clubs-koi.jpg", suit: "♣ Clubs", title: "Six of Clubs" },
  { img: "/art/john-cards/card-6-clubs-koi-alt.jpg", suit: "♣ Clubs", title: "Six of Clubs — Second Study" },
  { img: "/art/john-cards/card-7-clubs.jpg", suit: "♣ Clubs", title: "Seven of Clubs" },
  { img: "/art/john-cards/card-7-strawberries.jpg", suit: "♦ Diamonds", title: "Seven of Diamonds" },
  { img: "/art/john-cards/card-8-spades-bench.jpg", suit: "♠ Spades", title: "Eight of Spades" },
  { img: "/art/john-cards/card-3-hummingbird.jpg", suit: "♣ Clubs", title: "Three of Clubs" },
  { img: "/art/john-cards/card-2-clubs-baby.jpg", suit: "♣ Clubs", title: "Two of Clubs" },
];

function PlayCard({ img, suit, title, index }: { img: string; suit: string; title: string; index: number }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      data-cursor="style"
      aria-label={`Flip ${title}`}
      className="relative w-full aspect-[5/7] [perspective:1200px] cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <motion.div
        className="relative w-full h-full [transform-style:preserve-3d]"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        whileHover={{ y: -6 }}
      >
        <div className="absolute inset-0 rounded-lg overflow-hidden border border-gold/40 [backface-visibility:hidden] shadow-lg">
          <img src={img} alt={title} className="w-full h-full object-cover" draggable={false} />
        </div>
        <div
          className="absolute inset-0 rounded-lg overflow-hidden border border-gold/40 bg-gradient-to-br from-[#1c1a17] to-charcoal flex flex-col items-center justify-center text-center p-3 gap-1 [backface-visibility:hidden]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <span className="label-mono text-gold">{suit}</span>
          <span className="font-editorial text-sm md:text-base leading-tight">{title}</span>
        </div>
      </motion.div>
    </button>
  );
}

export default function PlayCards() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
      {CARDS.map((c, i) => (
        <PlayCard key={c.title} {...c} index={i} />
      ))}
    </div>
  );
}
