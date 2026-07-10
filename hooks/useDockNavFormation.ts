"use client";

import { useEffect, useState } from "react";
import { useTableStore } from "@/store/useTableStore";
import { LOGO_SWAP_DELAY_MS } from "@/lib/dockChoreography";

export interface DockNavFormation {
  formed: boolean;
  /** Whether the dock's own center-logo slot should be mounted. Distinct
   * from `formed` only during a reverse (collapsing) sequence, where the
   * center logo must stay visible through the full clip-collapse before
   * handing off to the standalone logo. */
  centerLogoInstalled: boolean;
  /** Whether the shared StandaloneLogo should be rendered. */
  standaloneVisible: boolean;
  /** Pass through to StandaloneLogo's `enteringFromDock` — true only for
   * the page currently playing the reverse (collapsing) sequence. */
  reverse: boolean;
}

/**
 * Per-page glue between the Home <-> About dock-nav transition
 * (store.dockNavPhase, lib/dockChoreography.ts) and a dock component's own
 * render booleans.
 *
 * - Steady state (dockNavPhase "idle", or "expanding" once a previous nav
 *   has settled): mirrors the caller's own `steadyFormed` reactively — e.g.
 *   Home's pre-existing onboarding condition (`appPhase !== "onboarding"`),
 *   or a constant `true` for About, which has no onboarding concept.
 * - This page is the ORIGIN of a collapse (dockNavPhase "collapsing" and
 *   this page isn't mid-arrival itself): plays the reverse sequence —
 *   buttons/clip collapse immediately, the center logo stays mounted until
 *   LOGO_SWAP_DELAY_MS, then hands off to the standalone logo. A page that
 *   itself arrived via a previous nav (e.g. About, having settled) can
 *   later become an origin too — that's exactly this branch, not the
 *   arrival branch below, since `stillArriving` has already gone false.
 * - This page is the DESTINATION, mid-arrival (mounted already at
 *   "collapsing" because the *other* page triggered it before navigating
 *   here, captured once at mount as `arrivingViaNav`): plays the forward
 *   sequence. `stillArriving` (arrivingViaNav and not yet reached
 *   "expanding") gates this so it only applies to that one initial
 *   arrival — once "expanding" is reached, this page falls back to the
 *   steady/origin branches like any other settled dock, so a later
 *   self-triggered collapse is handled correctly.
 */
export function useDockNavFormation(steadyFormed: boolean): DockNavFormation {
  const dockNavPhase = useTableStore((s) => s.dockNavPhase);
  const beginDockExpand = useTableStore((s) => s.beginDockExpand);

  // Captured once, synchronously, on first render: true only if this page
  // mounted because the OTHER page had already triggered a collapse.
  const [arrivingViaNav] = useState(() => dockNavPhase === "collapsing");

  useEffect(() => {
    if (!arrivingViaNav) return;
    beginDockExpand();
    // Deliberately mount-only — arrivingViaNav itself is captured once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Latches true once "expanding" is reached, so this page's initial
  // arrival is recognized as finished even after a later render — and,
  // per React's documented "adjust state during render" pattern, doesn't
  // need an effect: this is a plain conditional update in the render body.
  const [hasExpanded, setHasExpanded] = useState(dockNavPhase === "expanding");
  if (dockNavPhase === "expanding" && !hasExpanded) {
    setHasExpanded(true);
  }
  const stillArriving = arrivingViaNav && !hasExpanded;

  // Origin-only: marks when the clip-collapse has finished and the center
  // logo should hand off to the standalone logo.
  const [logoSwapped, setLogoSwapped] = useState(false);
  useEffect(() => {
    if (stillArriving || dockNavPhase !== "collapsing") return;
    const t = setTimeout(() => setLogoSwapped(true), LOGO_SWAP_DELAY_MS);
    return () => clearTimeout(t);
  }, [stillArriving, dockNavPhase]);

  if (stillArriving) {
    const formed = dockNavPhase === "expanding";
    return { formed, centerLogoInstalled: formed, standaloneVisible: !formed, reverse: false };
  }
  if (dockNavPhase === "collapsing") {
    return {
      formed: false,
      centerLogoInstalled: !logoSwapped,
      standaloneVisible: logoSwapped,
      reverse: true,
    };
  }
  return {
    formed: steadyFormed,
    centerLogoInstalled: steadyFormed,
    standaloneVisible: false,
    reverse: false,
  };
}
