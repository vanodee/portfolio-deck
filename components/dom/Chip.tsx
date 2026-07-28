"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { chipTint } from "@/lib/chipColor";
import { sanityImageAtWidth } from "@/lib/sanityImage";
import { chipStructureDataUrl, chipLightDataUrl } from "@/lib/chipSprite";
import { useEntranceHoldReveal } from "@/hooks/useEntranceHoldReveal";
import styles from "./Chip.module.css";

interface RevealProps {
  /** About page section-reveal (hooks/useAboutSectionsGate.ts) — whether the
   * first-visit "dealt in" entrance should play at all this mount. */
  revealArmed?: boolean;
  /** Whether this chip's section has actually scrolled into view and its
   * entrance should be playing/have played (hooks/useSectionReveal.ts). */
  revealTriggered?: boolean;
  /** This chip's own stagger position within its section, in ms. */
  revealDelayMs?: number;
}

interface StatChipData extends RevealProps {
  value: string;
  label: string;
  color: string;
}

interface ToolChipData extends RevealProps {
  name: string;
  logoSrc: string;
  logoAlt: string;
  color: string;
  /** How long (ms) this tool chip stays in its forced-hover (name-revealed)
   * pose before settling to idle — omitted/0 for no forced-reveal at all
   * (e.g. Hero's stat chips never pass this). */
  revealHoldMs?: number;
  /** Touch-tap reveal state, controlled by the parent for exclusivity across
   * the grid — same mechanic as BrandCard (DS §3.8). */
  revealed: boolean;
  onToggle: () => void;
}

type ChipProps = ({ variant: "stat" } & StatChipData) | ({ variant: "tool" } & ToolChipData);

export default function Chip(props: ChipProps) {
  const revealArmed = props.revealArmed ?? false;
  const revealTriggered = props.revealTriggered ?? false;
  const revealDelayMs = props.revealDelayMs ?? 0;
  // Called unconditionally regardless of variant (rules-of-hooks) — only the
  // tool variant actually consumes the result; stat chips never pass
  // revealHoldMs, so this is always a guaranteed no-op for them.
  const forceRevealedResult = useEntranceHoldReveal(
    revealArmed,
    revealTriggered,
    revealDelayMs,
    MOTION.aboutSectionReveal.duration,
    props.variant === "tool" ? (props.revealHoldMs ?? 0) : 0,
  );
  const forceRevealed = props.variant === "tool" && forceRevealedResult;

  // Touch-tap reveal (BrandCard's exact mechanic, DS §3.8) — real mouse
  // hover is handled by the existing (hover: hover) CSS below and doesn't
  // need this state; it's tracked here only so it can join forceRevealed/
  // tapRevealed into one JS-driven `.revealed` class for aria-pressed and
  // for touch/keyboard, which have no CSS :hover equivalent. Called
  // unconditionally regardless of variant (rules-of-hooks); only tool chips
  // wire up onPointerEnter/Leave/Click below.
  const [hovering, setHovering] = useState(false);
  const handlePointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(true);
  };
  const handlePointerLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") setHovering(false);
  };
  // Real mouse clicks rely on hover alone; keyboard activation (Enter/Space
  // fires a click with detail === 0) and touch-only devices are the only
  // inputs that toggle the tap-controlled `revealed` state — identical
  // gating to BrandCard's handleClick.
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (props.variant !== "tool") return;
    const keyboardActivated = e.detail === 0;
    const touchOnly =
      typeof window !== "undefined" &&
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (keyboardActivated || touchOnly) props.onToggle();
  };
  const tapRevealed = props.variant === "tool" && props.revealed;
  const showLabel = forceRevealed || hovering || tapRevealed;

  // Tool colors from CMS are tuned ~90% lightness for dark text on a tag
  // pill elsewhere (OpenCardOverlay); the chip face's own fixed white
  // elements (edge-spot marks, gloss) need a darker read of the same hue —
  // see lib/chipColor.ts. Stat chips pass a literal hex directly and skip it
  // (must be literal, not a CSS var() — lib/chipSprite.ts's module comment).
  const structureColor = props.variant === "tool" ? chipTint(props.color) : props.color;

  const chip = (
    <div className={styles.chip}>
      {/* Cached per-color data-URI sprite (lib/chipSprite.ts, perf audit
          2026-07-28) — was a live <svg> with its own filter/gradient defs
          per instance; identical pixels, computed once per distinct color
          instead of on every chip and every animation frame. */}
      <img
        className={styles.chipStructure}
        src={chipStructureDataUrl(structureColor)}
        alt=""
        aria-hidden="true"
      />

      <div className={styles.chipContent}>
        {props.variant === "stat" ? (
          <>
            <span className={styles.statValue}>{props.value}</span>
            <span className={styles.statLabel}>{props.label}</span>
          </>
        ) : (
          <img
            className={styles.toolLogo}
            // .toolLogo is a fixed 30px box (Chip.module.css) at every
            // breakpoint — 2x that for retina, well under the original upload.
            src={sanityImageAtWidth(props.logoSrc, 60)}
            alt={props.logoAlt}
          />
        )}
      </div>

      {/* Fixed white gloss overlay, no color prop — fully color-independent,
          so this is one single cached sprite shared by every chip ever
          rendered (lib/chipSprite.ts), not just per-color. */}
      <img className={styles.chipLight} src={chipLightDataUrl()} alt="" aria-hidden="true" />
    </div>
  );

  const entranceInitial = revealArmed
    ? { y: MOTION.aboutSectionReveal.translateY, opacity: 0 }
    : false;
  const entranceAnimate = {
    y: !revealArmed || revealTriggered ? 0 : MOTION.aboutSectionReveal.translateY,
    opacity: !revealArmed || revealTriggered ? 1 : 0,
  };
  const entranceTransition = {
    delay: revealDelayMs / 1000,
    duration: MOTION.aboutSectionReveal.duration / 1000,
    ease: "easeOut" as const,
  };

  if (props.variant === "stat") {
    return (
      <motion.div
        className={styles.chipWrapperStat}
        initial={entranceInitial}
        animate={entranceAnimate}
        transition={entranceTransition}
      >
        {chip}
      </motion.div>
    );
  }

  return (
    <motion.button
      type="button"
      className={`${styles.chipWrapperTool} ${showLabel ? styles.revealed : ""}`}
      initial={entranceInitial}
      animate={entranceAnimate}
      transition={entranceTransition}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={handleClick}
      aria-pressed={showLabel}
      aria-label={props.name}
    >
      {chip}
      <div className={styles.chipLabel} style={{ background: props.color }} aria-hidden="true">
        {props.name}
      </div>
    </motion.button>
  );
}
