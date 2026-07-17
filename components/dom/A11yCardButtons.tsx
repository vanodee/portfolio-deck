"use client";

import { worldToContentRect, type TableLayout } from "@/lib/layout";
import { useTableStore } from "@/store/useTableStore";
import styles from "./A11yCardButtons.module.css";

interface A11yCardButtonsProps {
  layout: TableLayout;
}

// PRD §8 baseline accessibility: one focusable DOM button per card, synced
// to its screen position. Real children of the play area's native scroll
// proxy (position: absolute in content-local coordinates), so the browser
// scrolls them for free and Tab-focusing an off-screen card auto-scrolls it
// into view — no viewport or scroll-offset math needed here at all. The
// wrapper div is sized to the full content height, doubling as the
// scrollport's spacer so its scrollbar reflects the true scroll range.
export default function A11yCardButtons({ layout }: A11yCardButtonsProps) {
  const projects = useTableStore((s) => s.projects);
  const cards = useTableStore((s) => s.cards);
  const dealComplete = useTableStore((s) => s.dealComplete);
  const openCardId = useTableStore((s) => s.openCardId);
  const openCard = useTableStore((s) => s.openCard);

  // Tab order follows the grid, not the data array.
  const ordered = projects.map((p) => ({
    project: p,
    gridIndex: cards[p.id].gridIndex,
  })).sort((a, b) => a.gridIndex - b.gridIndex);

  return (
    <div
      aria-hidden={openCardId !== null}
      style={{ position: "relative", width: "100%", height: layout.contentHeight }}
    >
      {ordered.map(({ project, gridIndex }) => {
        const rect = worldToContentRect(layout, layout.positions[gridIndex]);
        return (
          <button
            key={project.id}
            type="button"
            className={styles.button}
            style={rect}
            onClick={() => openCard(project.id)}
            disabled={!dealComplete || openCardId !== null}
            aria-label={`Open project: ${project.title}`}
          />
        );
      })}
    </div>
  );
}
