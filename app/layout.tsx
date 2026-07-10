import type { Metadata } from "next";
import { Outfit, Meow_Script } from "next/font/google";
import TableHeader from "@/components/dom/TableHeader";
import PlayArea from "@/components/dom/PlayArea";
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
  title: "Stevano Peters — Pick a Card",
  description:
    "An interactive card-table portfolio. Every project is a playing card: deal, shuffle, reveal, and open.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${meowScript.variable}`}>
      {/* TableHeader (wordmark + tagline) and PlayArea (the play-area frame,
          card grid/canvas, "Pick a Card" heading) persist across the Home
          <-> About route change — both routes need them, and re-mounting a
          fresh WebGL context on every nav would be wasteful/jarring. Their
          contents react to the route via hooks/useShowTableContent.ts
          (PlayArea's cards, PickACardHeading) rather than unmounting; every
          other route-specific piece (ControlDock/AboutDock, onboarding,
          overlays) stays in each route's own page.tsx. All layering here is
          explicit z-index (see each component's CSS module), so this DOM
          order relative to `children` doesn't affect stacking. */}
      <body>
        <PlayArea />
        <TableHeader />
        {children}
      </body>
    </html>
  );
}
