"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTableStore } from "@/store/useTableStore";
import { MOTION } from "@/lib/motion";
import { openEaseBezierPoints } from "@/lib/easing";
import { useAboutSectionsGate } from "@/hooks/useAboutSectionsGate";
import { useSectionReveal } from "@/hooks/useSectionReveal";
import { PHOTOS } from "@/data/photos";
import BrandCard from "./BrandCard";
import Chip from "./Chip";
import ExperienceCardSpread from "./ExperienceCardSpread";
import PhotoCardSpread, { PHOTO_SPREAD_MAX_CARDS } from "./PhotoCardSpread";
import styles from "./AboutContent.module.css";

// About page's frame-interior content — the counterpart to Home's card
// grid/heading, rendered by PlayArea.tsx's `!onHome` branch since `.frame`
// (the dashed-border chrome) is hoisted above both routes' own page.tsx.
// Beyond the root's own Home <-> About route-nav translate+fade (below),
// each section (Hero/Run/Chips/Brands) plays a first-visit-only "dealt in"
// stagger on viewport intersection — see hooks/useAboutSectionsGate.ts,
// hooks/useSectionReveal.ts, hooks/useEntranceHoldReveal.ts. Copy/section
// order per public/assets/refereneces/About Page.png.
export default function AboutContent() {
  const [revealedBrandId, setRevealedBrandId] = useState<string | null>(null);
  const [revealedToolId, setRevealedToolId] = useState<string | null>(null);
  const experience = useTableStore((s) => s.experience);
  const clients = useTableStore((s) => s.clients);
  const tools = useTableStore((s) => s.tools);

  const { armed, baseDelayMs } = useAboutSectionsGate();
  const { ref: heroRef, triggered: heroTriggered } = useSectionReveal(armed, baseDelayMs);
  const { ref: runRef, triggered: runTriggered } = useSectionReveal(armed, baseDelayMs);
  const { ref: toolsRef, triggered: toolsTriggered } = useSectionReveal(armed, baseDelayMs);
  const { ref: brandsRef, triggered: brandsTriggered } = useSectionReveal(armed, baseDelayMs);

  // Stat chips wait for Hero's photo-card stagger to fully finish before
  // starting their own — the "similar animation, after which" ordering from
  // the request. Photo cards deal in strictly one-at-a-time (delay_i = i *
  // (duration + stagger)), so the total is that same per-item interval times
  // the count, plus the last card's own duration.
  const photoCount = Math.min(PHOTOS.length, PHOTO_SPREAD_MAX_CARDS);
  const photoEntranceTotalMs =
    Math.max(0, photoCount - 1) *
      (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger) +
    MOTION.aboutSectionReveal.duration;
  const statChipsBaseDelay = photoEntranceTotalMs + MOTION.aboutSectionReveal.heroChipsGap;
  // Stat chips themselves also deal in one-at-a-time.
  const statChipStep = MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger;

  // Home -> About entrance: only plays when arriving via client-side nav
  // (dockNavPhase !== "idle" at mount) — a direct/hard-reloaded load of
  // /about has a fresh store at "idle" and renders already settled, same
  // "direct load = no animation" rule Card.tsx's startOffTable follows for
  // Home's own deck. dockNavPhase is already "expanding" (not "collapsing")
  // by the time router.push actually fires (lib/choreography.ts), so this
  // mount-time check is stable — no risk of it ever seeing "collapsing".
  const [enterFromRight] = useState(
    () => useTableStore.getState().dockNavPhase !== "idle",
  );
  // About -> Home exit: fires while this is still mounted, in the brief
  // window beginAboutNavExit (lib/choreography.ts) holds dockNavPhase at
  // "collapsing" before the route actually changes — mirrors the deck's own
  // off-table exit on the Home side.
  const exiting = useTableStore((s) => s.dockNavPhase === "collapsing");

  return (
    <motion.div
      className={styles.scrollRegion}
      initial={enterFromRight ? { x: MOTION.aboutNav.translateX, opacity: 0 } : false}
      animate={{ x: exiting ? MOTION.aboutNav.translateX : 0, opacity: exiting ? 0 : 1 }}
      transition={{ duration: MOTION.aboutNav.duration / 1000, ease: openEaseBezierPoints }}
    >
      <div className={styles.content}>
        <section className={styles.hero} ref={heroRef}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>Nice to meet you...</h1>
            <p className={styles.heroIntro}>
              I&apos;m your <i>design, engineering, and AI-assisted building guy</i>, turning ideas into products people actually enjoy using. This site is one example: designed, built, and brought to life by me, top to bottom.
            </p>
            <div className={styles.statChips}>
              <Chip
                variant="stat"
                value="06+"
                label="Years at the Table"
                color="var(--card-back-bg)"
                revealArmed={armed}
                revealTriggered={heroTriggered}
                revealDelayMs={statChipsBaseDelay}
              />
              <Chip
                variant="stat"
                value="150+"
                label="Hands Played (Projects)"
                color="var(--flagship-gold)"
                revealArmed={armed}
                revealTriggered={heroTriggered}
                revealDelayMs={statChipsBaseDelay + statChipStep}
              />
            </div>
          </div>
          <div className={styles.heroPhotos}>
            <PhotoCardSpread photos={PHOTOS} revealArmed={armed} revealTriggered={heroTriggered} />
          </div>
        </section>

        <section className={styles.run} ref={runRef}>
          <h2 className={styles.sectionHeading}>The Run</h2>
          <p className={styles.subheading}>Career so far, dealt in order</p>
          <div className={styles.runSpreadWrap}>
            <ExperienceCardSpread
              experiences={experience}
              revealArmed={armed}
              revealTriggered={runTriggered}
            />
          </div>
        </section>

        <section className={styles.houseRules}>
          <h2 className={styles.sectionHeading}>House Rules</h2>
          <p className={styles.subheading}>How I play the game</p>
          <div className={styles.houseRulesBody}>
            <p className={styles.bodyParagraph}>
              I design and build digital products (branding, UX, and frontend development) and treat AI as a real part of how I work, not a shortcut around it. The result is faster execution without losing craft or intention.
            </p>
            <p className={styles.bodyParagraph}>
              This portfolio is the clearest proof of that. I designed it, built it, and used Generative AI tools throughout the process to move from concept to a fully working, interactive site (the kind of project most people would&apos;ve scoped down). It reflects how I actually work: hands-on, resourceful, and comfortable owning a project end to end.
            </p>
            <p className={styles.bodyParagraph}>
              Still refining. Still building. Always looking for the next thing worth making properly.
            </p>
          </div>
        </section>

        <section className={styles.tools} ref={toolsRef}>
          <h2 className={styles.sectionHeading}>Chips up my sleeve</h2>
          <p className={styles.subheading}>Tools &amp; stack</p>
          <div className={styles.toolGrid}>
            {tools.map((tool, index) => (
              <Chip
                key={tool.id}
                variant="tool"
                name={tool.name}
                logoSrc={tool.logoSrc}
                logoAlt={tool.logoAlt}
                color={tool.color}
                revealed={revealedToolId === tool.id}
                onToggle={() =>
                  setRevealedToolId((current) => (current === tool.id ? null : tool.id))
                }
                revealArmed={armed}
                revealTriggered={toolsTriggered}
                revealDelayMs={index * (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger)}
                revealHoldMs={MOTION.aboutSectionReveal.chipHoldDuration}
              />
            ))}
          </div>
        </section>

        <section className={styles.brands} ref={brandsRef}>
          <h2 className={styles.sectionHeading}>Tables I&apos;ve Played</h2>
          <p className={styles.subheading}>Brands &amp; clients</p>
          <div className={styles.brandGrid}>
            {clients.map((brand, index) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                revealed={revealedBrandId === brand.id}
                onToggle={() =>
                  setRevealedBrandId((current) => (current === brand.id ? null : brand.id))
                }
                revealArmed={armed}
                revealTriggered={brandsTriggered}
                revealDelayMs={index * (MOTION.aboutSectionReveal.duration + MOTION.aboutSectionReveal.stagger)}
                revealHoldMs={MOTION.aboutSectionReveal.brandHoldDuration}
              />
            ))}
          </div>
        </section>

        <div className={styles.readyToDeal}>
          <h2 className={styles.sectionHeading}>Ready to deal ?</h2>
          <p className={styles.subheading}>Get in touch</p>
        </div>
      </div>
    </motion.div>
  );
}
