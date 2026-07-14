"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Per-section viewport-intersection gate for the About page's section-reveal
 * choreography (see hooks/useAboutSectionsGate.ts for the session-scoped
 * "should this play at all" half). Attach `ref` to a section's own DOM node;
 * `triggered` flips true (once, permanently) the first time that section is
 * scrolled into view, but not before `baseDelayMs` has elapsed since mount —
 * that delay holds Hero's reveal back until the page-level Home <-> About
 * slide-in has settled on a nav-arrival (it's above-the-fold and otherwise
 * in view immediately on mount, before that transition finishes). Lower
 * sections aren't affected in practice since they won't be in view yet
 * regardless, but the same gate applies uniformly for consistency.
 *
 * When `armed` is false (repeat visit this session), `triggered` is true
 * from the start — every consumer should already be rendering its settled
 * resting state with no animation in that case.
 */
export function useSectionReveal(
  armed: boolean,
  baseDelayMs: number,
): { ref: React.RefObject<HTMLElement | null>; triggered: boolean } {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [delayElapsed, setDelayElapsed] = useState(baseDelayMs === 0);

  useEffect(() => {
    if (baseDelayMs === 0) return;
    const t = setTimeout(() => setDelayElapsed(true), baseDelayMs);
    return () => clearTimeout(t);
    // Mount-only — baseDelayMs is itself a one-time mount snapshot
    // (useAboutSectionsGate).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, triggered: !armed || (delayElapsed && inView) };
}
