"use client";

import type { RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { animated, useSpring } from "@react-spring/three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import type { Project } from "@/data/types";
import { COLORS, ELEVATION, type ElevationRow } from "@/lib/colors";
import {
  contentPanOffset,
  getReadingPane,
  onboardingRestY,
  type FrameRect,
  type TableLayout,
} from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import {
  easeIn,
  easeInOut,
  easeOut,
  easeOutBack,
  expoOut,
  flipEase,
  openEase,
} from "@/lib/easing";
import { cardHandles } from "@/lib/cardHandles";
import { gatherAround, scatterFromCenter } from "@/lib/choreography";
import { useTableStore } from "@/store/useTableStore";
import { useCardTextures } from "@/hooks/useCardTextures";
import {
  FLAGSHIP_GLOW_PAD,
  getGlowTexture,
  getShadowTexture,
  SHADOW_PAD,
} from "@/lib/textures/shadowTexture";

interface CardProps {
  project: Project;
  layout: TableLayout;
  /** Stable per-card index — resting z offset so overlaps sort predictably. */
  stackIndex: number;
  /** Total dealt card count — used for the onboarding-shuffle pile split. */
  cardCount: number;
  /** Play-area frame's measured screen rect, for content-local → world conversion. */
  frameRect: FrameRect | null;
  /** Live scrollTop of the play area's native scroll proxy (ref, not state). */
  scrollYRef: RefObject<number>;
}

function lerpRow(a: ElevationRow, b: ElevationRow, t: number): ElevationRow {
  return {
    offsetX: a.offsetX + (b.offsetX - a.offsetX) * t,
    offsetY: a.offsetY + (b.offsetY - a.offsetY) * t,
    blur: a.blur + (b.blur - a.blur) * t,
    opacity: a.opacity + (b.opacity - a.opacity) * t,
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// animated('meshBasicMaterial') trips TS's instantiation-depth limit when
// inferring spring-driven material props — alias with a shallow prop type.
// Generic (not glow-specific) — also drives the front/back faces' one-time
// entrance fade-in below.
const AnimatedMeshBasicMaterial = animated(
  "meshBasicMaterial",
) as unknown as React.ComponentType<Record<string, unknown>>;

// Structure (outer → inner):
//   group (pan: content-local → world, imperative per-frame)
//     animated.group (pos spring: x/y, travel z + scale)
//       ├─ shadow mesh      — driven per-frame (bob + hover composite)
//       ├─ glow mesh        — hover spring opacity, white/gold
//       └─ bob group        — per-frame sine lift (scale pulse + y drift)
//           └─ animated flip group (rot spring, hover lift/scale)
//               ├─ front plane (rotY 0)
//               └─ back plane (rotY π)
export default function Card({
  project,
  layout,
  stackIndex,
  cardCount,
  frameRect,
  scrollYRef,
}: CardProps) {
  const textures = useCardTextures(project);
  const glowTexture = useMemo(() => getGlowTexture(), []);
  const shadowTexture = useMemo(() => getShadowTexture(), []);

  const appPhase = useTableStore((s) => s.appPhase);
  const phase = useTableStore((s) => s.cards[project.id].phase);
  const setCardPhase = useTableStore((s) => s.setCardPhase);
  const setFaceUp = useTableStore((s) => s.setFaceUp);
  const isOpenCard = useTableStore((s) => s.openCardId === project.id);
  const anyCardOpen = useTableStore((s) => s.openCardId !== null);
  const openPhase = useTableStore((s) => s.openPhase);
  const { size } = useThree();
  // Converts this card's content-local spring position into true-viewport
  // world coordinates every frame — imperative, not spring-driven, so
  // scrolling the play area never fights or restarts the position spring.
  const panRef = useRef<THREE.Group>(null);
  // Cooperative cancellation for the onboarding shuffle loop below — the
  // loop checks this every iteration; deal()'s own posApi.start() takeover
  // is what actually ends the animation, this just stops scheduling more.
  const onboardingCancelRef = useRef(false);

  const { cardW, cardH } = layout;
  // One-time mount snapshots (useState initializers are render-safe).
  const [initialCard] = useState(() => useTableStore.getState().cards[project.id]);
  const [startAtDeck] = useState(() => !useTableStore.getState().dealComplete);
  // Home <-> About dock-nav transition: this component now fully unmounts
  // while off Home (PlayArea.tsx route-gates TableCanvas) rather than
  // staying mounted-but-hidden, so a fresh mount arriving back on Home
  // needs to know to start off-table and animate itself in — there's no
  // continuously-mounted instance left for an external trigger to reach.
  // dockNavPhase never resets to "idle" once a nav transition has happened
  // (store/useTableStore.ts), so this is a reliable one-time mount check.
  const [startOffTable] = useState(() => useTableStore.getState().dockNavPhase !== "idle");
  const restZ = stackIndex * 0.05;

  // Per-card randomized bob rhythm, seeded off the stable index.
  const bobSeed = useMemo(() => {
    const period =
      MOTION.idleBob.periodMin +
      ((stackIndex * 733) % 1000) *
        ((MOTION.idleBob.periodMax - MOTION.idleBob.periodMin) / 1000);
    const phase0 = (stackIndex * 2.399) % (Math.PI * 2); // golden-angle spread
    return { period, phase0 };
  }, [stackIndex]);

  // Stable per-card X fan for the onboarding shuffle loop — computed once
  // (same deterministic-seed recipe as bobSeed above), not re-randomized
  // per tick, so the "not perfectly aligned horizontally" look stays clean
  // rather than noisy.
  const shuffleFanX = useMemo(() => {
    const seed = ((stackIndex * 733) % 1000) / 1000;
    return (seed - 0.5) * 2 * MOTION.onboardingShuffle.fanAmpX;
  }, [stackIndex]);

  const [flip, flipApi] = useSpring(() => ({
    rot: initialCard.faceUp ? 0 : Math.PI,
  }));

  const [hover, hoverApi] = useSpring(() => ({
    lift: 0,
    hScale: 1,
    glow: 0,
  }));

  // Bob amplitude eases out when the card leaves idle, back in on return.
  const [bob, bobApi] = useSpring(() => ({
    amp: initialCard.phase === "idle" ? 1 : 0,
  }));

  // One-time page-load fade-in for the front/back faces (see the mount
  // effect below) — distinct from every other spring here, which react to
  // ongoing phase/interaction state; this one fires exactly once, ever.
  const [entrance, entranceApi] = useSpring(() => ({ opacity: 0 }));

  // Onboarding cards spawn directly at the shuffle rest position (no
  // animated entrance/drop) — they only travel back up to the real deck
  // position once ascendToDeck() runs, on click, before deal()'s jitter.
  const onboardingStartY = frameRect
    ? onboardingRestY(layout, frameRect, size.height)
    : layout.deck.y;

  const [pos, posApi] = useSpring(() => ({
    x: startAtDeck
      ? layout.deck.x + shuffleFanX
      : startOffTable
        ? layout.positions[initialCard.gridIndex].x - MOTION.tableNav.cardTranslateX
        : layout.positions[initialCard.gridIndex].x,
    y: startAtDeck ? onboardingStartY : layout.positions[initialCard.gridIndex].y,
    z: startAtDeck ? restZ + stackIndex * 0.2 : restZ,
    travelScale: 1,
    rotZ: 0, // in-plane fan tilt, only nonzero during gather/scatter
  }));

  useEffect(() => {
    bobApi.start({
      amp: phase === "idle" ? 1 : 0,
      config: { duration: 350, easing: easeInOut },
    });
  }, [phase, bobApi]);

  // Re-sync position when the layout changes (resize/breakpoint) — snaps to
  // the current grid slot unless the card is mid-deal. Also skipped while
  // "offTable" (Home <-> About dock-nav transition, lib/choreography.ts):
  // PlayArea now persists across that route change (app/layout.tsx), and
  // its ResizeObserver can fire from the surrounding page content
  // reflowing even though nothing actually resized meaningfully — a fresh
  // `layout` object identity here would otherwise snap the card straight
  // back to its grid slot mid-exit/enter, undoing exitOffTable's translate.
  useEffect(() => {
    const s = useTableStore.getState();
    if (!s.dealComplete || s.cards[project.id].phase === "offTable") return;
    const idx = s.cards[project.id].gridIndex;
    posApi.start({
      x: layout.positions[idx].x,
      y: layout.positions[idx].y,
      z: restZ,
      immediate: true,
    });
  }, [layout, posApi, project.id, restZ]);

  // Imperative handle for table-level choreography.
  useEffect(() => {
    cardHandles.set(project.id, {
      flip: (faceUp, delayMs = 0) => {
        setCardPhase(project.id, "flipping");
        flipApi.start({
          rot: faceUp ? 0 : Math.PI,
          delay: delayMs,
          config: { duration: MOTION.flip, easing: flipEase },
          onRest: () => setCardPhase(project.id, "idle"),
        });
      },

      // Entrance deal (PRD §4.1 / DS §6): jitter at the deck while stacked,
      // wait out the stagger, then decelerate into the grid slot.
      deal: (delayMs) => {
        const target = layout.positions[
          useTableStore.getState().cards[project.id].gridIndex
        ];
        const { deck } = layout;
        posApi.start({
          to: async (next) => {
            const jitterEnd = Date.now() + MOTION.deal.jitter;
            while (Date.now() < jitterEnd - 70) {
              await next({
                x: deck.x + (Math.random() - 0.5) * 10,
                y: deck.y + (Math.random() - 0.5) * 8,
                config: { duration: 60 },
              });
            }
            await next({ x: deck.x, y: deck.y, config: { duration: 60 } });
            await sleep(delayMs);
            await next({
              x: target.x,
              y: target.y,
              z: 30 + stackIndex * 0.2,
              travelScale: 1.04,
              config: { duration: MOTION.deal.perCard, easing: expoOut },
            });
            await next({
              z: restZ,
              travelScale: 1,
              config: { duration: 150, easing: easeOut },
            });
          },
        });
      },

      // Shuffle travel (PRD §4.4 / DS §6): lift, curved-path reposition
      // (quadratic Bézier, alternating bow), ease-out-back settle.
      shuffleTo: (nextIndex, delayMs) => {
        setCardPhase(project.id, "shuffling");
        const from = { x: pos.x.get(), y: pos.y.get() };
        const to = layout.positions[nextIndex];
        const dist = Math.hypot(to.x - from.x, to.y - from.y);
        const maxDist = Math.hypot(
          layout.positions[0].x - layout.positions[layout.positions.length - 1].x,
          layout.positions[0].y - layout.positions[layout.positions.length - 1].y,
        );
        const travelMs =
          MOTION.shuffle.travelMin +
          (MOTION.shuffle.travelMax - MOTION.shuffle.travelMin) *
            Math.min(1, dist / Math.max(1, maxDist));
        // Control point: perpendicular bow at the midpoint, alternating side.
        const side = nextIndex % 2 === 0 ? 1 : -1;
        const bow = Math.min(90, dist * 0.25) * side;
        const nx = -(to.y - from.y) / Math.max(1, dist);
        const ny = (to.x - from.x) / Math.max(1, dist);
        const cx = (from.x + to.x) / 2 + nx * bow;
        const cy = (from.y + to.y) / 2 + ny * bow;

        posApi.start({
          to: async (next) => {
            await sleep(delayMs);
            await next({
              z: 30 + stackIndex * 0.2,
              travelScale: 1.05,
              config: { duration: MOTION.shuffle.lift, easing: easeOut },
            });
            const start = Date.now();
            while (true) {
              const t = Math.min(1, (Date.now() - start) / travelMs);
              const e = easeInOut(t);
              const omt = 1 - e;
              await next({
                x: omt * omt * from.x + 2 * omt * e * cx + e * e * to.x,
                y: omt * omt * from.y + 2 * omt * e * cy + e * e * to.y,
                immediate: true,
              });
              if (t >= 1) break;
              await sleep(16);
            }
            await next({
              z: restZ,
              travelScale: 1,
              config: { duration: 220, easing: easeOutBack },
            });
            setCardPhase(project.id, "idle");
          },
        });
      },

      // Onboarding-only overhand shuffle: a looping merge<->cut cycle on the
      // same posApi spring deal() drives — cards already spawn at this
      // merged position (see the pos useSpring initializer above), so this
      // loop never needs an entrance tween into place, it just holds then
      // cuts apart and back. X-axis only: y/z/rotZ are never referenced
      // after mount, so they cannot drift. Never touches lib/choreography.ts
      // or deal() — ascendToDeck() below is the explicit bridge between this
      // loop and deal()'s own jitter.
      onboardingShuffleStart: () => {
        onboardingCancelRef.current = false;
        const { deck } = layout;
        const pileSide = stackIndex < cardCount / 2 ? -1 : 1;
        posApi.start({
          to: async (next) => {
            try {
              await sleep(stackIndex * MOTION.onboardingShuffle.loopStagger);
              while (!onboardingCancelRef.current) {
                await sleep(MOTION.onboardingShuffle.holdMerged);
                if (onboardingCancelRef.current) break;
                await next({
                  x: deck.x + pileSide * MOTION.onboardingShuffle.cutOffsetX + shuffleFanX,
                  config: { duration: MOTION.onboardingShuffle.cutDuration, easing: easeInOut },
                });
                await sleep(MOTION.onboardingShuffle.holdCut);
                if (onboardingCancelRef.current) break;
                await next({
                  x: deck.x + shuffleFanX,
                  config: { duration: MOTION.onboardingShuffle.cutDuration, easing: easeInOut },
                });
              }
            } catch {
              // Superseded by ascendToDeck()'s takeover of this same spring — expected.
            }
          },
        });
      },

      onboardingShuffleStop: () => {
        onboardingCancelRef.current = true;
      },

      // Explicit bridge between the onboarding shuffle and the real deal:
      // on click, cards slowly rise (and recombine on X, if mid-cut) from
      // the onboarding rest position to the exact deck position, BEFORE
      // deal()'s jitter/travel plays — see lib/choreography.ts beginDeal(),
      // which waits out this duration before calling dealTable(). Same
      // posApi spring, same pop-free-handoff pattern as every other
      // transition in this file.
      ascendToDeck: (delayMs) => {
        const { deck } = layout;
        posApi.start({
          to: async (next) => {
            try {
              await sleep(delayMs);
              await next({
                x: deck.x,
                y: deck.y,
                z: restZ + stackIndex * 0.2,
                rotZ: 0,
                config: { duration: MOTION.onboardingShuffle.ascendDuration, easing: easeInOut },
              });
            } catch {
              // Superseded by deal()'s takeover of this same spring — expected.
            }
          },
        });
      },

      // Open-reveal gather stage: converge on the open card's grid slot,
      // fanned by rank so a sliver of each card still peeks out (DS §6 —
      // reuses deal's perCard/stagger/expo-out, see MOTION.gather for the
      // fan-stack geometry).
      gather: (openGridIndex, gatherRank, delayMs) => {
        setCardPhase(project.id, "gathering");
        const target = layout.positions[openGridIndex];
        const side = gatherRank % 2 === 0 ? 1 : -1;
        const step = Math.min(gatherRank + 1, MOTION.gather.fanMaxRank);
        const fanX = side * step * MOTION.gather.fanStepPx;
        const fanRotZ = side * step * MOTION.gather.fanAngleStepRad;
        const z = MOTION.gather.stackZBase - gatherRank * MOTION.gather.stackZStep;

        posApi.start({
          to: async (next) => {
            await sleep(delayMs);
            await next({
              x: target.x + fanX,
              y: target.y,
              z,
              rotZ: fanRotZ,
              travelScale: 1,
              config: { duration: MOTION.deal.perCard, easing: expoOut },
            });
            setCardPhase(project.id, "idle");
          },
        });
      },

      // Close-reveal scatter stage: mirrors gather — burst back out to this
      // card's own grid slot.
      scatter: (delayMs) => {
        setCardPhase(project.id, "scattering");
        const idx = useTableStore.getState().cards[project.id].gridIndex;
        const target = layout.positions[idx];
        posApi.start({
          to: async (next) => {
            await sleep(delayMs);
            await next({
              x: target.x,
              y: target.y,
              z: restZ,
              rotZ: 0,
              travelScale: 1,
              config: { duration: MOTION.deal.perCard, easing: expoOut },
            });
            setCardPhase(project.id, "idle");
          },
        });
      },

      // Home <-> About dock-nav transition (lib/choreography.ts): the whole
      // deck slides off to the left, in place (own grid slot minus an
      // offset, not a shared destination like gather), and fades — reusing
      // the same entrance.opacity spring as the one-time page-load fade-in.
      exitOffTable: (delayMs) => {
        setCardPhase(project.id, "offTable");
        const idx = useTableStore.getState().cards[project.id].gridIndex;
        const target = layout.positions[idx];
        posApi.start({
          x: target.x - MOTION.tableNav.cardTranslateX,
          y: target.y,
          delay: delayMs,
          config: { duration: MOTION.tableNav.cardDuration, easing: easeIn },
        });
        entranceApi.start({
          opacity: 0,
          delay: delayMs,
          config: { duration: MOTION.tableNav.cardDuration, easing: easeIn },
        });
      },

      // Reverse of exitOffTable: back to this card's own grid slot, faded in.
      enterFromOffTable: (delayMs) => {
        const idx = useTableStore.getState().cards[project.id].gridIndex;
        const target = layout.positions[idx];
        posApi.start({
          x: target.x,
          y: target.y,
          delay: delayMs,
          config: { duration: MOTION.tableNav.cardDuration, easing: easeOut },
          onRest: () => setCardPhase(project.id, "idle"),
        });
        entranceApi.start({
          opacity: 1,
          delay: delayMs,
          config: { duration: MOTION.tableNav.cardDuration, easing: easeOut },
        });
      },
    });
    return () => {
      cardHandles.delete(project.id);
    };
  }, [
    project.id,
    flipApi,
    posApi,
    pos,
    layout,
    setCardPhase,
    stackIndex,
    restZ,
    frameRect,
    shuffleFanX,
    size.height,
    entranceApi,
  ]);

  // One-time page-load fade-in (front/back faces only, see the JSX below) —
  // unlike the appPhase-keyed effect right after this one, this must fire
  // exactly once at mount and never again, so it isn't keyed on appPhase.
  // Skipped when arriving via the Home <-> About dock-nav transition
  // (startOffTable) — the mount-triggered enterFromOffTable effect below
  // animates opacity itself, with a real duration/stagger; firing this
  // instant (0ms) fade first would leave nothing for that to visibly
  // animate (the spring would already be at 1 by the time it runs).
  useEffect(() => {
    if (startOffTable) return;
    entranceApi.start({
      opacity: 1,
      delay: MOTION.onboarding.cardsFadeInDelay,
      config: { duration: MOTION.onboarding.cardsFadeInDuration, easing: easeOut },
    });
  }, [entranceApi, startOffTable]);

  // Self-triggered entrance for a fresh mount arriving via the Home <->
  // About dock-nav transition — this component now fully unmounts while
  // off Home (PlayArea.tsx), so unlike the exit side (still externally
  // triggered while continuously mounted, see lib/choreography.ts), the
  // enter side can only be decided at mount. Declared after the handle-
  // registration effect above — same-component effect order is
  // guaranteed, so cardHandles already has this card's entry by now.
  useEffect(() => {
    if (!startOffTable) return;
    cardHandles.get(project.id)?.enterFromOffTable(stackIndex * MOTION.tableNav.cardStagger);
    // Mount-only — startOffTable is itself a one-time mount snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drives the onboarding-only dramatic shuffle loop above while the app is
  // gated pre-deal; stops (cooperatively) the moment onboarding ends. The
  // real stop-of-motion happens when deal() takes over the spring (see
  // onboardingShuffleStart), this just stops scheduling further iterations.
  useEffect(() => {
    if (appPhase !== "onboarding") return;
    cardHandles.get(project.id)?.onboardingShuffleStart();
    return () => {
      cardHandles.get(project.id)?.onboardingShuffleStop();
    };
  }, [appPhase, project.id]);

  // Open/close state machine (PRD §4.5): flip → scale → open; closing
  // reverses. The scaled card's on-screen rect matches the reading pane
  // (same math as the DOM overlay via getReadingPane).
  useEffect(() => {
    if (!isOpenCard) return;
    const setOpenPhase = useTableStore.getState().setOpenPhase;

    if (openPhase === "flipping") {
      flipApi.start({
        rot: 0,
        config: { duration: MOTION.flip, easing: flipEase },
        onRest: () => {
          setFaceUp(project.id, true);
          setOpenPhase("gathering");
        },
      });
    } else if (openPhase === "gathering") {
      // Deferred a frame (matches dealTable's rAF pattern): cardHandles
      // registration effects are still flushing for this same commit (pos's
      // identity changes every render, so every card's handle re-registers
      // on every commit) — calling gatherAround synchronously here would
      // read the registry mid-flush and miss most other cards' handles.
      requestAnimationFrame(() => gatherAround(project.id, layout));
    } else if (openPhase === "scattering") {
      requestAnimationFrame(() => scatterFromCenter(project.id, layout));
    } else if (openPhase === "scaling") {
      const pane = getReadingPane(size.width, size.height);
      const scale = pane.width / cardW;
      const targetYAbsolute = size.height / 2 - (pane.top + (cardH * scale) / 2);
      // pos.x/y always target content-local coordinates (pan is applied
      // unconditionally every frame, see the useFrame above) — so the
      // desired true-viewport target is reached by subtracting the pan
      // that's in effect right now. Scroll is locked for the whole open
      // lifecycle (PlayArea.tsx), so this offset stays constant through
      // scaling/open/closing — no discontinuity at either phase boundary.
      const pan = frameRect
        ? contentPanOffset(layout, frameRect, scrollYRef.current, size.width, size.height)
        : { x: 0, y: 0 };
      posApi.start({
        x: 0 - pan.x,
        y: targetYAbsolute - pan.y,
        z: 60,
        travelScale: scale,
        config: { duration: MOTION.scaleOpen, easing: openEase },
        onRest: () => setOpenPhase("open"),
      });
    } else if (openPhase === "closing") {
      const idx = useTableStore.getState().cards[project.id].gridIndex;
      posApi.start({
        x: layout.positions[idx].x,
        y: layout.positions[idx].y,
        z: restZ,
        travelScale: 1,
        config: { duration: MOTION.close, easing: easeIn },
        onRest: () => setOpenPhase("scattering"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpenCard, openPhase]);

  const isInteractive = () => {
    const s = useTableStore.getState();
    const p = s.cards[project.id].phase;
    return (
      s.dealComplete &&
      s.openCardId === null &&
      (p === "idle" || p === "hovered" || p === "peeking")
    );
  };

  // Tell mechanic (PRD §4.7): hover-hold on a covered card cracks it open a
  // few degrees — purely geometric, no color change, flagship included.
  const peekTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPeek = () => {
    if (peekTimer.current) {
      clearTimeout(peekTimer.current);
      peekTimer.current = null;
    }
    const s = useTableStore.getState();
    if (s.cards[project.id].phase === "peeking") {
      flipApi.start({
        rot: Math.PI,
        config: { duration: MOTION.peek.out, easing: easeIn },
      });
      setCardPhase(project.id, "hovered");
    }
  };

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    if (!isInteractive()) return;
    setCardPhase(project.id, "hovered");
    document.body.style.cursor = "pointer";
    hoverApi.start({
      lift: MOTION.hover.liftPx,
      hScale: MOTION.hover.scale,
      glow: project.isFlagship ? 0.22 : 0.16,
      config: { duration: MOTION.hover.in, easing: easeOut },
    });
    const s = useTableStore.getState();
    if (!s.cards[project.id].faceUp && !peekTimer.current) {
      peekTimer.current = setTimeout(() => {
        peekTimer.current = null;
        const now = useTableStore.getState();
        const card = now.cards[project.id];
        if (now.openCardId !== null || card.faceUp || card.phase !== "hovered")
          return;
        setCardPhase(project.id, "peeking");
        flipApi.start({
          rot: Math.PI - MOTION.peek.angleRad,
          config: { duration: MOTION.peek.in, easing: easeOut },
        });
      }, MOTION.peek.holdThreshold);
    }
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "";
    cancelPeek();
    const s = useTableStore.getState();
    if (s.cards[project.id].phase === "hovered") {
      setCardPhase(project.id, "idle");
    }
    hoverApi.start({
      lift: 0,
      hScale: 1,
      glow: 0,
      config: { duration: MOTION.hover.out, easing: easeInOut },
    });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!isInteractive()) return;
    if (peekTimer.current) {
      clearTimeout(peekTimer.current);
      peekTimer.current = null;
    }
    document.body.style.cursor = "";
    hoverApi.start({ lift: 0, hScale: 1, glow: 0, immediate: true });
    useTableStore.getState().openCard(project.id);
  };

  // Content-local → world-space pan, applied unconditionally every frame
  // regardless of open/rest phase. Position springs (deal/shuffle/rest, and
  // the open-card scale target) always target content-local coordinates —
  // see the "scaling" branch above, which subtracts the pan at the moment
  // it fires rather than special-casing this useFrame — so pan never has to
  // jump discretely at a phase boundary.
  useFrame(() => {
    const g = panRef.current;
    if (!g || !frameRect) return;
    const { x, y } = contentPanOffset(
      layout,
      frameRect,
      scrollYRef.current,
      size.width,
      size.height,
    );
    g.position.set(x, y, 0);
  });

  // Per-frame composite: idle bob (sine × amp) + hover state drive the bob
  // group and the shadow. useFrame is the sole writer for these objects, so
  // springs and frame math never fight over the same property.
  const bobGroupRef = useRef<THREE.Group>(null);
  const shadowRef = useRef<THREE.Mesh>(null);
  const shadowMatRef = useRef<THREE.MeshBasicMaterial>(null);
  const flagshipGlowMatRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame((state) => {
    const bobGroup = bobGroupRef.current;
    const shadow = shadowRef.current;
    const shadowMat = shadowMatRef.current;
    if (!bobGroup || !shadow || !shadowMat) return;

    const tSec = state.clock.elapsedTime;

    // Ambient flagship glow: a slow, always-on sine breathe — independent of
    // hover/bob/face state, sits behind the card so it reads the same on
    // either side. Kept separate from the hover-glow mesh/spring below
    // (additive layer) rather than folding into it, since one is ambient
    // and the other interactive — conflating them would make the hover
    // boost's resting baseline depend on where the ambient pulse happened
    // to be in its cycle.
    if (flagshipGlowMatRef.current) {
      const { period, minOpacity, maxOpacity } = MOTION.flagshipGlow;
      const glowWave = Math.sin((tSec * 1000 * Math.PI * 2) / period) * 0.5 + 0.5;
      flagshipGlowMatRef.current.opacity =
        minOpacity + glowWave * (maxOpacity - minOpacity);
    }
    const wave =
      Math.sin((tSec * 1000 * Math.PI * 2) / bobSeed.period + bobSeed.phase0) *
        0.5 +
      0.5;
    const bobVal = wave * bob.amp.get();
    const liftT = hover.lift.get() / MOTION.hover.liftPx;

    bobGroup.position.y = bobVal * 3;
    const pulse = 1 + bobVal * MOTION.idleBob.scalePulse;
    bobGroup.scale.setScalar(pulse);

    // Elevation: rest → bob-peak by the sine, then → hover by the lift.
    const base = lerpRow(ELEVATION.rest, ELEVATION.bobPeak, bobVal);
    const row = lerpRow(base, ELEVATION.hover, liftT);
    shadow.position.x = row.offsetX;
    shadow.position.y = -row.offsetY + bobGroup.position.y;
    const spread = 1 + (row.blur - ELEVATION.rest.blur) * 0.012;
    shadow.scale.set(spread, spread, 1);
    shadowMat.opacity = row.opacity;
  });

  if (!textures) return null;

  // Hidden only for scaling/open/closing: the canvas's clip-path (which
  // normally confines resting cards to the play-area frame) only needs to
  // lift for that narrower window, once the open card is escaping past the
  // frame into its true-viewport reading position — a single WebGL canvas
  // can't clip one mesh and not others via CSS, so every other card would
  // otherwise bleed past the frame's border for that duration. During
  // flipping/gathering/scattering every card (including this one) stays
  // within the frame, so hiding isn't needed — by the time this DOES hide
  // them, they've already gathered into a fanned stack fully occluded
  // behind the open card, so the hide itself is imperceptible.
  const othersHidden =
    anyCardOpen &&
    (openPhase === "scaling" || openPhase === "open" || openPhase === "closing");

  return (
    <group ref={panRef} visible={isOpenCard || !othersHidden}>
      <animated.group
        position-x={pos.x}
        position-y={pos.y}
        position-z={pos.z}
        rotation-z={pos.rotZ}
        scale={pos.travelScale}
      >
        <mesh ref={shadowRef} position-z={-2}>
          <planeGeometry
            args={[cardW * (1 + SHADOW_PAD), cardH * (1 + SHADOW_PAD)]}
          />
          <meshBasicMaterial
            ref={shadowMatRef}
            map={shadowTexture}
            transparent
            opacity={ELEVATION.rest.opacity}
            depthWrite={false}
          />
        </mesh>
        {/* Hover glow — white for normal cards, gold for the flagship (DS §1.6/§1.7) */}
        <animated.mesh position-z={-1} scale={hover.hScale}>
          <planeGeometry
            args={[cardW * (1 + SHADOW_PAD), cardH * (1 + SHADOW_PAD)]}
          />
          <AnimatedMeshBasicMaterial
            map={glowTexture}
            color={project.isFlagship ? COLORS.flagshipGold : "#FFFFFF"}
            transparent
            opacity={hover.glow}
            depthWrite={false}
          />
        </animated.mesh>
        {/* Ambient flagship glow — always-on soft gold pulse, independent of
            hover/face state (PRD §4.7 "dealer's choice", DS §1.7). Sits
            outside the flip-rotation subtree like the hover glow above, so
            it reads identically whichever side of the card is showing. */}
        {project.isFlagship && (
          <mesh position-z={-1.1}>
            <planeGeometry
              args={[
                cardW * (1 + FLAGSHIP_GLOW_PAD),
                cardH * (1 + FLAGSHIP_GLOW_PAD),
              ]}
            />
            <meshBasicMaterial
              ref={flagshipGlowMatRef}
              map={glowTexture}
              color={COLORS.flagshipGold}
              transparent
              opacity={MOTION.flagshipGlow.minOpacity}
              depthWrite={false}
            />
          </mesh>
        )}
        <group ref={bobGroupRef}>
          <animated.group
            rotation-y={flip.rot}
            position-z={hover.lift}
            scale={hover.hScale}
            onPointerOver={handleOver}
            onPointerOut={handleOut}
            onClick={handleClick}
          >
            <mesh position-z={0.4}>
              <planeGeometry args={[cardW, cardH]} />
              <AnimatedMeshBasicMaterial
                map={textures.front}
                transparent
                opacity={entrance.opacity}
              />
            </mesh>
            <mesh position-z={-0.4} rotation-y={Math.PI}>
              <planeGeometry args={[cardW, cardH]} />
              <AnimatedMeshBasicMaterial
                map={textures.back}
                transparent
                opacity={entrance.opacity}
              />
            </mesh>
          </animated.group>
        </group>
      </animated.group>
    </group>
  );
}
