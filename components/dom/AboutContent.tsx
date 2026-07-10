"use client";

import { useState } from "react";
import { BRANDS } from "@/data/brands";
import { EXPERIENCE } from "@/data/experience";
import { PHOTOS } from "@/data/photos";
import { TOOLS } from "@/data/tools";
import BrandCard from "./BrandCard";
import Chip from "./Chip";
import ExperienceCardSpread from "./ExperienceCardSpread";
import PhotoCardSpread from "./PhotoCardSpread";
import styles from "./AboutContent.module.css";

// About page's frame-interior content — the counterpart to Home's card
// grid/heading, rendered by PlayArea.tsx's `!onHome` branch since `.frame`
// (the dashed-border chrome) is hoisted above both routes' own page.tsx.
// Structure-and-content pass only: no scroll-triggered reveals, stagger, or
// entrance choreography — everything renders in its final resting layout
// (a later pass adds animation). Copy/section order per
// public/assets/refereneces/About Page.png.
export default function AboutContent() {
  const [revealedBrandId, setRevealedBrandId] = useState<string | null>(null);

  return (
    <div className={styles.scrollRegion}>
      <div className={styles.content}>
        <section className={styles.hero}>
          <div className={styles.heroText}>
            <h1 className={styles.heroHeading}>Nice to meet you...</h1>
            <p className={styles.heroIntro}>
              I&apos;m someone whose work sits between branding, UX, and frontend engineering —
              in simpler terms, a designer who codes. I care about hierarchy, accessibility,
              performance… and naming layers properly. I create functional, user-friendly
              designs.
            </p>
            <div className={styles.statChips}>
              <Chip 
                variant="stat" 
                value="06+" 
                label="Years at the Table" 
                color="var(--card-back-bg)" 
              />
              <Chip
                variant="stat"
                value="150+"
                label="Hands Played (Projects)"
                color="var(--flagship-gold)"
              />
            </div>
          </div>
          <div className={styles.heroPhotos}>
            <PhotoCardSpread photos={PHOTOS} />
          </div>
        </section>

        <section className={styles.run}>
          <h2 className={styles.sectionHeading}>The Run</h2>
          <p className={styles.subheading}>Career so far, dealt in order</p>
          <div className={styles.runSpreadWrap}>
            <ExperienceCardSpread experiences={EXPERIENCE} />
          </div>
        </section>

        <section className={styles.houseRules}>
          <h2 className={styles.sectionHeading}>House Rules</h2>
          <p className={styles.subheading}>How I play the game</p>
          <div className={styles.houseRulesBody}>
            <p className={styles.bodyParagraph}>
              I&apos;ve spent enough years toggling between Figma, code editors, and brand decks
              to know that good design doesn&apos;t survive without structure. What began in
              branding evolved into UX systems and frontend builds. Today, I design with
              constraints in mind and build with intent.
            </p>
            <p className={styles.bodyParagraph}>
              My work focuses on design systems, scalable interfaces, and digital experiences
              built for longevity — not just launch-day screenshots. The best products feel
              effortless because the hard thinking already happened. My goal isn&apos;t just to
              make things look good — it&apos;s to make them make sense.
            </p>
            <p className={styles.bodyParagraph}>
              Still refining. Still building. Always zoomed in on the canvas, but never losing
              sight of the bigger picture.
            </p>
          </div>
        </section>

        <section className={styles.tools}>
          <h2 className={styles.sectionHeading}>Chips up my sleeve</h2>
          <p className={styles.subheading}>Tools &amp; stack</p>
          <div className={styles.toolGrid}>
            {TOOLS.map((tool) => (
              <Chip
                key={tool.id}
                variant="tool"
                name={tool.name}
                logoSrc={tool.logoSrc}
                logoAlt={tool.logoAlt}
                color={tool.color}
              />
            ))}
          </div>
        </section>

        <section className={styles.brands}>
          <h2 className={styles.sectionHeading}>Tables I&apos;ve Played</h2>
          <p className={styles.subheading}>Brands &amp; clients</p>
          <div className={styles.brandGrid}>
            {BRANDS.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                revealed={revealedBrandId === brand.id}
                onToggle={() =>
                  setRevealedBrandId((current) => (current === brand.id ? null : brand.id))
                }
              />
            ))}
          </div>
        </section>

        <div className={styles.readyToDeal}>
          <h2 className={styles.sectionHeading}>Ready to deal ?</h2>
          <p className={styles.subheading}>Get in touch</p>
        </div>
      </div>
    </div>
  );
}
