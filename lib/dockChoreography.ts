import { MOTION } from "./motion";
import { openEaseBezierPoints } from "./easing";

// Dock-formation choreography (DS §3.5/§3.6) — the one-time onboarding
// handoff where ControlDock forms from OnboardingScreen's standalone logo.
// The dock itself now persists across the Home <-> About route change
// (app/layout.tsx) rather than remounting per route, so this only ever plays
// forward, once, per entry path. All durations/easing come from
// MOTION.onboarding verbatim (still flagged placeholder-pending-tuning in
// lib/motion.ts).
//
// Two entry paths, both driven by the same three functions below via their
// `skipLogoPhase` param (ControlDock.tsx):
//   - Home (skipLogoPhase=false): logoTravel (FLIP, opaque) -> dockCrossfade
//     (opacity swap) -> dockFormation (shell expand + button stagger-in).
//   - Direct /about load (skipLogoPhase=true): no logo to travel, so the
//     shell just renders visible at rest size, holds for a brief
//     dockAboutAutoFormDelay beat (a real setTimeout in ControlDock.tsx,
//     not a Framer transition delay), then goes straight into the same
//     dockFormation expand + button stagger-in.

const logoTravel = MOTION.onboarding.logoTravel / 1000;
const crossfade = MOTION.onboarding.dockCrossfade / 1000;
const formation = MOTION.onboarding.dockFormation / 1000;

/** Glass shell's opacity + size/shape target (ControlDock.module.css's
 * .dockShell — a real element that grows, not a clip-path mask over an
 * already-full-size pill). Small circle -> full pill on desktop (width
 * only, height is 100% in both states, border-radius a constant 999px —
 * always exceeds half of any reasonable box dimension, so it renders as
 * "as round as the current box allows" throughout with zero morphing
 * needed); small circle -> full rounded column on mobile (width AND
 * height grow together, plus a real radius morph down to the final
 * rounded-rect corner, since only desktop's final shape is a true pill).
 * Mobile's rest-state radius is exactly `dockRestSize / 2` — the minimum
 * a circle needs at that box size — rather than reusing desktop's
 * oversized 999px constant: border-radius renders capped at
 * min(declared, currentHeight/2), so starting from 999px meant the decline
 * stayed invisible (capped) until the box had nearly finished growing,
 * even sharing the same timing as width/height. Starting already at the
 * exact circle-radius for that box size leaves next to no capping
 * headroom, so the corner visibly softens in step with the scale-up
 * instead of visibly lagging behind it. `top` only moves on mobile:
 * `dockRestTopOffsetMobile` at rest (centers the small circle on the
 * logo, which — unlike the shell's own top:0 reference point — sits
 * inset by the dock's own padding), back to 0 once formed (shell fills
 * the whole box edge to edge, matching every other state). `isMobile`
 * from hooks/useBreakpoint.ts. */
export function dockShellAnimate(formed: boolean, isMobile: boolean, skipLogoPhase = false) {
  const small = MOTION.onboarding.dockRestSize;
  return {
    opacity: formed || skipLogoPhase ? 1 : 0,
    width: formed ? "100%" : small,
    height: !isMobile || formed ? "100%" : small,
    top: isMobile && !formed ? MOTION.onboarding.dockRestTopOffsetMobile : 0,
    borderRadius: !isMobile ? 999 : formed ? MOTION.onboarding.dockMobileFormedRadius : small / 2,
  };
}

export function dockShellTransition(formed: boolean, skipLogoPhase = false) {
  const extendDelay = formed ? (skipLogoPhase ? 0 : logoTravel + crossfade) : 0;
  // duration is 0 (an instant snap, not a tween) whenever `formed` is still
  // false — the rest state is meant to be perfectly static, so any target
  // change that happens before the real formed flip (e.g. useBreakpoint()
  // correcting its SSR-safe "desktop" guess to "mobile" a tick after mount,
  // which briefly points height/radius at the wrong value) should resolve
  // instantly rather than visibly tween. Home never surfaces this either
  // way (the shell is opacity-0 for the entire unformed phase), but
  // About's skipLogoPhase reveal makes the shell visible immediately, so a
  // tweened correction there used to read as a multi-hundred-ms dip before
  // the real expand even started.
  const expand = {
    delay: extendDelay,
    duration: formed ? formation : 0,
    ease: openEaseBezierPoints,
  };
  return {
    opacity: skipLogoPhase
      ? { duration: 0 }
      : { delay: formed ? logoTravel : 0, duration: crossfade },
    width: expand,
    height: expand,
    top: expand,
    borderRadius: expand,
  };
}

/** Extra delay (on top of logoTravel + dockCrossfade) before the button
 * groups' own stagger-in starts — separate from (and later than) the
 * shell's own start, MOTION.onboarding.dockButtonRevealDelay, so buttons
 * don't fade in before the shell has actually grown out to reach them.
 * skipLogoPhase (About-direct-load) drops the logoTravel + crossfade term —
 * that pause is already provided by a real setTimeout in ControlDock.tsx
 * before `formed` ever flips true there, so adding it again here would
 * double-count it. */
export function dockExtendDelay(formed: boolean, skipLogoPhase = false) {
  if (!formed) return 0;
  return skipLogoPhase
    ? MOTION.onboarding.dockButtonRevealDelay / 1000
    : logoTravel + crossfade + MOTION.onboarding.dockButtonRevealDelay / 1000;
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
