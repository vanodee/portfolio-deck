import type { Metadata } from "next";
import FeltBackground from "@/components/dom/FeltBackground";

export const metadata: Metadata = {
  title: "Stevano Peters — Page Not Found",
  description: "Bust! This page doesn't exist. Card Table Portfolio.",
};

// Reached for any unmatched route. Same minimal shape as app/about/page.tsx:
// TableHeader/PlayArea/ControlDock are hoisted into app/layout.tsx and react
// to this route via pathname (PlayArea renders NotFoundContent.tsx in its
// `notFound` branch; ControlDock reverts to its compact logo-only pill) — so
// this file owns nothing but felt + metadata, same as every other route.
export default function NotFound() {
  return (
    <main>
      <FeltBackground />
    </main>
  );
}
