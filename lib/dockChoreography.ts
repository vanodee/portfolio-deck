import { useTableStore } from "@/store/useTableStore";
import { MOTION } from "./motion";
import { openEaseBezierPoints } from "./easing";

// Shared dock-formation choreography (DS §3.5) — used both by the original
// onboarding handoff (Home's ControlDock forming from OnboardingScreen's
// standalone logo) and by the Home <-> About dock-nav transition, which
// plays the exact same three stages in reverse to exit a page, then forward
// again to enter the other one. All durations/easing come from
// MOTION.onboarding verbatim (still flagged placeholder-pending-tuning in
// lib/motion.ts) — nothing here introduces new timing constants.
//
// Forward:  logoTravel (FLIP, opaque) -> dockCrossfade (opacity swap) ->
//           dockFormation (clip expand + button stagger-in).
// Reverse:  dockFormation (clip collapse + button stagger-out, dock still
//           opaque) -> dockCrossfade (dock fades out as a fresh standalone-
//           logo instance fades in at the dock's rect) -> logoTravel (that
//           instance FLIPs out to the standalone position).
// Both directions total the same MOTION.onboarding.logoTravel +
// dockCrossfade + dockFormation duration.

const logoTravel = MOTION.onboarding.logoTravel / 1000;
const crossfade = MOTION.onboarding.dockCrossfade / 1000;
const formation = MOTION.onboarding.dockFormation / 1000;

export const DOCK_NAV_DURATION_MS =
  MOTION.onboarding.logoTravel + MOTION.onboarding.dockCrossfade + MOTION.onboarding.dockFormation;

/** Reverse-only: how long the clip-collapse + button stagger-out runs
 * before the center logo hands off to the standalone-logo instance. */
export const LOGO_SWAP_DELAY_MS = MOTION.onboarding.dockFormation;

/** Pill opacity + clip-path target — same shape either direction. */
export function dockPillAnimate(formed: boolean) {
  return {
    opacity: formed ? 1 : 0,
    clipPath: formed
      ? `ellipse(${MOTION.onboarding.dockFormedRadius}px ${MOTION.onboarding.dockFormedRadius}px at center)`
      : `ellipse(${MOTION.onboarding.dockRestRx}px ${MOTION.onboarding.dockRestRy}px at center)`,
  };
}

/** Forward: today's exact ControlDock math (moved verbatim). Reverse: the
 * temporal mirror — the clip collapses immediately, and the pill only
 * fades out once the clip has finished collapsing. */
export function dockPillTransition(formed: boolean, reverse: boolean) {
  if (reverse) {
    return {
      opacity: { delay: formation, duration: crossfade },
      clipPath: { delay: 0, duration: formation, ease: openEaseBezierPoints },
    };
  }
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

/** Button-group stagger. Forward staggers into "show" (as today, delayed
 * until the logo travel + crossfade finish). Reverse staggers into
 * "hidden" instead, starting immediately — Framer Motion uses the target
 * variant's own `transition` when animating into it, so the stagger config
 * has to live on whichever variant is being animated toward. */
export function dockGroupVariants(reverse: boolean, extendDelay: number) {
  const stagger = {
    delayChildren: reverse ? 0 : extendDelay,
    staggerChildren: MOTION.onboarding.dockButtonStagger / 1000,
    staggerDirection: -1 as const,
  };
  return reverse
    ? { hidden: { transition: stagger }, show: {} }
    : { hidden: {}, show: { transition: stagger } };
}

export const dockButtonVariants = {
  hidden: { opacity: 0, x: MOTION.onboarding.dockButtonOffsetX },
  show: { opacity: 1, x: 0 },
};

/** StandaloneLogo's own layout+opacity transition.
 * `enteringFromDock=false` (default): today's onboarding-exit shape — the
 * instance is already mounted and about to travel away toward a dock (FLIP
 * runs first, opaque, then crossfades out once travel finishes).
 * `enteringFromDock=true`: the reverse/origin case — a fresh instance just
 * mounted at the dock's rect, crossfades in first, then FLIPs out to the
 * standalone position. */
export function standaloneLogoTransition(enteringFromDock: boolean) {
  return enteringFromDock
    ? {
        opacity: { delay: 0, duration: crossfade },
        layout: { delay: crossfade, duration: logoTravel, ease: openEaseBezierPoints },
      }
    : {
        opacity: { delay: logoTravel, duration: crossfade },
        layout: { delay: 0, duration: logoTravel, ease: openEaseBezierPoints },
      };
}

/**
 * Click-triggered entry point (About button, Back-to-Home button). Guards
 * against re-entry via the store (rejects if a nav transition is already in
 * flight anywhere), then signals completion once the reverse sequence has
 * visually finished — mirroring lib/choreography.ts's
 * setTimeout(totalDuration, ...) completion idiom. The caller supplies
 * `onComplete` (typically `() => router.push(destination)`) since this
 * plain module has no hook access to next/navigation's router.
 */
export function beginDockExit(onComplete: () => void) {
  const started = useTableStore.getState().beginDockCollapse();
  if (!started) return;
  setTimeout(onComplete, DOCK_NAV_DURATION_MS);
}
