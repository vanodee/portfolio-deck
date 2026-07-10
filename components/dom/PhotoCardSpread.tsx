"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { PhotoCardData } from "@/data/types";
import { MOTION } from "@/lib/motion";
import PhotoCard from "./PhotoCard";
import styles from "./PhotoCardSpread.module.css";

const MAX_CARDS = 3;

// Click/keyboard-activate anywhere on the spread promotes the next card in
// fixed order to the front (round-robin: 1→2→3→1...). Array-driven —
// PHOTOS.map, not fixed JSX instances — so a future whileInView stagger can
// be added without restructuring (see prompt scope note).
export default function PhotoCardSpread({ photos }: { photos: PhotoCardData[] }) {
  const cards = photos.slice(0, MAX_CARDS);
  const [frontIndex, setFrontIndex] = useState(0);
  // Widens the fan on hover — gated to real mouse input (pointerType check,
  // same convention as BrandCard.tsx) so a touch tap can't leave this stuck
  // "on" with no way to un-hover.
  const [isHovered, setIsHovered] = useState(false);

  const cycle = () => setFrontIndex((i) => (i + 1) % cards.length);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cycle();
    }
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsHovered(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setIsHovered(false);
  };

  const {
    offsetXStepPx,
    offsetYStepPx,
    rotationStepDeg,
    hoverRotationStepDeg,
    frontHoverRotationDeg,
    cycleDuration,
  } = MOTION.photoSpread;
  const extentX = Math.max(cards.length - 1, 0) * offsetXStepPx;
  const extentY = Math.max(cards.length - 1, 0) * offsetYStepPx;
  const activeRotationStepDeg = isHovered ? hoverRotationStepDeg : rotationStepDeg;

  return (
    <div
      className={styles.spread}
      style={{ width: 214 + extentX, height: 300 + extentY }}
      role="button"
      tabIndex={0}
      aria-label="Photo card spread — activate to cycle to the next photo"
      onClick={cycle}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {cards.map((photo, index) => {
        const rank = (index - frontIndex + cards.length) % cards.length;
        // Rank 0 (the front card) is the fan's pivot, not just another step
        // of it — it tilts opposite the back cards on hover instead of
        // following the same rank*step formula (which would leave it at a
        // flat 0deg always).
        const rotate =
          rank === 0 ? (isHovered ? frontHoverRotationDeg : 0) : rank * activeRotationStepDeg;
        return (
          <motion.div
            key={photo.id}
            className={styles.slot}
            style={{ zIndex: cards.length - rank }}
            animate={{
              x: rank * offsetXStepPx,
              y: -rank * offsetYStepPx,
              rotate,
            }}
            transition={{ duration: cycleDuration / 1000, ease: "easeOut" }}
          >
            <PhotoCard photo={photo} />
          </motion.div>
        );
      })}
    </div>
  );
}
