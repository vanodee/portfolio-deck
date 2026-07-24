import type { Metadata } from "next";
import FeltBackground from "@/components/dom/FeltBackground";
import OpenCardOverlay from "@/components/dom/OpenCardOverlay";
import ChipStackTracker from "@/components/dom/ChipStackTracker";
import OnboardingScreen from "@/components/dom/OnboardingScreen";

const title = "Stevano Peters | The Card Table Portfolio";
const description =
  "Stevano Peters' Card Table Design Portfolio is a playful, interactive take on showcasing product design and frontend work.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://stevano.dev/",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "/",
    images: [
      {
        url: "/assets/og_image_large.png",
        width: 1200,
        height: 630,
        alt: "Card Table Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/assets/og_image_large.png"],
    site: "@vano_dee",
    creator: "@vano_dee",
  },
};

// TableHeader, PlayArea (card grid/canvas, "Pick a Card" heading), and
// ControlDock are hoisted into app/layout.tsx — they persist across the
// Home <-> About route change instead of living here. See
// hooks/useShowTableContent.ts for how PlayArea's contents react to being
// on/off this route (ControlDock keys its own content off usePathname).
export default function Home() {
  return (
    <main>
      <FeltBackground />
      <ChipStackTracker />
      <OpenCardOverlay />
      <OnboardingScreen />
    </main>
  );
}
