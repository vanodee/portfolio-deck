import type { Metadata } from "next";
import FeltBackground from "@/components/dom/FeltBackground";
import AboutDock from "@/components/dom/AboutDock";

export const metadata: Metadata = {
  title: "Stevano Peters — About",
  description: "About Stevano Peters — Card Table Portfolio.",
};

// This route carries the dock transition + button set (PRD §10's "About
// panel treatment" resolved as its own route, not the card-open overlay
// pattern) — FeltBackground and AboutDock are route-owned chrome and stay
// here. The frame's interior content (Hero, The Run, House Rules, Chips up
// my sleeve, Tables I've Played, Ready to deal) lives in
// components/dom/AboutContent.tsx instead, rendered by PlayArea.tsx's
// `!onHome` branch — the dashed-border frame is chrome hoisted above both
// routes' own page.tsx (app/layout.tsx), so content that belongs inside it
// can't be authored here directly. Entrance/scroll choreography for that
// content is still a separate, later pass.
export default function About() {
  return (
    <main>
      <FeltBackground />
      <AboutDock />
    </main>
  );
}
