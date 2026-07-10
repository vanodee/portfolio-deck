"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useTableStore } from "@/store/useTableStore";
import type { FrameRect, TableLayout } from "@/lib/layout";
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
        touchY.current = e.touches[0]?.clientY ?? null;
      }}
      onTouchMove={(e) => {
        if (!scrollEnabled || touchY.current == null) return;
        const y = e.touches[0]?.clientY;
        if (y == null) return;
        onScrollForward(touchY.current - y, true);
        touchY.current = y;
      }}
      onTouchEnd={() => {
        touchY.current = null;
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
