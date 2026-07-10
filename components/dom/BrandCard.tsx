"use client";

import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { Brand } from "@/data/types";
import { MOTION } from "@/lib/motion";
import { useState } from "react";
import styles from "./BrandCard.module.css";

// Fixed frame + swappable content layer, same structural idea as Chip.tsx
// (DS §3.7) — only one of {name, logo} is ever mounted at a time via
// AnimatePresence, rather than two permanently-stacked absolute layers.

const TRAVEL_PX = 20; // seamless-swap travel distance — name exits up /
// re-enters from up; logo enters from below / exits back down. Same offset
// reused as both `initial` and `exit` per element, so the reverse direction
// (un-reveal) falls out as the natural mirror without branching on it.

const nameVariants: Variants = {
  initial: { opacity: 0, y: -TRAVEL_PX },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.hover.in / 1000, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -TRAVEL_PX,
    transition: { duration: MOTION.hover.out / 1000, ease: "easeInOut" },
  },
};

const logoVariants: Variants = {
  initial: { opacity: 0, y: TRAVEL_PX },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION.hover.in / 1000, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: TRAVEL_PX,
    transition: { duration: MOTION.hover.out / 1000, ease: "easeInOut" },
  },
};

interface BrandCardProps {
  brand: Brand;
  /** Touch-tap reveal state, controlled by the parent (exclusivity across the grid). */
  revealed: boolean;
  onToggle: () => void;
}

export default function BrandCard({ brand, revealed, onToggle }: BrandCardProps) {
  const [hovering, setHovering] = useState(false);
  const isRevealed = revealed || hovering;

  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(false);
  };

  // Real mouse clicks rely on hover alone; keyboard activation (Enter/Space
  // on a button fires a click with detail === 0) and touch-only devices are
  // the only inputs that toggle the tap-controlled `revealed` state — same
  // gating intent as the dock buttons' (hover: hover) and (pointer: fine)
  // CSS query (DS §3.3), applied in JS since the swap needs mounted state.
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const keyboardActivated = e.detail === 0;
    const touchOnly =
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (keyboardActivated || touchOnly) onToggle();
  };

  return (
    <button
      type="button"
      className={`${styles.card} ${isRevealed ? styles.revealed : ""}`}
      style={{
        transitionDuration: `${isRevealed ? MOTION.hover.in : MOTION.hover.out}ms`,
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-pressed={isRevealed}
      aria-label={brand.name}
    >
      <AnimatePresence initial={false}>
        {isRevealed ? (
          <motion.img
            key="logo"
            src={brand.logoSrc}
            alt=""
            className={styles.logo}
            variants={logoVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          />
        ) : (
          <motion.span
            key="name"
            className={styles.name}
            variants={nameVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {brand.name}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
