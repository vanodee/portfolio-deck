"use client";

import { useEffect, useState } from "react";

/**
 * Shared "start revealed, hold, settle to idle" state machine for the About
 * page's section-reveal choreography — used by Chip.tsx (tool variant) and
 * BrandCard.tsx, whose entrance should arrive already showing their
 * hovered/revealed pose (label visible / logo shown) rather than settling
 * into it after the fact.
 *
 * Returns `true` from first render whenever `armed`, deliberately not
 * false-then-flip-true: the element is still opacity:0 (pre-trigger) at that
 * point, so it simply appears already revealed with no extra visible step
 * once its own deal-in fade begins. Once `sectionTriggered` (this item's
 * section has actually started revealing), a single timer settles it back to
 * `false` — timed from `delayMs + entryDurationMs` (this item's own stagger
 * position PLUS its own entrance's full duration, i.e. the moment it's
 * actually finished arriving, not the moment it started) plus `holdMs` (how
 * long to stay revealed once arrived). Since items are already sequenced
 * one-at-a-time by the caller (delay_i = i * (duration + stagger)), settling
 * from each item's own arrival time keeps the settle-to-idle transitions in
 * that same one-at-a-time order too, with no extra bookkeeping needed here.
 * Returns `false` unconditionally when `!armed` (repeat visit this session):
 * idle from the start, no forced state at all.
 */
export function useEntranceHoldReveal(
  armed: boolean,
  sectionTriggered: boolean,
  delayMs: number,
  entryDurationMs: number,
  holdMs: number,
): boolean {
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!armed || !sectionTriggered || settled) return;
    const t = setTimeout(() => setSettled(true), delayMs + entryDurationMs + holdMs);
    return () => clearTimeout(t);
  }, [armed, sectionTriggered, delayMs, entryDurationMs, holdMs, settled]);

  return armed && !settled;
}
