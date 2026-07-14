"use client";

/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from "react";
import { useId } from "react";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
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
}

type ChipProps = ({ variant: "stat" } & StatChipData) | ({ variant: "tool" } & ToolChipData);

// Geometry/filters below are transcribed verbatim from the Figma-exported
// reference SVGs (public/assets/referneces/stat.svg, tool.svg) — both files
// share identical path data and only differ in fill color + content, which
// is exactly what lets this be one recolorable component. Every path that
// used a literal fill hex in the reference now takes `var(--chip-color)`;
// the white edge-spot marks and the black shadow/bevel/vignette layers stay
// fixed regardless of color, per the reference.
const SHADOW_PATH =
  "M100 202C153.019 202 196 159.019 196 106C196 52.9807 153.019 10 100 10C46.9807 10 4 52.9807 4 106C4 159.019 46.9807 202 100 202Z";
const MAIN_PATH =
  "M100 196C153.019 196 196 153.019 196 100C196 46.9807 153.019 4 100 4C46.9807 4 4 46.9807 4 100C4 153.019 46.9807 196 100 196Z";
const EDGE_SPOTS_PATH =
  "M159.482 175.444C143.55 188.006 124.049 195.202 103.776 196L103.21 181.6C120.442 180.922 137.017 174.805 150.56 164.128L159.482 175.444ZM30.9375 143.581C40.1408 158.166 53.7251 169.462 69.7432 175.852L64.4043 189.237C45.5595 181.72 29.5774 168.43 18.75 151.271L30.9375 143.581ZM195.078 86.209C197.99 106.287 194.472 126.773 185.026 144.729L172.272 138.02C180.301 122.757 183.292 105.344 180.816 88.2773L195.078 86.209ZM27.7266 61.9805C19.6978 77.243 16.707 94.6557 19.1826 111.723L4.92091 113.791C2.00852 93.7124 5.52711 73.2273 14.9727 55.2715L27.7266 61.9805ZM135.595 10.7627C154.44 18.2798 170.421 31.5703 181.248 48.7285L169.061 56.4189C159.857 41.8345 146.273 30.5379 130.255 24.1484L135.595 10.7627ZM96.7881 18.4004C79.5561 19.0785 62.9809 25.1947 49.4385 35.8721L40.5166 24.5557C56.4489 11.994 75.9487 4.79776 96.2217 4L96.7881 18.4004Z";
const BEVEL_OUTER_PATH =
  "M100 170C138.66 170 170 138.66 170 100C170 61.3401 138.66 30 100 30C61.3401 30 30 61.3401 30 100C30 138.66 61.3401 170 100 170Z";
const RING_STROKE_OUTER_PATH =
  "M100 28C139.764 28 172 60.2355 172 100C172 139.764 139.764 172 100 172C60.2355 172 28 139.764 28 100C28 60.2355 60.2355 28 100 28Z";
const RING_STROKE_INNER_PATH =
  "M100 157C131.48 157 157 131.48 157 100C157 68.5198 131.48 43 100 43C68.5198 43 43 68.5198 43 100C43 131.48 68.5198 157 100 157Z";
const CENTER_DISC_PATH =
  "M100 155C130.376 155 155 130.376 155 100C155 69.6243 130.376 45 100 45C69.6243 45 45 69.6243 45 100C45 130.376 69.6243 155 100 155Z";

export default function Chip(props: ChipProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9]/g, "");

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

  const chip = (
    <div className={styles.chip} style={{ "--chip-color": props.color } as CSSProperties}>
      <svg
        className={styles.chipStructure}
        viewBox="0 0 200 202"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <filter
            id={`${uid}-innerA`}
            x="30"
            y="30"
            width="140"
            height="144"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="4" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          </filter>
          <filter
            id={`${uid}-innerB`}
            x="26"
            y="26"
            width="148"
            height="152"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="22" />
            <feGaussianBlur stdDeviation="2" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
            />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
          </filter>
          <filter
            id={`${uid}-drop`}
            x="40"
            y="45"
            width="120"
            height="122"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="7" />
            <feGaussianBlur stdDeviation="2.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0"
            />
            <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow" />
            <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow" result="shape" />
          </filter>
          <radialGradient
            id={`${uid}-vignette`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(114 121) scale(77)"
          >
            <stop stopOpacity="0" />
            <stop offset="1" stopOpacity="0.2" />
          </radialGradient>
        </defs>

        {/* Drop shadow: the main disc offset 6px down, darkened. */}
        <path d={SHADOW_PATH} fill="var(--chip-color)" />
        <path d={SHADOW_PATH} fill="black" fillOpacity="0.5" />
        {/* Base disc. */}
        <path d={MAIN_PATH} fill="var(--chip-color)" />
        {/* Fixed white edge-spot marks (poker-chip rim), same for both variants. */}
        <path d={EDGE_SPOTS_PATH} fill="white" />
        <g filter={`url(#${uid}-innerA)`}>
          <path d={BEVEL_OUTER_PATH} fill="var(--chip-color)" />
        </g>
        <g filter={`url(#${uid}-innerA)`}>
          <path d={BEVEL_OUTER_PATH} fill={`url(#${uid}-vignette)`} />
        </g>
        <g filter={`url(#${uid}-innerB)`}>
          <path d={RING_STROKE_OUTER_PATH} stroke="black" strokeOpacity="0.1" strokeWidth="4" />
        </g>
        <path d={RING_STROKE_INNER_PATH} stroke="black" strokeOpacity="0.1" strokeWidth="3" />
        <g filter={`url(#${uid}-drop)`}>
          <path d={CENTER_DISC_PATH} fill="var(--chip-color)" />
        </g>
      </svg>

      <div className={styles.chipContent}>
        {props.variant === "stat" ? (
          <>
            <span className={styles.statValue}>{props.value}</span>
            <span className={styles.statLabel}>{props.label}</span>
          </>
        ) : (
          <img className={styles.toolLogo} src={props.logoSrc} alt={props.logoAlt} />
        )}
      </div>

      {/* Fixed white gloss overlay across the whole face, no color prop. */}
      <svg
        className={styles.chipLight}
        viewBox="0 0 200 202"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <radialGradient
            id={`${uid}-light`}
            cx="0"
            cy="0"
            r="1"
            gradientUnits="userSpaceOnUse"
            gradientTransform="translate(76.96 61.6) scale(99.84)"
          >
            <stop stopColor="white" stopOpacity="0.55" />
            <stop offset="0.55" stopColor="white" stopOpacity="0.04" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d={MAIN_PATH} fill={`url(#${uid}-light)`} />
      </svg>
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
    <motion.div
      className={`${styles.chipWrapperTool} ${forceRevealed ? styles.forceRevealed : ""}`}
      initial={entranceInitial}
      animate={entranceAnimate}
      transition={entranceTransition}
    >
      {chip}
      <div className={styles.chipLabel} style={{ background: props.color }} aria-hidden="true">
        {props.name}
      </div>
    </motion.div>
  );
}
