"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ExperienceCardData } from "@/data/types";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { MOTION } from "@/lib/motion";
import ExperienceCard from "./ExperienceCard";
import styles from "./ExperienceCardSpread.module.css";

const MAX_CARDS = 4;
const CARD_W = 214;
const CARD_H = 300;

// Static, non-interactive — capped at 4 (most recent roles only, per the
// prompt: older history lives on the resume). Array-driven — reuses
// EXPERIENCE.map, not fixed JSX instances.
//
// Two responsive variants (lib/motion.ts's MOTION.experienceFan.desktop /
// .mobile), switched on the same 767px breakpoint the rest of the About
// page uses (hooks/useBreakpoint.ts, matching PlayArea.tsx's usage):
//   - desktop: the horizontal fan, continuously scaled down to fit the
//     measured available width (ResizeObserver on `measureRef`, same
//     pattern as PlayArea.tsx's own frame measurement) — cards shrink
//     smoothly as the viewport narrows, rather than staying pinned at
//     native size until AboutContent.module.css's .runSpreadWrap
//     overflow-x:auto scroll fallback kicks in. That fallback stays as a
//     defense-in-depth safety net (e.g. the brief pre-measurement frame
//     before availableWidth is known), but shouldn't need to visibly
//     trigger in normal use anymore (responsive audit follow-up: an
//     earlier fixed-size-cards pass left it visible well before the mobile
//     breakpoint, which is what this replaces).
//   - mobile: a vertical peek-stack. Cards stack directly on top of each
//     other with no x-offset or rotation; z-index ascends with index (later
//     cards drawn on top), which is what leaves each EARLIER card's own top
//     edge exposed above the card below it — the physical consequence is
//     that the LAST (oldest) card ends up fully shown at the bottom of the
//     stack (nothing below it to cover any part), while every other card
//     reveals only its own top `revealPx` — where ExperienceCard.module.css
//     now anchors its text — regardless of position in the stack.
export default function ExperienceCardSpread({
  experiences,
  revealArmed = false,
  revealTriggered = false,
}: {
  experiences: ExperienceCardData[];
  /** About page section-reveal (hooks/useAboutSectionsGate.ts) — whether the
   * first-visit "dealt in" entrance should play at all this mount. */
  revealArmed?: boolean;
  /** Whether this section has actually scrolled into view and its entrance
   * should be playing/have played (hooks/useSectionReveal.ts). */
  revealTriggered?: boolean;
}) {
  const cards = experiences.slice(0, MAX_CARDS);
  const breakpoint = useBreakpoint();

  const measureRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const measure = () => setAvailableWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Entrance choreography: cards deal in ascending index order — both
  // layouts already have z-index ascend with index (later cards drawn on
  // top), so "topmost dealt last" falls out of plain array order with no
  // reordering needed. Once the stagger has had time to finish, reverts to
  // an immediate (duration: 0) transition so ResizeObserver-driven
  // rotate/position recalculations snap instantly like before this feature,
  // rather than replaying the entrance's eased transition on every resize.
  const [entranceSettled, setEntranceSettled] = useState(false);
  const usingEntranceTransition = revealArmed && !entranceSettled;
  useEffect(() => {
    if (!revealArmed || !revealTriggered || entranceSettled) return;
    // Items deal in strictly one-at-a-time (delay_i = i * (duration +
    // stagger), see entranceTransition below) — total time is that same
    // per-item interval times the count, plus the last card's own duration.
    const total =
      Math.max(0, cards.length - 1) *
        (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger) +
      MOTION.aboutSectionReveal.duration +
      100; // settle margin, mirrors lib/choreography.ts's setTimeout(total, ...) idiom
    const t = setTimeout(() => setEntranceSettled(true), total);
    return () => clearTimeout(t);
  }, [revealArmed, revealTriggered, entranceSettled, cards.length]);

  const entranceTransition = (index: number) =>
    usingEntranceTransition
      ? {
          // Strictly one-at-a-time: each card doesn't start until the
          // previous one has fully finished (+ a breathing gap).
          delay:
            (index * (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger)) /
            1000,
          duration: MOTION.aboutSectionReveal.duration / 1000,
          ease: "easeOut" as const,
        }
      : { duration: 0 };

  if (breakpoint === "mobile") {
    const { revealPx } = MOTION.experienceFan.mobile;
    const wrapHeight = Math.max(cards.length - 1, 0) * revealPx + CARD_H;
    return (
      <div className={styles.spread} style={{ width: CARD_W, height: wrapHeight }}>
        {cards.map((experience, index) => (
          <motion.div
            key={experience.id}
            className={styles.slot}
            style={{ left: 0, top: index * revealPx, zIndex: index }}
            initial={revealArmed ? { y: MOTION.aboutSectionReveal.translateY, opacity: 0 } : false}
            animate={{
              y: !revealArmed || revealTriggered ? 0 : MOTION.aboutSectionReveal.translateY,
              opacity: !revealArmed || revealTriggered ? 1 : 0,
            }}
            transition={entranceTransition(index)}
          >
            <ExperienceCard experience={experience} elevated />
          </motion.div>
        ))}
      </div>
    );
  }

  const { xStepPx, rotationStepDeg, liftPx } = MOTION.experienceFan.desktop;
  const n = cards.length;

  // Each card's UNSCALED center position + rotation (bow shape: center
  // cards ride highest, outer cards dip lower and rotate more, mirroring a
  // hand-fan pivoting below the spread), plus its true rotated bounding
  // box — a WxH box rotated by θ has a visual footprint of
  // W·|cosθ|+H·|sinθ| wide by W·|sinθ|+H·|cosθ| tall, which extends past
  // its own nominal (unrotated) edges on EVERY side, not just left/right.
  // Sizing the wrap from card-size-plus-step/lift alone (as an earlier pass
  // did) undercounts this on both axes — confirmed live: a residual
  // horizontal scrollbar even at "wide enough" widths, AND the bottom edge
  // of the outer cards clipped/scrollable vertically, since a lone
  // `overflow-x` set with `overflow-y` left at its default `visible` gets
  // silently upgraded to `overflow-y:auto` by the UA (CSS Overflow spec),
  // so the same uncounted rotation overhang clips vertically too. Computing
  // every card's actual rotated bounds and using their true min/max extent
  // (not a hand-derived formula for just the outermost card) sizes the wrap
  // exactly, with no clipping possible on either axis by construction.
  const geoms = cards.map((_, index) => {
    const t = index - (n - 1) / 2;
    return {
      cx: t * xStepPx,
      cy: Math.abs(t) * liftPx + CARD_H / 2,
      rotate: t * rotationStepDeg,
    };
  });
  const rotatedHalfExtents = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    return { halfW: (CARD_W * cos + CARD_H * sin) / 2, halfH: (CARD_W * sin + CARD_H * cos) / 2 };
  };
  let minLeft = Infinity;
  let maxRight = -Infinity;
  let minTop = Infinity;
  let maxBottom = -Infinity;
  for (const g of geoms) {
    const { halfW, halfH } = rotatedHalfExtents(g.rotate);
    minLeft = Math.min(minLeft, g.cx - halfW);
    maxRight = Math.max(maxRight, g.cx + halfW);
    minTop = Math.min(minTop, g.cy - halfH);
    maxBottom = Math.max(maxBottom, g.cy + halfH);
  }
  const naturalWidth = maxRight - minLeft;
  const naturalHeight = maxBottom - minTop;

  // Never scales up past native size (1) — only shrinks once the measured
  // width can't fit the fan's natural (rotation-inclusive) footprint.
  // `availableWidth == null` (pre-measurement, first paint) gates below so
  // nothing renders at the wrong scale before it's known.
  const scale = availableWidth != null ? Math.min(1, availableWidth / naturalWidth) : null;

  if (scale == null) {
    return <div ref={measureRef} className={styles.measure} />;
  }

  const scaledCardW = CARD_W * scale;
  const scaledCardH = CARD_H * scale;
  const wrapWidth = naturalWidth * scale;
  const wrapHeight = naturalHeight * scale;

  return (
    <div ref={measureRef} className={styles.measure}>
      <div className={styles.spread} style={{ width: wrapWidth, height: wrapHeight }}>
        {cards.map((experience, index) => {
          const g = geoms[index];
          // Shifts the scaled fan so its true rotated bounding box
          // (minLeft..maxRight, minTop..maxBottom) starts flush at the
          // wrap's own (0,0) — not just the nominal, unrotated card edges.
          const centerX = (g.cx - minLeft) * scale;
          const centerY = (g.cy - minTop) * scale;
          return (
            <motion.div
              key={experience.id}
              className={styles.slot}
              style={{
                left: centerX - scaledCardW / 2,
                top: centerY - scaledCardH / 2,
                width: scaledCardW,
                height: scaledCardH,
                zIndex: index,
              }}
              // Rotates the already-scaled-size outer box (pivots around its
              // own center, correct for the fan look) — the inner
              // .scaleInner (below) handles the size reduction itself,
              // separately, with its own top-left origin, so the two
              // transforms don't fight over a shared origin. Framer now owns
              // this transform (rotate moved from a static inline style into
              // animate) so it can also carry the entrance y/opacity.
              initial={
                revealArmed
                  ? { rotate: g.rotate, y: MOTION.aboutSectionReveal.translateY, opacity: 0 }
                  : false
              }
              animate={{
                rotate: g.rotate,
                y: !revealArmed || revealTriggered ? 0 : MOTION.aboutSectionReveal.translateY,
                opacity: !revealArmed || revealTriggered ? 1 : 0,
              }}
              transition={entranceTransition(index)}
            >
              <div
                className={styles.scaleInner}
                style={{ width: CARD_W, height: CARD_H, transform: `scale(${scale})` }}
              >
                <ExperienceCard experience={experience} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
