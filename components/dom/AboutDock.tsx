"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  beginDockExit,
  dockButtonVariants,
  dockExtendDelay,
  dockGroupVariants,
  dockPillAnimate,
  dockPillTransition,
} from "@/lib/dockChoreography";
import { useDockNavFormation } from "@/hooks/useDockNavFormation";
import { ABOUT_LINKS } from "@/lib/aboutLinks";
import { useTableStore } from "@/store/useTableStore";
import styles from "./ControlDock.module.css";
import DockButton from "./DockButton";
import StandaloneLogo from "./StandaloneLogo";

// About page's own dock — identical pill layout/sizing/glass styling to
// ControlDock.tsx (same CSS module, same 45px buttons/30x30 icons), just a
// different button set. Left group: Email, LinkedIn, X. Right group:
// Resume, Back to Home. All one-shot actions — no table-guard concept here
// (About has no dealing/open-card state to lock against).
//
// Formation/collapse choreography is shared with ControlDock.tsx via
// lib/dockChoreography.ts + hooks/useDockNavFormation.ts — see that hook's
// doc comment for the full phase machine. `useDockNavFormation(true)`
// because About has no onboarding concept of its own: its only non-formed
// state is the transient "just arrived via nav" window.
export default function AboutDock() {
  const router = useRouter();
  const { formed, centerLogoInstalled, standaloneVisible, reverse } = useDockNavFormation(true);

  const extendDelay = dockExtendDelay(formed);
  const groupVariants = dockGroupVariants(reverse, extendDelay);

  return (
    <>
      <motion.nav
        className={styles.dock}
        aria-label="About controls"
        style={{ pointerEvents: formed ? "auto" : "none" }}
        initial={false}
        animate={dockPillAnimate(formed)}
        transition={dockPillTransition(formed, reverse)}
      >
        <motion.div
          className={styles.group}
          variants={groupVariants}
          initial="hidden"
          animate={formed ? "show" : "hidden"}
        >
          <motion.div variants={dockButtonVariants}>
            <DockButton icon="/assets/icons/email.svg" label="Email" href={ABOUT_LINKS.email} />
          </motion.div>
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/linkedin.svg"
              label="LinkedIn"
              href={ABOUT_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
            />
          </motion.div>
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/twitter.svg"
              label="X"
              href={ABOUT_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
            />
          </motion.div>
        </motion.div>
        <div className={styles.centerLogo} aria-hidden="true">
          {centerLogoInstalled && (
            <motion.div layoutId="logo-mark-travel" className={styles.centerLogoImg}>
              <img src="/assets/logo-mark.png" alt="" />
            </motion.div>
          )}
        </div>
        <motion.div
          className={styles.group}
          variants={groupVariants}
          initial="hidden"
          animate={formed ? "show" : "hidden"}
        >
          <motion.div variants={dockButtonVariants}>
            <DockButton icon="/assets/icons/resume.svg" label="Resume" href={ABOUT_LINKS.resume} />
          </motion.div>
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/cards.svg"
              label="Back to Home"
              onClick={() => {
                // Guarantees Home mounts already past onboarding — even if
                // this visitor arrived at /about directly and never dealt
                // on Home this session — so the "Hello!" gate never shows
                // and the deck just slides into frame (Card.tsx's
                // startOffTable). Idempotent/harmless on a normal round
                // trip where dealing already happened.
                useTableStore.getState().setDealComplete();
                beginDockExit(() => router.push("/"));
              }}
            />
          </motion.div>
        </motion.div>
      </motion.nav>
      <StandaloneLogo showing={standaloneVisible} enteringFromDock={reverse} />
    </>
  );
}
