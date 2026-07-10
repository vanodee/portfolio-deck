"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { openEaseBezierPoints } from "@/lib/easing";
import { MOTION } from "@/lib/motion";
import { useTableStore } from "@/store/useTableStore";
import styles from "./TableHeader.module.css";

// DS §3.4 — wordmark + tagline, top-left. On Home, fades in + translates in
// from the left once the entrance deal completes (onboarding hands off via
// the store's dealComplete flag, not a fixed timer — see
// lib/choreography.ts). This component persists across the Home <-> About
// route change (app/layout.tsx) — off Home there's no onboarding concept,
// so it's always visible, like persistent chrome/a navbar. The outer
// <header> owns fixed positioning/centering only; the animated values live
// on the inner wrapper so Framer Motion's own transform never fights the
// CSS translateX(-50%) centering trick.
export default function TableHeader() {
  const dealComplete = useTableStore((s) => s.dealComplete);
  const onHome = usePathname() === "/";
  const visible = !onHome || dealComplete;

  return (
    <header className={styles.header}>
      <motion.div
        className={styles.inner}
        initial={false}
        animate={
          visible
            ? { opacity: 0.6, x: 0 }
            : { opacity: 0, x: -MOTION.onboarding.headerTranslateX }
        }
        transition={{
          duration: MOTION.onboarding.headerFadeIn / 1000,
          ease: openEaseBezierPoints,
        }}
      >
        <div className={styles.wordmark}>
          <span className={styles.name}>STEVANO</span>
          <img
            className={styles.glyph}
            src="/assets/logo-mark.png"
            alt=""
            aria-hidden="true"
          />
          <span className={styles.name}>PETERS</span>
        </div>
        <p className={styles.tagline}>Designer • Developer • AI-Fluent Builder</p>
      </motion.div>
    </header>
  );
}
