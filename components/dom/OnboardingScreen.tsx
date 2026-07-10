"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { openEaseBezierPoints } from "@/lib/easing";
import { useTableStore } from "@/store/useTableStore";
import StandaloneLogo from "./StandaloneLogo";
import styles from "./OnboardingScreen.module.css";

// Pre-table gate (new top-level phase, preceding deck-collapsing/dealing ->
// table): "Hello!"/subheading + a standalone logo mark, centered over the
// deck's dramatic shuffle loop (Card.tsx onboardingShuffleStart). The deck
// itself is clicked via DeckClickCatcher.tsx, which calls beginDeal() —
// this component only reacts to the resulting appPhase change, it never
// drives the deal itself.
export default function OnboardingScreen() {
  const appPhase = useTableStore((s) => s.appPhase);
  const showing = appPhase === "onboarding";

  // Subheading can't start until BOTH "Hello!"'s translate-into-place AND
  // the cards' own fade-in (Card.tsx's entrance spring) have finished —
  // computed from the other two durations rather than an independently
  // guessed constant, so it's structurally guaranteed regardless of future
  // retuning of either one.
  const subheadingDelay =
    Math.max(
      MOTION.onboarding.helloEnterDuration,
      MOTION.onboarding.cardsFadeInDelay + MOTION.onboarding.cardsFadeInDuration,
    ) + MOTION.onboarding.subheadingDelayGap;

  return (
    <>
      <div className={styles.textLayer} aria-hidden={!showing}>
        <AnimatePresence>
          {showing && (
            // Plain div, not a motion component — AnimatePresence tracks
            // this by key regardless, and PresenceContext still propagates
            // to the two independently-animated children below, so it
            // waits for both of their own exit animations before unmounting.
            <div key="onboarding-text" className={styles.textGroup}>
              <motion.h1
                className={styles.hello}
                initial={{ y: `${MOTION.onboarding.helloEnterTranslateVh}vh` }}
                animate={{ y: 0 }}
                exit={{
                  opacity: 0,
                  y: -MOTION.onboarding.helloExitTranslateY,
                  transition: { duration: MOTION.onboarding.helloFadeOut / 1000 },
                }}
                transition={{
                  duration: MOTION.onboarding.helloEnterDuration / 1000,
                  ease: openEaseBezierPoints,
                }}
              >
                Hello!
              </motion.h1>
              <motion.p
                className={styles.subheading}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0, transition: { duration: MOTION.onboarding.helloFadeOut / 1000 } }}
                transition={{
                  duration: MOTION.onboarding.subheadingFadeIn / 1000,
                  delay: subheadingDelay / 1000,
                  ease: openEaseBezierPoints,
                }}
              >
                Tap the deck to deal yourself in
              </motion.p>
            </div>
          )}
        </AnimatePresence>
      </div>
      <StandaloneLogo showing={showing} />
    </>
  );
}
