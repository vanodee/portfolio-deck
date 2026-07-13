"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "framer-motion";
import { standaloneLogoTransition } from "@/lib/dockChoreography";
import styles from "./StandaloneLogo.module.css";

interface StandaloneLogoProps {
  showing: boolean;
}

// Standalone wordmark mark (DS §3.5) — the layoutId="logo-mark-travel"
// shared-element source for the onboarding dock-formation handoff: this
// instance travels/scales via FLIP onto ControlDock's center logo slot
// (components/dom/ControlDock.tsx) once onboarding ends, then crossfades
// out as the dock crossfades in.
export default function StandaloneLogo({ showing }: StandaloneLogoProps) {
  const { layout, opacity } = standaloneLogoTransition();
  return (
    <div className={styles.logoLayer} aria-hidden={!showing}>
      <AnimatePresence>
        {showing && (
          <motion.div
            key="standalone-logo"
            layoutId="logo-mark-travel"
            className={styles.logoWrap}
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ layout, opacity }}
          >
            <img src="/assets/logo-mark.png" alt="" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
