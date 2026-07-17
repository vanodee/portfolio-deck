"use client";

import type { RefObject } from "react";
import { useEffect } from "react";
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
  const projects = useTableStore((s) => s.projects);

  useEffect(() => {
    if (projects.length === 0) return;
    armFontBackstop(projects);
    // Warms the texture cache ahead of time, so the deck never appears
    // half-loaded mid-animation once it's clicked. The deal itself no longer
    // fires automatically here — it's gated behind the onboarding screen's
    // click (see DeckClickCatcher -> lib/choreography.ts beginDeal), which
    // gives this ample time to resolve before it's ever needed.
    Promise.all(projects.flatMap((p) => [getBackTexture(p), getFrontTexture(p)]));
  }, [projects]);

  return (
    <>
      {projects.map((project, i) => (
        <Card
          key={project.id}
          project={project}
          layout={layout}
          stackIndex={i}
          cardCount={projects.length}
          frameRect={frameRect}
          scrollYRef={scrollYRef}
        />
      ))}
      {appPhase === "onboarding" && projects.length > 0 && (
        <DeckClickCatcher layout={layout} frameRect={frameRect} scrollYRef={scrollYRef} />
      )}
    </>
  );
}
