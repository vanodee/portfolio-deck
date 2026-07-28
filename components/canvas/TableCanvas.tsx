"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useTableStore } from "@/store/useTableStore";
import type { FrameRect, TableLayout } from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import CardsLayer from "./CardsLayer";

// Stays full-viewport forever — the WebGL camera's origin is the true
// viewport center, which the open-card animation (Card.tsx) relies on to
// hand off cleanly to the viewport-grounded OpenCardOverlay. Visual
// confinement to the play-area frame is a CSS clip-path, not a resize, so
// it can be lifted while a card is escaping to its reading-view position.
function frameRectToClipPath(frameRect: FrameRect | null): string {
  if (!frameRect) return "none";
  const { left, top, width, height } = frameRect;
  const right = left + width;
  const bottom = top + height;
  return `inset(${top}px calc(100% - ${right}px) calc(100% - ${bottom}px) ${left}px round 2px)`;
}

interface TableCanvasProps {
  layout: TableLayout;
  frameRect: FrameRect | null;
  scrollYRef: RefObject<number>;
  /** immediate=true (touch-drag) applies with no easing lag — 1:1 finger
   * tracking; immediate=false (wheel) eases toward the new target instead
   * of jumping, since raw wheel deltas are large/discrete. */
  onScrollForward: (deltaY: number, immediate: boolean) => void;
}

export default function TableCanvas({
  layout,
  frameRect,
  scrollYRef,
  onScrollForward,
}: TableCanvasProps) {
  // PRD §8 — canvas pointer events off while a card is open, so scrolling
  // the reading view never fights table interactions underneath.
  const anyCardOpen = useTableStore((s) => s.openCardId !== null);
  // Scroll forwarding stays off through onboarding + dealing (see
  // PlayArea.tsx's matching scrollDisabled) — cards aren't at their final
  // grid positions yet, so there's nothing meaningful to scroll to.
  const scrollEnabled = useTableStore((s) => s.dealComplete);
  // The clip-path only needs to lift for the narrower window where the open
  // card is actually escaping past the frame — during flipping/gathering/
  // scattering every card (including the open one) stays within the frame's
  // grid bounds, so clipping can stay engaged there without visible cost.
  const openPhase = useTableStore((s) => s.openPhase);
  const clipLifted =
    openPhase === "scaling" || openPhase === "open" || openPhase === "closing";
  // The canvas sits on top of the scroll proxy for pointer purposes (so
  // card hover/click work), which means it also intercepts the touch
  // gestures a mobile scrollport would normally receive directly — forward
  // both wheel (desktop/trackpad) and touch-drag (mobile) deltas manually.
  const touchY = useRef<number | null>(null);
  // Fling momentum (touch only — wheel already glides via PlayArea.tsx's
  // SCROLL_EASE). touchAction: "none" below opts this element out of any
  // native touch-scroll physics, so without this, releasing a drag stopped
  // dead instead of coasting like About's native `overflow-y` region does.
  // velocityRef carries the same sign/units as onScrollForward's deltaY
  // (px per touchmove), just expressed per-ms so it decays smoothly
  // regardless of frame rate.
  const touchVelocityRef = useRef(0); // px/ms, EMA-smoothed across touchmove samples
  const lastTouchTimeRef = useRef(0);
  const momentumRafRef = useRef<number | null>(null);

  const stopMomentum = () => {
    if (momentumRafRef.current != null) {
      cancelAnimationFrame(momentumRafRef.current);
      momentumRafRef.current = null;
    }
  };

  // Treats momentum as synthetic continued touchmove input: each frame
  // forwards a decaying delta through the exact same onScrollForward(...,
  // true) path a real finger would, so it can't drift out of sync with
  // PlayArea.tsx's own clamping/rail-sync logic. Stops on hitting a scroll
  // bound (scrollYRef doesn't move despite a nonzero request), on velocity
  // decaying below the stop threshold, or if a card opens/dealing isn't
  // complete (fresh store read — same race PlayArea.tsx's handleScrollForward
  // guards against).
  const startMomentum = () => {
    const { minFlingVelocity, stopVelocity, decayPerMs } = MOTION.homeScrollMomentum;
    let velocity = touchVelocityRef.current;
    if (Math.abs(velocity) < minFlingVelocity) return;
    let lastTime = performance.now();
    const step = () => {
      const s = useTableStore.getState();
      if (s.openCardId !== null || !s.dealComplete) {
        momentumRafRef.current = null;
        return;
      }
      const now = performance.now();
      const dt = now - lastTime;
      lastTime = now;
      const requested = velocity * dt;
      const before = scrollYRef.current;
      onScrollForward(requested, true);
      const moved = Math.abs(scrollYRef.current - before);
      velocity *= Math.pow(decayPerMs, dt);
      const hitBound = moved < 0.01 && Math.abs(requested) > 0.5;
      if (hitBound || Math.abs(velocity) < stopVelocity) {
        momentumRafRef.current = null;
        return;
      }
      momentumRafRef.current = requestAnimationFrame(step);
    };
    momentumRafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => stopMomentum, []);

  // Proves the dynamically-imported chunk (PlayArea.tsx) has actually
  // mounted, not just fetched — OnboardingScreen's "Tap the deck to deal
  // yourself in" gates on this so it never invites a click DeckClickCatcher
  // (a child of CardsLayer below) isn't yet in the tree to receive.
  useEffect(() => {
    useTableStore.getState().markCanvasReady();
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: anyCardOpen ? "none" : "auto",
        clipPath: clipLifted ? "none" : frameRectToClipPath(frameRect),
        touchAction: "none",
      }}
      onWheel={(e) => {
        if (!scrollEnabled) return;
        onScrollForward(e.deltaY, false);
      }}
      onTouchStart={(e) => {
        stopMomentum(); // a new touch interrupts any fling still coasting
        touchY.current = e.touches[0]?.clientY ?? null;
        touchVelocityRef.current = 0;
        lastTouchTimeRef.current = e.timeStamp;
      }}
      onTouchMove={(e) => {
        if (!scrollEnabled || touchY.current == null) return;
        const y = e.touches[0]?.clientY;
        if (y == null) return;
        const deltaY = touchY.current - y;
        const dt = e.timeStamp - lastTouchTimeRef.current;
        if (dt > 0) {
          // EMA, not the raw last-sample velocity — a finger often
          // decelerates for a frame right before lifting, which would read
          // as "no fling intended" even mid-flick if taken literally.
          touchVelocityRef.current = touchVelocityRef.current * 0.5 + (deltaY / dt) * 0.5;
        }
        lastTouchTimeRef.current = e.timeStamp;
        onScrollForward(deltaY, true);
        touchY.current = y;
      }}
      onTouchEnd={() => {
        touchY.current = null;
        startMomentum();
      }}
    >
      <Canvas
        orthographic
        // 1 world unit = 1 CSS px; +Y up, origin at viewport center.
        camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 4000 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        flat
      >
        <CardsLayer layout={layout} frameRect={frameRect} scrollYRef={scrollYRef} />
      </Canvas>
    </div>
  );
}
