import type { ExperienceCardData } from "@/data/types";
import styles from "./ExperienceCard.module.css";

const CORNER_MARK_SRC = "/assets/icons/card-corner-mark.png";

interface ExperienceCardProps {
  experience: ExperienceCardData;
  /** Stronger, more downward-offset shadow — ExperienceCardSpread.tsx's
   * mobile peek-stack, where cards sit directly on top of one another, uses
   * this so each one visibly casts onto the card beneath it (the fan's own
   * overlap + rotation already reads as stacked without it). */
  elevated?: boolean;
}

// Always face-up, non-interactive — no flip state, unlike the WebGL project
// cards or PhotoCard's click-cycle.
export default function ExperienceCard({ experience, elevated = false }: ExperienceCardProps) {
  return (
    <div className={`${styles.card} ${elevated ? styles.elevated : ""}`}>
      <img className={styles.cornerMarkTL} src={CORNER_MARK_SRC} alt="" />
      <img className={styles.cornerMarkBR} src={CORNER_MARK_SRC} alt="" />
      <div className={styles.content}>
        <div className={styles.text}>
          <p className={styles.dateRange}>{experience.yearRange}</p>
          <p className={styles.title}>{experience.title}</p>
          <p className={styles.company}>{experience.company}</p>
        </div>
      </div>
    </div>
  );
}
