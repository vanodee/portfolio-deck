import { MOTION } from "./motion";
import { openEaseBezierPoints } from "./easing";

// Dock-formation choreography (DS §3.5) — the one-time onboarding handoff
// where ControlDock forms from OnboardingScreen's standalone logo. The dock
// itself now persists across the Home <-> About route change (app/layout.tsx)
// rather than remounting per route, so this only ever plays forward, once.
// All durations/easing come from MOTION.onboarding verbatim (still flagged
// placeholder-pending-tuning in lib/motion.ts).
//
// logoTravel (FLIP, opaque) -> dockCrossfade (opacity swap) ->
// dockFormation (clip expand + button stagger-in).

const logoTravel = MOTION.onboarding.logoTravel / 1000;
const crossfade = MOTION.onboarding.dockCrossfade / 1000;
const formation = MOTION.onboarding.dockFormation / 1000;

/** Pill opacity + clip-path target. */
export function dockPillAnimate(formed: boolean) {
  return {
    opacity: formed ? 1 : 0,
    clipPath: formed
      ? `ellipse(${MOTION.onboarding.dockFormedRadius}px ${MOTION.onboarding.dockFormedRadius}px at center)`
      : `ellipse(${MOTION.onboarding.dockRestRx}px ${MOTION.onboarding.dockRestRy}px at center)`,
  };
}

export function dockPillTransition(formed: boolean) {
  const extendDelay = formed ? logoTravel + crossfade : 0;
  return {
    opacity: { delay: formed ? logoTravel : 0, duration: crossfade },
    clipPath: { delay: extendDelay, duration: formation, ease: openEaseBezierPoints },
  };
}

/** Same value/delay math ControlDock used inline for extendDelay — exposed
 * so callers can feed it into dockGroupVariants without recomputing it. */
export function dockExtendDelay(formed: boolean) {
  return formed ? logoTravel + crossfade : 0;
}

/** Button-group stagger, delayed until the logo travel + crossfade finish. */
export function dockGroupVariants(extendDelay: number) {
  const stagger = {
    delayChildren: extendDelay,
    staggerChildren: MOTION.onboarding.dockButtonStagger / 1000,
    staggerDirection: -1 as const,
  };
  return { hidden: {}, show: { transition: stagger } };
}

export const dockButtonVariants = {
  hidden: { opacity: 0, x: MOTION.onboarding.dockButtonOffsetX },
  show: { opacity: 1, x: 0 },
};

/** Left dock-group route-swap (ControlDock.tsx) — the current side's
 * buttons translate down and fade out on toggle click; the new side's
 * mount already in this "hidden" state and animate to "show" once the
 * route actually changes. Distinct from dockButtonVariants (onboarding's
 * horizontal x-offset stagger) — this one moves vertically and is driven
 * by route-swap state, not the dock's formed/settled onboarding flags. */
export const leftSwapButtonVariants = {
  hidden: { opacity: 0, y: MOTION.dockLeftSwap.offsetY },
  show: { opacity: 1, y: 0 },
};

/** Per-button transition for leftSwapButtonVariants — plain index-based
 * delay rather than a parent staggerChildren config, since each button
 * already sits inside dockButtonVariants' own wrapper (that stagger is a
 * one-time onboarding concern, unrelated to this one) and stacking a
 * second Framer Motion stagger context on the same tree gets confusing
 * fast for only 2-3 items. */
export function leftSwapTransition(index: number) {
  return {
    delay: (index * MOTION.dockLeftSwap.stagger) / 1000,
    duration: MOTION.dockLeftSwap.duration / 1000,
    ease: openEaseBezierPoints,
  };
}

/** StandaloneLogo's own layout+opacity transition — already mounted and
 * about to travel away toward the dock (FLIP runs first, opaque, then
 * crossfades out once travel finishes). */
export function standaloneLogoTransition() {
  return {
    opacity: { delay: logoTravel, duration: crossfade },
    layout: { delay: 0, duration: logoTravel, ease: openEaseBezierPoints },
  };
}
