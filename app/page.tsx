import FeltBackground from "@/components/dom/FeltBackground";
import OpenCardOverlay from "@/components/dom/OpenCardOverlay";
import ChipStackTracker from "@/components/dom/ChipStackTracker";
import OnboardingScreen from "@/components/dom/OnboardingScreen";

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
