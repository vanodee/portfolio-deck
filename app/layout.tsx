import type { Metadata } from "next";
import { Outfit, Meow_Script } from "next/font/google";
import TableHeader from "@/components/dom/TableHeader";
import PlayArea from "@/components/dom/PlayArea";
import ControlDock from "@/components/dom/ControlDock";
import ProjectsHydrator from "@/components/dom/ProjectsHydrator";
import SiteSettingsHydrator from "@/components/dom/SiteSettingsHydrator";
import { getProjectListing } from "@/lib/getProjects";
import { getSiteSettings, getFeaturedTools } from "@/lib/getSiteSettings";
import "./tokens.css";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const meowScript = Meow_Script({
  variable: "--font-meow-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://table.stevano.dev"),
  title: "Stevano Peters — Pick a Card",
  description:
    "An interactive card-table portfolio. Every project is a playing card: deal, shuffle, reveal, and open.",
  robots: { index: false, follow: false },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-fetched before anything paints, so the deal's onboarding-click
  // trigger (gated on the store's projects being populated, CardsLayer.tsx)
  // essentially never races an unresolved fetch — by the time the page is
  // interactive, hydration has already happened with this data in hand.
  // Deliberately uncaught: the listing is load-bearing (no cards = no
  // functional homepage), so a failure surfaces via app/global-error.tsx
  // rather than degrading silently.
  // siteSettings/tools failures degrade gracefully (see lib/getSiteSettings.ts)
  // rather than throwing — ControlDock renders on every route, so a failure
  // here can't be allowed to take down the whole site the way a listing
  // failure legitimately does.
  const [projects, siteSettings, tools] = await Promise.all([
    getProjectListing(),
    getSiteSettings(),
    getFeaturedTools(),
  ]);

  return (
    <html lang="en" className={`${outfit.variable} ${meowScript.variable}`}>
      {/* TableHeader (wordmark + tagline), PlayArea (the play-area frame,
          card grid/canvas, "Pick a Card" heading), and ControlDock persist
          across the Home <-> About route change — every route needs them,
          and re-mounting a fresh WebGL context (or replaying the dock's
          onboarding-formation animation) on every nav would be wasteful/
          jarring. Their contents react to the route via usePathname
          (ControlDock, PlayArea's onHome branch) or
          hooks/useShowTableContent.ts (PlayArea's cards, PickACardHeading)
          rather than unmounting; every other route-specific piece
          (onboarding, overlays) stays in each route's own page.tsx. All
          layering here is explicit z-index (see each component's CSS
          module), so this DOM order relative to `children` doesn't affect
          stacking. */}
      <body>
        <ProjectsHydrator projects={projects} />
        <SiteSettingsHydrator siteSettings={siteSettings} tools={tools} />
        <PlayArea />
        <TableHeader />
        <ControlDock />
        {children}
      </body>
    </html>
  );
}
