"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "framer-motion";
import { standaloneLogoTransition } from "@/lib/dockChoreography";
import styles from "./StandaloneLogo.module.css";

interface StandaloneLogoProps {
  showing: boolean;
  /** True only for the reverse/origin role (lib/dockChoreography.ts): a
   * fresh instance that just mounted at the dock's rect and needs to
   * crossfade in before traveling out to the standalone position. Default
   * (false) reproduces the original onboarding behavior — already mounted,
   * travels toward a dock, then crossfades out on exit. */
  enteringFromDock?: boolean;
}

// Standalone wordmark mark (DS §3.5) — the layoutId="logo-mark-travel"
// shared-element source/destination for the dock-formation handoff, shared
// by OnboardingScreen (original onboarding gate) and the Home <-> About
// dock-nav transition (lib/dockChoreography.ts), which reuses this same
// fixed position/asset on both pages so the FLIP reads as seamless across
// the actual route boundary even though no DOM node persists across it.
export default function StandaloneLogo({ showing, enteringFromDock = false }: StandaloneLogoProps) {
  const { layout, opacity } = standaloneLogoTransition(enteringFromDock);
  return (
    <div className={styles.logoLayer} aria-hidden={!showing}>
      <AnimatePresence>
        {showing && (
          <motion.div
            key="standalone-logo"
            layoutId="logo-mark-travel"
            className={styles.logoWrap}
            initial={enteringFromDock ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            exit={enteringFromDock ? undefined : { opacity: 0 }}
            transition={{ layout, opacity }}
          >
            <img src="/assets/logo-mark.png" alt="" aria-hidden="true" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
