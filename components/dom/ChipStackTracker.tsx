"use client";

import { useTableStore } from "@/store/useTableStore";
import styles from "./ChipStackTracker.module.css";

// PRD §4.7 — session tracker: opened-card count vs. total, as gentle
// progress feedback rather than a score.
export default function ChipStackTracker() {
  const opened = useTableStore((s) => s.openedCardIds.size);
  const total = useTableStore((s) => s.cardOrder.length);

  return (
    <div
      className={styles.tracker}
      aria-label={`${opened} of ${total} cards opened`}
    >
      <div className={styles.chips} aria-hidden="true">
        <span className={styles.chip} />
        <span className={styles.chip} />
        <span className={styles.chip} />
      </div>
      <span>
        {opened} / {total}
      </span>
    </div>
  );
}
