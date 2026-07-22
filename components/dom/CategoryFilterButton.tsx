import { forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MOTION } from "@/lib/motion";
import styles from "./ControlDock.module.css";

interface CategoryFilterButtonProps {
  count: number;
  activeCategory: string | null;
  categoryMenuOpen: boolean;
  disabled?: boolean;
  onClick: () => void;
}

// Left-most dock button (ControlDock.tsx) — same 45px glass circle as
// DockButton, but its content is a live count rather than an icon, so it
// can't reuse that component (DockButton hard-requires an `icon` image
// path). `.buttonActive` (verbatim, DS §3.3) applies whenever a filter is
// set, independent of whether the menu itself is currently open. Forwards
// its ref so CategoryFilterMenu can measure this button's on-screen
// position and align the popover's rows to it.
//
// Content swaps between the live count and a close (X) icon while the menu
// is open, so the button also reads as the menu's own open/close affordance
// rather than looking inert while the popover is up.
const CategoryFilterButton = forwardRef<HTMLButtonElement, CategoryFilterButtonProps>(
  function CategoryFilterButton(
    { count, activeCategory, categoryMenuOpen, disabled = false, onClick },
    ref,
  ) {
    const active = activeCategory !== null;
    const className = `${styles.button} ${active ? styles.buttonActive : ""}`;
    const swapTransition = {
      duration: MOTION.categoryFilter.buttonIconSwapDuration / 1000,
      ease: "easeOut" as const,
    };
    const restScale = MOTION.categoryFilter.buttonIconSwapRestScale;

    return (
      <button
        ref={ref}
        type="button"
        className={className}
        onClick={onClick}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={categoryMenuOpen}
        aria-label={`Filter by category${active ? `, showing ${count} project${count === 1 ? "" : "s"}` : ""}`}
        title="Filter by category"
      >
        {/* The count digit and the open-menu close (X) icon never coexist —
            mode="wait" plays them sequentially (outgoing shrinks+fades out,
            THEN incoming scales up+fades in) rather than crossfading. */}
        <span className={styles.countIconBox}>
          <AnimatePresence mode="wait" initial={false}>
            {categoryMenuOpen ? (
              <motion.img
                key="close"
                className={styles.countIcon}
                src="/assets/icons/close.svg"
                alt=""
                aria-hidden="true"
                initial={{ opacity: 0, scale: restScale }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: restScale }}
                transition={swapTransition}
              />
            ) : (
              <motion.span
                key={count}
                className={styles.countLabel}
                initial={{ opacity: 0, scale: restScale }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: restScale }}
                transition={swapTransition}
              >
                {count}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>
    );
  },
);

export default CategoryFilterButton;
