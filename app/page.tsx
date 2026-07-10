import FeltBackground from "@/components/dom/FeltBackground";
import ControlDock from "@/components/dom/ControlDock";
import OpenCardOverlay from "@/components/dom/OpenCardOverlay";
import ChipStackTracker from "@/components/dom/ChipStackTracker";
import OnboardingScreen from "@/components/dom/OnboardingScreen";

// TableHeader and PlayArea (card grid/canvas, "Pick a Card" heading) are
// hoisted into app/layout.tsx — they persist across the Home <-> About
// route change instead of living here. See hooks/useShowTableContent.ts
// for how their contents react to being on/off this route.
export default function Home() {
  return (
    <main>
      <FeltBackground />
      <ControlDock />
      <ChipStackTracker />
      <OpenCardOverlay />
      <OnboardingScreen />
    </main>
  );
}
