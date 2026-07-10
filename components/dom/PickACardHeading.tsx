"use client";

import { motion } from "framer-motion";
import { openEaseBezierPoints } from "@/lib/easing";
import { MOTION } from "@/lib/motion";
import { useTableStore } from "@/store/useTableStore";
import { useShowTableContent } from "@/hooks/useShowTableContent";
import styles from "./PickACardHeading.module.css";

// Fades in (translating downward into place, from -pickACardTranslateY to
// 0) as the final onboarding beat, once the entrance deal completes
// (dealComplete) — delayed by TableHeader's FULL fade/translate-in duration
// (not just a fixed gap) plus a small extra beat, so it only ever starts
// once the header's own animation has actually finished, never overlapping.
//
// Also plays the Home <-> About dock-nav exit/enter (translate up + fade,
// hooks/useShowTableContent.ts) — this component persists across the route
// change (app/layout.tsx, nested in the hoisted PlayArea), so unlike the
// dock it never remounts; the transition is a plain animate-target change.
export default function PickACardHeading() {
  const dealComplete = useTableStore((s) => s.dealComplete);
  const showTableContent = useShowTableContent();

  // Once a dock-nav transition has ever happened, the onboarding-entrance-
  // specific startDelay below no longer applies to any future return — that
  // delay only makes sense keyed to the header's own first-ever fade-in,
  // not a return from the About page. dockNavPhase never resets back to
  // "idle" once it's left that state (store/useTableStore.ts), so this is
  // a plain derived read — no local latch/effect needed.
  const hasEverExited = useTableStore((s) => s.dockNavPhase !== "idle");

  const startDelay =
    (MOTION.onboarding.headerFadeIn + MOTION.onboarding.headingDelayAfterHeader) / 1000;

  const animate = !showTableContent
    ? { opacity: 0, y: -MOTION.tableNav.headingTranslateY }
    : dealComplete
      ? { opacity: 0.2, y: 0 }
      : { opacity: 0, y: -MOTION.onboarding.pickACardTranslateY };

  const transition = hasEverExited
    ? { duration: MOTION.tableNav.headingDuration / 1000, ease: openEaseBezierPoints }
    : {
        duration: MOTION.onboarding.headingFadeIn / 1000,
        delay: dealComplete ? startDelay : 0,
        ease: openEaseBezierPoints,
      };

  return (
    <motion.h1 className={styles.heading} initial={false} animate={animate} transition={transition}>
      Pick a Card
    </motion.h1>
  );
}
