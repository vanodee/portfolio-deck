"use client";

import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { openEaseBezierPoints } from "@/lib/easing";
import styles from "./ControlDock.module.css";

interface DockToggleProps {
  /** true = About side active/checked, false = Home side active */
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

const thumbTransition = {
  duration: MOTION.dockToggle.thumbDuration / 1000,
  ease: openEaseBezierPoints,
};

/** Both icons are permanently mounted in fixed slots; only opacity/scale
 * animate. Whichever icon is `active` this render gets the "arrival" curve
 * (short duration, delayed to land as the thumb finishes), the other gets
 * the "departure" curve (starts immediately, runs the thumb's full
 * duration) — this is what produces the sequenced, non-simultaneous feel. */
function iconAnimate(active: boolean) {
  return {
    opacity: active ? 1 : MOTION.dockToggle.inactiveOpacity,
    scale: active ? 1 : MOTION.dockToggle.inactiveScale,
  };
}
function iconTransition(active: boolean) {
  return active
    ? {
        duration: MOTION.dockToggle.iconInDuration / 1000,
        delay: MOTION.dockToggle.iconInDelay / 1000,
        ease: openEaseBezierPoints,
      }
    : { duration: MOTION.dockToggle.iconOutDuration / 1000, ease: openEaseBezierPoints };
}

/**
 * Home <-> About route toggle (ControlDock right group). Unlike the rest of
 * the dock's route-swapped content, this one control never unmounts across
 * the route change — a real 2-state switch (role="switch"), not a button
 * pair. The thumb (buttonGlass-styled div) slides between two fixed icon
 * slots; the icons themselves never move, only their opacity/scale animate,
 * which is what sells "icon sits inside the thumb when active" without
 * coordinating two elements' positions.
 */
export default function DockToggle({ checked, disabled = false, onToggle }: DockToggleProps) {
  const label = checked ? "Back to Home" : "About";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onToggle}
      className={styles.toggleTrack}
    >
      <motion.div
        className={styles.toggleThumb}
        initial={false}
        animate={{ x: checked ? MOTION.dockToggle.thumbTravelPx : 0 }}
        transition={thumbTransition}
        whileHover={disabled ? undefined : { scale: 1.08 }}
        whileTap={disabled ? undefined : { scale: 0.92 }}
      />
      <span className={`${styles.toggleIconSlot} ${styles.toggleIconLeft}`}>
        <motion.img
          src="/assets/icons/cards.svg"
          alt=""
          aria-hidden="true"
          className={styles.toggleIcon}
          initial={false}
          animate={iconAnimate(!checked)}
          transition={iconTransition(!checked)}
        />
      </span>
      <span className={`${styles.toggleIconSlot} ${styles.toggleIconRight}`}>
        <motion.img
          src="/assets/icons/about.svg"
          alt=""
          aria-hidden="true"
          className={styles.toggleIcon}
          initial={false}
          animate={iconAnimate(checked)}
          transition={iconTransition(checked)}
        />
      </span>
    </button>
  );
}
