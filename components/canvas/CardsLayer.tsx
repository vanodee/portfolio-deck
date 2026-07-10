"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
import { PROJECTS } from "@/data/projects";
import {
  armFontBackstop,
  getBackTexture,
  getFrontTexture,
} from "@/lib/textures/textureCache";
import type { FrameRect, TableLayout } from "@/lib/layout";
import { useTableStore } from "@/store/useTableStore";
import Card from "./Card";
import DeckClickCatcher from "./DeckClickCatcher";

interface CardsLayerProps {
  layout: TableLayout;
  frameRect: FrameRect | null;
  scrollYRef: RefObject<number>;
}

export default function CardsLayer({ layout, frameRect, scrollYRef }: CardsLayerProps) {
  const appPhase = useTableStore((s) => s.appPhase);

  useEffect(() => {
    armFontBackstop(PROJECTS);
    // Warms the texture cache ahead of time, so the deck never appears
    // half-loaded mid-animation once it's clicked. The deal itself no longer
    // fires automatically here — it's gated behind the onboarding screen's
    // click (see DeckClickCatcher -> lib/choreography.ts beginDeal), which
    // gives this ample time to resolve before it's ever needed.
    Promise.all(PROJECTS.flatMap((p) => [getBackTexture(p), getFrontTexture(p)]));
  }, []);

  return (
    <>
      {PROJECTS.map((project, i) => (
        <Card
          key={project.id}
          project={project}
          layout={layout}
          stackIndex={i}
          frameRect={frameRect}
          scrollYRef={scrollYRef}
        />
      ))}
      {appPhase === "onboarding" && (
        <DeckClickCatcher layout={layout} frameRect={frameRect} scrollYRef={scrollYRef} />
      )}
    </>
  );
}
