"use client";

import { usePathname } from "next/navigation";
import { useTableStore } from "@/store/useTableStore";

/**
 * Whether the dealt deck + "Pick a Card" heading should be in their normal
 * visible state, vs. exited for the Home <-> About dock-nav transition
 * (store.dockNavPhase, lib/dockChoreography.ts). TableHeader and PlayArea
 * persist across the route change (app/layout.tsx) — this is the signal
 * PlayArea.tsx (cards) and PickACardHeading.tsx key their own exit/enter
 * choreography off.
 *
 * `dockNavPhase` alone can't distinguish "settled on Home" from "settled on
 * About" (it rests at "expanding" permanently either way, see
 * useDockNavFormation's doc comment) — pathname is what actually pins down
 * which page we're on; dockNavPhase only supplies the "currently mid-exit"
 * moment (About's own click, before navigation has actually fired) that
 * pathname alone wouldn't yet reflect.
 */
export function useShowTableContent(): boolean {
  const pathname = usePathname();
  const dockNavPhase = useTableStore((s) => s.dockNavPhase);
  return pathname === "/" && dockNavPhase !== "collapsing";
}
