"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { openEaseBezierPoints } from "@/lib/easing";
import { MOTION } from "@/lib/motion";
import DigitCard from "./DigitCard";
import styles from "./NotFoundContent.module.css";

const DIGITS = ["4", "0", "4"];

// Mobile card size (DigitCard.module.css) is ~0.6875x the desktop shell
// (110/160) — the fan's x/lift offsets scale down by the same factor so the
// bow shape stays proportional rather than just clamping the card size and
// leaving the (now relatively huge) desktop spacing between them. Rotation
// is left unscaled — an angle doesn't need to shrink with the card.
const MOBILE_FAN_SCALE = 0.6875;

// 404 page's frame-interior content — the counterpart to Home's card
// grid/heading and About's AboutContent.tsx, rendered by PlayArea.tsx's
// `notFound` branch. Deliberately self-contained: unlike AboutContent, this
// does NOT hook into dockNavPhase/MOTION.aboutNav (the Home <-> About
// route-nav choreography) — a 404 is only ever reached via a hard/broken
// link, never the in-app dock toggle, so there's no "exit" transition to
// coordinate with; a direct load renders already settled, same "direct
// load = no animation" convention used elsewhere.
export default function NotFoundContent() {
  // Card fan rest geometry directly reuses Experience Card's desktop fan
  // (About page, "The Run") — a deliberate mirror, not a new geometry.
  // Unlike ExperienceCardSpread, there's no separate mobile layout here
  // (DS §3.10's peek-stack) — the bow shape stays the same at every width,
  // just scaled down (MOBILE_FAN_SCALE) to match the smaller mobile card.
  const isMobile = useBreakpoint() === "mobile";
  const fanScale = isMobile ? MOBILE_FAN_SCALE : 1;
  const { xStepPx: baseXStepPx, rotationStepDeg, liftPx: baseLiftPx } = MOTION.experienceFan.desktop;
  const xStepPx = baseXStepPx * fanScale;
  const liftPx = baseLiftPx * fanScale;
  // Each card's own deal-in/out reuses aboutSectionReveal's "fade up from
  // below, one at a time" entrance recipe verbatim (same one Photo Card/
  // Experience Card use) — holdDuration/cycleGap are the only genuinely new
  // values, since aboutSectionReveal is a one-shot reveal with no loop.
  const { translateY, duration, stagger } = MOTION.aboutSectionReveal;
  const { holdDuration, cycleGap } = MOTION.notFound.cardLoop;

  const enterMs = duration;
  const totalMs = enterMs + holdDuration + enterMs + cycleGap;
  // Enter (fade+translate up) -> hold at rest -> exit (the same motion,
  // reversed: fade+translate back down) -> hold off, then repeat.
  const times = [
    0,
    enterMs / totalMs,
    (enterMs + holdDuration) / totalMs,
    (enterMs + holdDuration + enterMs) / totalMs,
    1,
  ];

  return (
    <motion.div
      className={styles.stage}
      initial={{ opacity: 0, y: MOTION.notFound.entranceTranslateY }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: MOTION.notFound.entranceDuration / 1000,
        ease: openEaseBezierPoints,
      }}
    >
      <div className={styles.content}>
        <div className={styles.bustBlock}>
          <h1 className={styles.bustHeading}>Bust!</h1>
          <Link href="/" className={styles.spreadLink} aria-label="Return to the table">
            <div className={styles.spread}>
              {DIGITS.map((digit, index) => {
                // Position (rest x/rotate/lift) is rank-based — center card
                // (rank 0) is the fan's pivot, matching Experience Card's
                // bow shape: the two "4"s rotate outward alternating
                // left/right and drop lower, the further they sit from
                // center. Deal order and stacking are NOT rank-based,
                // though — both follow plain left-to-right array order
                // ("4, 0, 4", matching Experience Card's own "z-index
                // ascends with index" convention, DS §3.10), so the
                // rightmost "4" deals in last and sits on top.
                const rank = index - 1;
                const restX = rank * xStepPx;
                const restRotate = rank * rotationStepDeg;
                const restLift = Math.abs(rank) * liftPx;
                return (
                  <motion.div
                    key={digit + index}
                    className={styles.cardSlot}
                    style={{ zIndex: index }}
                    animate={{
                      x: restX,
                      rotate: restRotate,
                      y: [
                        restLift + translateY,
                        restLift,
                        restLift,
                        restLift + translateY,
                        restLift + translateY,
                      ],
                      opacity: [0, 1, 1, 0, 0],
                    }}
                    transition={{
                      duration: totalMs / 1000,
                      times,
                      repeat: Infinity,
                      delay: (index * (duration + stagger)) / 1000,
                      ease: ["easeOut", "linear", "easeIn", "linear"],
                    }}
                  >
                    <DigitCard digit={digit} />
                  </motion.div>
                );
              })}
            </div>
          </Link>
        </div>
        <div className={styles.footer}>
          <h2 className={styles.notFoundHeading}>Page Not Found</h2>
          <p className={styles.instruction}>Click the cards to return to the table.</p>
        </div>
      </div>
    </motion.div>
  );
}
