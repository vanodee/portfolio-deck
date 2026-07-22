"use client";

import {
  useEffect,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import styles from "./ControlDock.module.css";

// Row entrance/exit: not useSectionReveal (the About page's hook) — that's
// purpose-built for a one-time, viewport-triggered reveal with no built-in
// reverse. This menu needs a real open/close toggle, so it reuses the same
// staggerChildren + staggerDirection idiom lib/dockChoreography.ts's
// dockGroupVariants + ControlDock.tsx's groupVariants already establish
// (plain `animate` target switching, no AnimatePresence) rather than
// AnimatePresence's automatic nested-exit propagation, which needs to track
// every row's own staggered exit through a parent with no animatable
// properties of its own and proved unreliable (menu never finished
// unmounting in testing). Timed off MOTION.categoryFilter's dedicated
// menuRowDuration/menuRowStagger — deliberately its own, faster timing
// rather than reusing aboutSectionReveal (a popover should snap open/closed
// quicker than a page-load reveal) — staggerChildren = duration + stagger
// reproduces delay_i = i * (duration + stagger), same recipe, just
// compressed, and fade-only (no translateY).
const rowInterval =
  (MOTION.categoryFilter.menuRowDuration + MOTION.categoryFilter.menuRowStagger) / 1000;

// staggerDirection: -1 on the "show" transition itself (rather than
// reordering which child animates first via array/DOM order) left every row
// stuck at opacity 0 in testing, so direction is only ever applied on the
// "hidden" (close) transition here. To still deal in starting from the row
// closest to the dock, the rows array is reversed before render (closest =
// DOM index 0) and the container uses flex-direction: column-reverse
// (ControlDock.module.css) so the visual order — furthest at the top,
// closest just above the dock — stays correct despite the reversed DOM
// order. staggerDirection: -1 on close then starts from the LAST DOM child,
// i.e. the furthest/top row, playing the open sequence in reverse.
const menuVariants = {
  hidden: { transition: { staggerChildren: rowInterval, staggerDirection: -1 as const } },
  show: { transition: { staggerChildren: rowInterval } },
};

const rowVariants = {
  hidden: { opacity: 0, scale: MOTION.categoryFilter.menuRowRestScale },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: MOTION.categoryFilter.menuRowDuration / 1000, ease: "easeOut" as const },
  },
};

// Must match .categoryMenuRow's own left padding + half the count circle's
// diameter (ControlDock.module.css) — the offset from a row's left edge to
// its circle's center, used to align that center with the dock button's.
const ROW_CIRCLE_CENTER_OFFSET = 5 + 16;

// Same 12px as .categoryMenu's own row gap (ControlDock.module.css) — kept
// here too since the dock-to-menu gap is measured in JS, not just CSS.
const MENU_DOCK_GAP = 12;

interface CategoryFilterMenuProps {
  anchorRef: RefObject<HTMLButtonElement | null>;
  dockRef: RefObject<HTMLElement | null>;
}

// Anchored above ControlDock, left-aligned on desktop so each row's count
// circle sits in the same vertical line as the dock's own filter button
// (measured off anchorRef, not hardcoded — the dock's own width is
// responsive). Falls back to centered under the dock on mobile, where the
// dock itself restacks to a single column and per-button alignment doesn't
// apply the same way. Vertical position is always measured off dockRef
// (the dock nav's own rect) rather than hardcoded, since the dock's
// rendered height varies with breakpoint (a fixed 45px-tall button row on
// desktop vs. a variable-height stacked layout — logo + two button rows —
// below 767px) — a hardcoded offset that matched desktop would place the
// menu inside/behind the mobile dock instead of above it.
export default function CategoryFilterMenu({ anchorRef, dockRef }: CategoryFilterMenuProps) {
  const { rows, activeCategory, categoryMenuOpen, closeCategoryMenu, handleSelect } =
    useCategoryFilter();
  const breakpoint = useBreakpoint();

  const [left, setLeft] = useState<number | null>(null);
  const [bottom, setBottom] = useState<number | null>(null);
  // Layout effect (not a plain effect) so the measured position lands
  // before paint — rows still start at opacity 0 either way (variants
  // below), but the container's own position shouldn't visibly jump.
  useLayoutEffect(() => {
    if (!categoryMenuOpen) return;
    const update = () => {
      const dockRect = dockRef.current?.getBoundingClientRect();
      if (dockRect) setBottom(window.innerHeight - dockRect.top + MENU_DOCK_GAP);
      if (breakpoint === "desktop") {
        const rect = anchorRef.current?.getBoundingClientRect();
        if (rect) setLeft(rect.left + rect.width / 2 - ROW_CIRCLE_CENTER_OFFSET);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [categoryMenuOpen, breakpoint, anchorRef, dockRef]);

  // Stays mounted through its own reverse-stagger close animation — a plain
  // setTimeout matching the total stagger duration, decoupled from Framer's
  // nested-exit completion tracking (see the comment above). The open-side
  // transition adjusts state during render (React's documented pattern,
  // same idiom ControlDock.tsx's own settled/checked/navBusy use) rather
  // than an effect, since it needs to happen synchronously, before paint.
  const [rendered, setRendered] = useState(false);
  const [lastOpen, setLastOpen] = useState(categoryMenuOpen);
  if (categoryMenuOpen !== lastOpen) {
    setLastOpen(categoryMenuOpen);
    if (categoryMenuOpen) setRendered(true);
  }

  useEffect(() => {
    if (categoryMenuOpen || !rendered) return;
    const totalExitMs = rows.length * rowInterval * 1000;
    const t = setTimeout(() => setRendered(false), totalExitMs);
    return () => clearTimeout(t);
  }, [categoryMenuOpen, rendered, rows.length]);

  useEffect(() => {
    if (!categoryMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCategoryMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [categoryMenuOpen, closeCategoryMenu]);

  if (!rendered) return null;

  const desktopLeft = breakpoint === "desktop" && left !== null;
  const menuStyle: CSSProperties = {};
  if (bottom !== null) menuStyle.bottom = bottom;
  if (desktopLeft) {
    menuStyle.left = left as number;
    menuStyle.transform = "none";
  }

  return (
    <>
      <div className={styles.categoryMenuBackdrop} onClick={closeCategoryMenu} />
      <motion.div
        className={styles.categoryMenu}
        style={menuStyle}
        variants={menuVariants}
        initial="hidden"
        animate={categoryMenuOpen ? "show" : "hidden"}
      >
        {[...rows].reverse().map((row) => {
          const isActiveRow = row.value === activeCategory;
          return (
            <motion.button
              key={row.value ?? "all"}
              type="button"
              variants={rowVariants}
              className={`${styles.categoryMenuRow} ${isActiveRow ? styles.buttonActive : ""}`}
              onClick={() => handleSelect(row.value)}
              aria-pressed={isActiveRow}
            >
              <span className={styles.categoryMenuRowCircle}>{row.count}</span>
              <span className={styles.categoryMenuRowLabel}>{row.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    </>
  );
}
