"use client";

import { useTableStore, TOTAL_CARDS } from "@/store/useTableStore";
import styles from "./ChipStackTracker.module.css";

// PRD §4.7 — session tracker: opened-card count vs. total, as gentle
// progress feedback rather than a score.
export default function ChipStackTracker() {
  const opened = useTableStore((s) => s.openedCardIds.size);

  return (
    <div
      className={styles.tracker}
      aria-label={`${opened} of ${TOTAL_CARDS} cards opened`}
    >
      <div className={styles.chips} aria-hidden="true">
        <span className={styles.chip} />
        <span className={styles.chip} />
        <span className={styles.chip} />
      </div>
      <span>
        {opened} / {TOTAL_CARDS}
      </span>
    </div>
  );
}
