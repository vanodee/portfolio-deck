"use client";

import { useEffect, useState } from "react";
import { useTableStore } from "@/store/useTableStore";
import { MOTION } from "@/lib/motion";

/**
 * Gates the About page's section-reveal choreography (Hero/Run/Chips/Brands
 * "dealt in" staggers — hooks/useSectionReveal.ts,
 * hooks/useEntranceHoldReveal.ts): decides whether this mount plays it at
 * all, and how long to hold before any section's viewport observer is
 * allowed to fire.
 *
 * `armed` is read once at mount, mirroring AboutContent.tsx's own
 * `enterFromRight` idiom exactly — a live subscription would let a later,
 * unrelated re-render flip an in-progress reveal off mid-animation.
 * `aboutSectionsRevealed` never resets except a hard reload (same
 * convention as dealComplete/dockNavPhase, see store/useTableStore.ts), so
 * this is "first visit or refresh only," matching Home's onboarding gate.
 *
 * `baseDelayMs` holds section reveals back until the page-level Home <->
 * About slide-in (AboutContent.tsx's own root motion.div, MOTION.aboutNav)
 * has settled, but only when this mount was actually reached via client-side
 * nav — dockNavPhase has already left "idle" by the time AboutContent
 * mounts in that case (lib/choreography.ts), same check AboutContent.tsx
 * already uses for `enterFromRight`. A direct/hard-reloaded load has no
 * page-level transition to wait for, so the delay is 0.
 */
export function useAboutSectionsGate(): { armed: boolean; baseDelayMs: number } {
  const [armed] = useState(() => !useTableStore.getState().aboutSectionsRevealed);
  const [baseDelayMs] = useState(() =>
    useTableStore.getState().dockNavPhase !== "idle"
      ? MOTION.aboutNav.duration + MOTION.aboutSectionReveal.routeTransitionBuffer
      : 0,
  );

  useEffect(() => {
    if (armed) useTableStore.getState().markAboutSectionsRevealed();
    // Marked immediately on the first armed mount, not after animations
    // finish — an interrupted first play (e.g. About -> Home -> About again
    // before it settles) should never get a second attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { armed, baseDelayMs };
}
