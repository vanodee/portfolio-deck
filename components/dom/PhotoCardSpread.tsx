"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { PhotoCardData } from "@/data/types";
import { MOTION } from "@/lib/motion";
import PhotoCard from "./PhotoCard";
import styles from "./PhotoCardSpread.module.css";

export const PHOTO_SPREAD_MAX_CARDS = 3;

interface PhotoCardSpreadProps {
  photos: PhotoCardData[];
  /** About page section-reveal (hooks/useAboutSectionsGate.ts) — whether the
   * first-visit "dealt in" entrance should play at all this mount. */
  revealArmed?: boolean;
  /** Whether this section has actually scrolled into view and its entrance
   * should be playing/have played (hooks/useSectionReveal.ts). */
  revealTriggered?: boolean;
}

// Click/keyboard-activate anywhere on the spread promotes the next card in
// fixed order to the front (round-robin: 1→2→3→1...). Array-driven —
// PHOTOS.map, not fixed JSX instances — so a future whileInView stagger can
// be added without restructuring (see prompt scope note).
export default function PhotoCardSpread({
  photos,
  revealArmed = false,
  revealTriggered = false,
}: PhotoCardSpreadProps) {
  const cards = photos.slice(0, PHOTO_SPREAD_MAX_CARDS);
  const [frontIndex, setFrontIndex] = useState(0);
  // Widens the fan on hover — gated to real mouse input (pointerType check,
  // same convention as BrandCard.tsx) so a touch tap can't leave this stuck
  // "on" with no way to un-hover.
  const [isHovered, setIsHovered] = useState(false);

  // Entrance choreography: cards deal in back-to-front (the front/pivot
  // card, rank 0, is dealt last — same "topmost dealt last" convention as
  // ExperienceCardSpread's z-ascending stagger). Once the whole stagger has
  // had time to finish, reverts the transition profile back to the fast
  // click-cycle timing and re-enables interaction — a settled entrance
  // should never leave a stale slow transition on a later click.
  const [entranceSettled, setEntranceSettled] = useState(false);
  const usingEntranceTransition = revealArmed && !entranceSettled;
  useEffect(() => {
    if (!revealArmed || !revealTriggered || entranceSettled) return;
    // Items deal in strictly one-at-a-time (delay_i = i * (duration +
    // stagger), see the per-card transition below) — total time is that same
    // per-item interval times the count, plus the last card's own duration.
    const total =
      Math.max(0, cards.length - 1) *
        (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger) +
      MOTION.aboutSectionReveal.duration +
      100; // settle margin, mirrors lib/choreography.ts's setTimeout(total, ...) idiom
    const t = setTimeout(() => setEntranceSettled(true), total);
    return () => clearTimeout(t);
  }, [revealArmed, revealTriggered, entranceSettled, cards.length]);

  const cycle = () => {
    if (usingEntranceTransition) return;
    setFrontIndex((i) => (i + 1) % cards.length);
  };

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
        const restY = -rank * offsetYStepPx;
        // Deal order: back-to-front, front/pivot card (rank 0, highest
        // zIndex) dealt last — mirrors ExperienceCardSpread's "topmost dealt
        // last" convention.
        const dealOrder = cards.length - 1 - rank;
        return (
          <motion.div
            key={photo.id}
            className={styles.slot}
            style={{ zIndex: cards.length - rank }}
            initial={
              revealArmed
                ? { x: rank * offsetXStepPx, y: restY + MOTION.aboutSectionReveal.translateY, opacity: 0 }
                : false
            }
            animate={{
              x: rank * offsetXStepPx,
              y: !revealArmed || revealTriggered ? restY : restY + MOTION.aboutSectionReveal.translateY,
              rotate,
              opacity: !revealArmed || revealTriggered ? 1 : 0,
            }}
            transition={
              usingEntranceTransition
                ? {
                    // Strictly one-at-a-time: each card doesn't start until
                    // the previous one has fully finished (+ a breathing gap).
                    delay:
                      (dealOrder *
                        (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger)) /
                      1000,
                    duration: MOTION.aboutSectionReveal.duration / 1000,
                    ease: "easeOut",
                  }
                : { duration: cycleDuration / 1000, ease: "easeOut" }
            }
          >
            <PhotoCard photo={photo} />
          </motion.div>
        );
      })}
    </div>
  );
}
