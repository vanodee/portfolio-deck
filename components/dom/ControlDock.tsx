"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTableStore } from "@/store/useTableStore";
import { toggleRevealAll, shuffleTable } from "@/lib/choreography";
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
import styles from "./ControlDock.module.css";
import DockButton from "./DockButton";
import StandaloneLogo from "./StandaloneLogo";

// DS §3.3 — left group: visibility toggle + shuffle; embossed center logo;
// right group: Resume (link, same placeholder destination as AboutDock.tsx)
// + About, which triggers the Home -> About dock-nav transition. Buttons
// disable while dealing or while a card is open (locked decision).
//
// Dock-formation handoff — shared with AboutDock.tsx and reused/reversed
// for the Home <-> About route transition (lib/dockChoreography.ts,
// hooks/useDockNavFormation.ts):
//   1. Hidden entirely (opacity 0) while the standalone logo (StandaloneLogo)
//      travels/scales down onto this dock's center logo (the layoutId
//      shared-element FLIP target — its rect must stay stable/correct from
//      first paint, which is why the dock's real box (grid/width/radius)
//      never itself resizes; only clip-path fakes the visible shape).
//   2. Once the logo arrives, this dock crossfades in (opacity 0->1) as the
//      standalone logo crossfades out — still clipped to the small
//      rest-state ellipse at this point, so the swap reads as seamless.
//   3. After the crossfade, the clip-path extends (small ellipse -> large
//      ellipse, both the same shape function so Framer Motion can actually
//      interpolate between them — mixing circle()/inset() can't animate)
//      and the button groups stagger in from center. The rest-state clip is
//      deliberately an ellipse rather than a circle: a circle inscribed in
//      the logo's box clips its corners, which read as the logo being cut
//      off.
// Reversed (About/Back-to-Home click), the same three stages play in
// mirror: buttons/clip collapse first, then the center logo hands off to a
// fresh StandaloneLogo instance that crossfades in and travels back out to
// the standalone position — see useDockNavFormation for the phase machine.
export default function ControlDock() {
  const router = useRouter();
  const allRevealed = useTableStore((s) => s.allRevealed);
  const dealComplete = useTableStore((s) => s.dealComplete);
  const openCardId = useTableStore((s) => s.openCardId);
  const appPhase = useTableStore((s) => s.appPhase);
  const locked = !dealComplete || openCardId !== null;

  const { formed, centerLogoInstalled, standaloneVisible, reverse } = useDockNavFormation(
    appPhase !== "onboarding",
  );

  const extendDelay = dockExtendDelay(formed);
  const groupVariants = dockGroupVariants(reverse, extendDelay);

  return (
    <>
      <motion.nav
        className={styles.dock}
        aria-label="Table controls"
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
            <DockButton
              icon="/assets/icons/closed_eye.svg"
              activeIcon="/assets/icons/eye.svg"
              label={allRevealed ? "Cover all cards" : "Reveal all cards"}
              active={allRevealed}
              disabled={locked}
              onClick={toggleRevealAll}
            />
          </motion.div>
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/shuffle.svg"
              label="Shuffle cards"
              disabled={locked}
              onClick={shuffleTable}
            />
          </motion.div>
        </motion.div>
        {/* This slot's own size/position must stay stable from first paint
            (grid sizing depends on it), but the layoutId-bearing element
            inside only mounts once centerLogoInstalled — a shared layoutId
            that's already mounted (even invisibly) doesn't get a FLIP
            transition when the standalone logo exits toward it, Framer
            Motion just snaps instantly since it sees a duplicate,
            already-resolved instance rather than a clean exit->enter pair. */}
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
            <DockButton
              icon="/assets/icons/resume.svg"
              label="Resume"
              disabled={locked}
              href={ABOUT_LINKS.resume}
            />
          </motion.div>
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/about.svg"
              label="About"
              disabled={locked}
              onClick={() => beginDockExit(() => router.push("/about"))}
            />
          </motion.div>
        </motion.div>
      </motion.nav>
      <StandaloneLogo showing={standaloneVisible} enteringFromDock={reverse} />
    </>
  );
}
