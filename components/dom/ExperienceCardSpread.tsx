import type { ExperienceCardData } from "@/data/types";
import { MOTION } from "@/lib/motion";
import ExperienceCard from "./ExperienceCard";
import styles from "./ExperienceCardSpread.module.css";

const MAX_CARDS = 4;
const CARD_W = 214;
const CARD_H = 300;

// Static, non-interactive fan — capped at 4 (most recent roles only, per
// the prompt: older history lives on the resume). Array-driven — reuses
// EXPERIENCE.map, not fixed JSX instances. Offset math is new/dedicated to
// this component (MOTION.experienceFan), not a reuse of MOTION.gather's
// peeking-stack fan constants (those are tuned for a different purpose and
// signed off elsewhere — see PRD §4.5). The horizontal step is sized so
// every card's centered text block stays fully unobstructed at any rank.
export default function ExperienceCardSpread({
  experiences,
}: {
  experiences: ExperienceCardData[];
}) {
  const cards = experiences.slice(0, MAX_CARDS);
  const { xStepPx, rotationStepDeg, liftPx } = MOTION.experienceFan;
  const maxT = Math.max(cards.length - 1, 0) / 2;
  const wrapWidth = CARD_W + Math.max(cards.length - 1, 0) * xStepPx;
  const wrapHeight = CARD_H + maxT * liftPx;

  return (
    <div className={styles.spread} style={{ width: wrapWidth, height: wrapHeight }}>
      {cards.map((experience, index) => {
        const t = index - (cards.length - 1) / 2;
        const x = t * xStepPx;
        // Bow shape: center cards ride highest (y=0), outer cards dip lower
        // as |t| grows — mirrors a hand-fan pivoting below the spread.
        const y = Math.abs(t) * liftPx;
        const rotate = t * rotationStepDeg;
        return (
          <div
            key={experience.id}
            className={styles.slot}
            style={{
              left: `calc(50% + ${x}px - ${CARD_W / 2}px)`,
              top: y,
              transform: `rotate(${rotate}deg)`,
              zIndex: index,
            }}
          >
            <ExperienceCard experience={experience} />
          </div>
        );
      })}
    </div>
  );
}
