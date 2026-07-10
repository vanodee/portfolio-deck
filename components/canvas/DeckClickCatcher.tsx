"use client";

import type { RefObject } from "react";
import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import {
  contentPanOffset,
  onboardingRestY,
  type FrameRect,
  type TableLayout,
} from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import { beginDeal } from "@/lib/choreography";

interface DeckClickCatcherProps {
  layout: TableLayout;
  frameRect: FrameRect | null;
  scrollYRef: RefObject<number>;
}

// Onboarding-only: an invisible hit-target sized to comfortably cover the
// overhand-shuffle's X-axis travel at the onboarding rest position (below
// the real deck position — see lib/layout.ts's onboardingRestY), so the
// whole visibly-moving stack is clickable rather than just a card-sized
// box. Deliberately separate from each Card's own isInteractive()/click
// handling (Card.tsx), which stays scoped to post-deal table interactions.
export default function DeckClickCatcher({
  layout,
  frameRect,
  scrollYRef,
}: DeckClickCatcherProps) {
  const { size } = useThree();
  const panRef = useRef<THREE.Group>(null);
  const { cardW, cardH, deck } = layout;
  const hitW =
    cardW + 2 * (MOTION.onboardingShuffle.cutOffsetX + MOTION.onboardingShuffle.fanAmpX + 20);
  const hitH = cardH + 40; // Y is static during onboarding — just click padding
  const restY = frameRect ? onboardingRestY(layout, frameRect, size.height) : deck.y;

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

  const handleOver = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "pointer";
  };

  const handleOut = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "";
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    document.body.style.cursor = "";
    beginDeal();
  };

  return (
    <group ref={panRef}>
      <mesh
        position={[deck.x, restY, 100]}
        onPointerOver={handleOver}
        onPointerOut={handleOut}
        onClick={handleClick}
      >
        <planeGeometry args={[hitW, hitH]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}
