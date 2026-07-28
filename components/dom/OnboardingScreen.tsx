"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { openEaseBezierPoints } from "@/lib/easing";
import { useTableStore } from "@/store/useTableStore";
import { beginDeal } from "@/lib/choreography";
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
  // TableCanvas is dynamically imported (perf audit, 2026-07-28) — on a slow
  // chunk fetch this can lag well past the timings below, so the subheading
  // (the explicit "click here" invitation) additionally waits on it, rather
  // than ever inviting a click DeckClickCatcher isn't mounted to receive.
  // No visible effect on a normal-speed load: canvasReady is already true
  // long before subheadingDelay elapses.
  const canvasReady = useTableStore((s) => s.canvasReady);

  // Keyboard/AT path alongside DeckA11yButton's focusable button — Space and
  // Enter are the two keys most reliably passed through even under a screen
  // reader's browse-mode key interception (unlike an arbitrary "any key"
  // handler), and neither collides with Tab or other page navigation.
  // Modifier combos and repeats are ignored so held keys/OS shortcuts aren't
  // hijacked; preventDefault stops Space's default page-scroll behavior
  // (harmless here since scroll is already disabled pre-deal, but avoided
  // for cleanliness).
  useEffect(() => {
    if (!showing) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        beginDeal();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showing]);

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
              {canvasReady && (
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
                  Tap the deck or press <span className={styles.noWrap}>space/enter</span> to
                  deal yourself in
                </motion.p>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
      <StandaloneLogo showing={showing} />
    </>
  );
}
