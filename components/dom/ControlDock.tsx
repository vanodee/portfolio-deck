"use client";

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useIsNotFoundRoute } from "@/hooks/useIsNotFoundRoute";
import { useCategoryFilter } from "@/hooks/useCategoryFilter";
import { useTableStore } from "@/store/useTableStore";
import {
  toggleRevealAll,
  shuffleTable,
  beginTableNavExit,
  beginAboutNavExit,
} from "@/lib/choreography";
import {
  dockButtonVariants,
  dockExtendDelay,
  dockGroupVariants,
  dockPillAnimate,
  dockPillTransition,
  leftSwapButtonVariants,
  leftSwapTransition,
} from "@/lib/dockChoreography";
import { socialPlatformMeta, socialLinkHref } from "@/lib/socialIcons";
import { MOTION } from "@/lib/motion";
import styles from "./ControlDock.module.css";
import DockButton from "./DockButton";
import DockToggle from "./DockToggle";
import CategoryFilterButton from "./CategoryFilterButton";
import CategoryFilterMenu from "./CategoryFilterMenu";

// Persists across the Home <-> About route change (app/layout.tsx, alongside
// TableHeader/PlayArea) instead of remounting per route — only the button
// content inside swaps, keyed on `onHome`, mirroring PlayArea.tsx's own
// onHome-branch pattern. Left group: Home gets visibility toggle + shuffle;
// About gets Email/LinkedIn/X. Right group: both get Resume, then a
// persistent Home/About DockToggle (the one control that never unmounts
// across the route change — it slides its thumb instead of swapping
// content, see DockToggle.tsx). Every button shares one `disabledAll` flag:
// `locked` (dealing or a card open — Home-only, since About has no
// table-guard concept) OR `navBusy` (a Home <-> About navigation is
// in-flight and the toggle's own animation has already finished — see the
// `navBusy` derivation below for why the whole dock, not just the toggle,
// locks for the remainder of that transition).
//
// Dock-formation handoff (DS §3.5, lib/dockChoreography.ts) — the ONE
// remaining transition here, played once during onboarding, never replayed
// on route change:
//   1. Hidden entirely (opacity 0) while OnboardingScreen's standalone logo
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
export default function ControlDock() {
  const router = useRouter();
  const pathname = usePathname();
  const onHome = pathname === "/";
  // 404 route (app/not-found.tsx) — this component renders nothing there at
  // all (see the early return at the bottom of this function): clicking the
  // 404 card spread goes straight into Home's onboarding state, which has no
  // dock either, so there's nothing for this dock to usefully show. `notFound`
  // is still computed with the rest of the hooks above the early return (Rules
  // of Hooks — every hook here must run unconditionally on every render).
  const notFound = useIsNotFoundRoute();

  const allRevealed = useTableStore((s) => s.allRevealed);
  const dealComplete = useTableStore((s) => s.dealComplete);
  const openCardId = useTableStore((s) => s.openCardId);
  const appPhase = useTableStore((s) => s.appPhase);
  const dockNavPhase = useTableStore((s) => s.dockNavPhase);
  const socialLinks = useTableStore((s) => s.socialLinks);
  const resumeUrl = useTableStore((s) => s.resumeUrl);
  const locked = onHome && (!dealComplete || openCardId !== null);

  const categoryFilter = useCategoryFilter();
  const categoryFilterButtonRef = useRef<HTMLButtonElement>(null);
  const dockRef = useRef<HTMLElement>(null);

  // Formed once past Home's onboarding gate; every other route has no
  // onboarding concept of its own, so it's always formed there.
  const formed = !onHome || appPhase !== "onboarding";

  // DockToggle's visual position — deliberately NOT derived directly from
  // `onHome`/pathname. The actual route change (beginTableNavExit) takes
  // ~1.1s+ (the deck sliding off-table) before it fires, and waiting for
  // that would make the toggle itself feel unresponsive. Instead the toggle
  // flips optimistically the instant it's clicked (see handleToggle below).
  // The render-time comparison below (React's documented "adjust state
  // during render" pattern, same idiom as `settled` further down — no
  // effect needed) is the reconciliation path for navigation NOT triggered
  // by that click (browser back/forward, a direct link): it's a no-op
  // whenever local state and the route already agree, which is the case
  // for every toggle-click-driven navigation once it actually lands.
  const [checked, setChecked] = useState(!onHome);
  const [lastOnHome, setLastOnHome] = useState(onHome);

  // Left-group route-swap (Eye/Shuffle <-> Email/LinkedIn/X) — the current
  // side's buttons translate down + fade out, staggered, the instant the
  // toggle is clicked (handleToggle below); once the route actually changes
  // and the other side's buttons mount, they play the reverse. `hasSwapped`
  // gates the entrance's `initial="hidden"` so a direct/fresh load of
  // either route renders its buttons already settled (no animation) —
  // only a mount caused by an ACTUAL swap (which can't happen before the
  // first click) should play the entrance.
  const [leftVisible, setLeftVisible] = useState(true);
  const [hasSwapped, setHasSwapped] = useState(false);

  if (onHome !== lastOnHome) {
    setLastOnHome(onHome);
    setChecked(!onHome);
    setLeftVisible(true);
  }

  // Dock-wide lockout for the remainder of an in-flight route transition,
  // once the toggle's OWN animation has finished (MOTION.dockToggle
  // .thumbDuration) — matches the existing dealing/open-card "locked"
  // treatment (disabled + dimmed) rather than leaving every button
  // clickable while the toggle's visual state has already committed to a
  // destination the route hasn't actually reached yet. Cleared the moment
  // dockNavPhase leaves "collapsing" (lib/choreography.ts's
  // beginTableNavExit flips it to "expanding" right as the deck finishes
  // sliding off-table and navigation actually fires) — i.e. as soon as the
  // route transition's own animations are done. Same render-time-comparison
  // idiom as `checked` above, no effect needed.
  const [navBusy, setNavBusy] = useState(false);
  const [lastDockNavPhase, setLastDockNavPhase] = useState(dockNavPhase);
  if (dockNavPhase !== lastDockNavPhase) {
    setLastDockNavPhase(dockNavPhase);
    if (dockNavPhase !== "collapsing" && navBusy) {
      setNavBusy(false);
    }
  }

  const disabledAll = locked || navBusy;

  function handleToggle() {
    // Guards against a rapid second click before navBusy itself kicks in
    // (MOTION.dockToggle.thumbDuration after the first) from optimistically
    // flipping `checked` a second time while the first navigation is
    // already committed — beginTableNavExit's own beginDockCollapse guard
    // would reject the resulting no-op call anyway, but this also stops the
    // toggle from visually flipping back before that resolves.
    if (dockNavPhase === "collapsing") return;
    const goingToAbout = onHome;
    setChecked(goingToAbout);
    setLeftVisible(false);
    setHasSwapped(true);
    window.setTimeout(() => {
      if (useTableStore.getState().dockNavPhase === "collapsing") setNavBusy(true);
    }, MOTION.dockToggle.thumbDuration);
    if (goingToAbout) {
      beginTableNavExit(() => router.push("/about"));
    } else {
      // Guarantees Home mounts already past onboarding — even if this
      // visitor arrived at /about directly and never dealt on Home this
      // session — so the "Hello!" gate never shows and the deck just
      // slides into frame (Card.tsx's startOffTable). Idempotent/harmless
      // on a normal round trip where dealing already happened.
      useTableStore.getState().setDealComplete();
      beginAboutNavExit(() => router.push("/"));
    }
  }

  // Latches true the first time `formed` goes true (the one-time onboarding
  // formation). A later route swap re-renders these groups with a different
  // button set but leaves `formed` still true — once settled, new children
  // mount with initial=false (pop in at their resting state) instead of
  // replaying the stagger-in reveal meant only for onboarding. Per React's
  // documented "adjust state during render" pattern, this is a plain
  // conditional update in the render body — no effect needed.
  const [settled, setSettled] = useState(formed);
  if (formed && !settled) {
    setSettled(true);
  }

  const extendDelay = dockExtendDelay(formed);
  const groupVariants = dockGroupVariants(extendDelay);

  // Every hook above must still run on every render (Rules of Hooks) even
  // though this component renders nothing on the 404 route — this early
  // return only skips the JSX/output, not any hook call.
  if (notFound) return null;

  return (
    <>
      <motion.nav
        ref={dockRef}
        className={styles.dock}
        aria-label="Table controls"
        style={{ pointerEvents: formed ? "auto" : "none" }}
        initial={false}
        animate={dockPillAnimate(formed)}
        transition={dockPillTransition(formed)}
      >
        <motion.div
          className={styles.group}
          variants={groupVariants}
          initial={settled ? false : "hidden"}
          animate={formed ? "show" : "hidden"}
        >
          {onHome ? (
            <>
              <motion.div variants={dockButtonVariants}>
                <motion.div
                  variants={leftSwapButtonVariants}
                  initial={hasSwapped ? "hidden" : false}
                  animate={leftVisible ? "show" : "hidden"}
                  transition={leftSwapTransition(0)}
                >
                  <CategoryFilterButton
                    ref={categoryFilterButtonRef}
                    count={categoryFilter.count}
                    activeCategory={categoryFilter.activeCategory}
                    categoryMenuOpen={categoryFilter.categoryMenuOpen}
                    disabled={disabledAll}
                    onClick={categoryFilter.toggleCategoryMenu}
                  />
                </motion.div>
              </motion.div>
              <motion.div variants={dockButtonVariants}>
                <motion.div
                  variants={leftSwapButtonVariants}
                  initial={hasSwapped ? "hidden" : false}
                  animate={leftVisible ? "show" : "hidden"}
                  transition={leftSwapTransition(1)}
                >
                  <DockButton
                    icon="/assets/icons/closed_eye.svg"
                    activeIcon="/assets/icons/eye.svg"
                    label={allRevealed ? "Cover all cards" : "Reveal all cards"}
                    active={allRevealed}
                    disabled={disabledAll}
                    onClick={toggleRevealAll}
                  />
                </motion.div>
              </motion.div>
              <motion.div variants={dockButtonVariants}>
                <motion.div
                  variants={leftSwapButtonVariants}
                  initial={hasSwapped ? "hidden" : false}
                  animate={leftVisible ? "show" : "hidden"}
                  transition={leftSwapTransition(2)}
                >
                  <DockButton
                    icon="/assets/icons/shuffle.svg"
                    label="Shuffle cards"
                    disabled={disabledAll}
                    onClick={shuffleTable}
                  />
                </motion.div>
              </motion.div>
            </>
          ) : (
            <>
              {socialLinks.map((link, index) => {
                const meta = socialPlatformMeta(link.platform);
                const isEmail = link.platform === "Email";
                return (
                  <motion.div key={link.platform} variants={dockButtonVariants}>
                    <motion.div
                      variants={leftSwapButtonVariants}
                      initial={hasSwapped ? "hidden" : false}
                      animate={leftVisible ? "show" : "hidden"}
                      transition={leftSwapTransition(index)}
                    >
                      <DockButton
                        icon={meta.icon}
                        label={meta.label}
                        disabled={disabledAll}
                        href={socialLinkHref(link)}
                        target={isEmail ? undefined : "_blank"}
                        rel={isEmail ? undefined : "noopener noreferrer"}
                      />
                    </motion.div>
                  </motion.div>
                );
              })}
            </>
          )}
        </motion.div>
        {/* This slot's own size/position must stay stable from first paint
            (grid sizing depends on it), but the layoutId-bearing element
            inside only mounts once formed — a shared layoutId that's already
            mounted (even invisibly) doesn't get a FLIP transition when the
            standalone logo exits toward it, Framer Motion just snaps
            instantly since it sees a duplicate, already-resolved instance
            rather than a clean exit->enter pair. */}
        <div className={styles.centerLogo} aria-hidden="true">
          {formed && (
            <motion.div layoutId="logo-mark-travel" className={styles.centerLogoImg}>
              <img src="/assets/logo-mark.png" alt="" />
            </motion.div>
          )}
        </div>
        <motion.div
          className={styles.group}
          variants={groupVariants}
          initial={settled ? false : "hidden"}
          animate={formed ? "show" : "hidden"}
        >
          <motion.div variants={dockButtonVariants}>
            <DockButton
              icon="/assets/icons/resume.svg"
              label="Resume"
              disabled={disabledAll}
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          </motion.div>
          <motion.div
            className={styles.toggleContainer}
            variants={dockButtonVariants}
          >
            <DockToggle checked={checked} disabled={disabledAll} onToggle={handleToggle} />
          </motion.div>
        </motion.div>
      </motion.nav>
      {onHome && (
        <CategoryFilterMenu anchorRef={categoryFilterButtonRef} dockRef={dockRef} />
      )}
    </>
  );
}
