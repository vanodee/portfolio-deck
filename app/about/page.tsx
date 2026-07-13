import type { Metadata } from "next";
import FeltBackground from "@/components/dom/FeltBackground";

export const metadata: Metadata = {
  title: "Stevano Peters — About",
  description: "About Stevano Peters — Card Table Portfolio.",
};

// This route resolves PRD §10's "About panel treatment" as its own route,
// not the card-open overlay pattern. ControlDock is hoisted into
// app/layout.tsx alongside TableHeader/PlayArea — it persists across the
// Home <-> About route change and keys its own button set off usePathname,
// so it isn't authored here. FeltBackground is route-owned chrome and stays
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
    </main>
  );
}
