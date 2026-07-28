"use client";

import { onboardingRestY, type FrameRect, type TableLayout } from "@/lib/layout";
import { MOTION } from "@/lib/motion";
import { beginDeal } from "@/lib/choreography";
import styles from "./DeckA11yButton.module.css";

interface DeckA11yButtonProps {
  layout: TableLayout;
  frameRect: FrameRect | null;
}

// Onboarding-only keyboard/AT equivalent of DeckClickCatcher.tsx's R3F hit
// mesh — same "pointer input goes to the canvas, this exists for Tab/AT"
// pattern A11yCardButtons.tsx already uses for dealt cards. Sized to the
// same oversized shuffle-travel hit box DeckClickCatcher itself uses (not
// just the card's own footprint), so the whole visibly-moving stack reads
// as one focusable target. The wrapper is absolutely positioned to fill
// .scrollProxy's own visible box rather than sized to the full scrollable
// content height like A11yCardButtons' — onboardingRestY's Y is already
// independent of contentHeight/scroll by construction (its contentHeight
// terms cancel out), so this avoids adding phantom scrollable space during
// the one phase native keyboard scroll (via focus) could otherwise reach it.
export default function DeckA11yButton({ layout, frameRect }: DeckA11yButtonProps) {
  const { cardW, cardH, deck, contentWidth, contentHeight } = layout;
  const shuffleCutOffsetX = cardW * MOTION.onboardingShuffle.cutOffsetXRatio;
  const shuffleFanAmpX = cardW * MOTION.onboardingShuffle.fanAmpXRatio;
  const hitW = cardW + 2 * (shuffleCutOffsetX + shuffleFanAmpX + 20);
  const hitH = cardH + 40;
  const restY = frameRect ? onboardingRestY(layout, frameRect, window.innerHeight) : deck.y;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <button
        type="button"
        className={styles.button}
        style={{
          left: contentWidth / 2 + deck.x - hitW / 2,
          top: contentHeight / 2 - restY - hitH / 2,
          width: hitW,
          height: hitH,
        }}
        onClick={beginDeal}
        aria-label="Deal cards and enter the table"
      />
    </div>
  );
}
