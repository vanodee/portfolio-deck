import { cardHandles } from "./cardHandles";
import { MOTION } from "./motion";
import type { TableLayout } from "./layout";
import { useTableStore } from "@/store/useTableStore";

// Multi-card choreography — updates the store, then drives each card's
// springs through the handle registry with per-card delays.

/** Bulk cover/reveal (PRD §4.3): staggered flips across the grid. */
export function toggleRevealAll() {
  const store = useTableStore.getState();
  const before = store.allRevealed;
  store.toggleRevealAll();
  const after = useTableStore.getState();
  if (after.allRevealed === before) return; // guard rejected the toggle

  const target = after.allRevealed;
  for (const id of after.cardOrder) {
    const card = after.cards[id];
    cardHandles
      .get(id)
      ?.flip(target, card.gridIndex * MOTION.bulkReveal.stagger);
  }
}

/**
 * Entrance deal (PRD §4.1): all cards jitter at the deck, then travel to
 * their grid slots staggered like dealt hands. Pointer input stays locked
 * until the last card settles (DS §6 — clicks ignored, no queue/interrupt).
 */
export function dealTable() {
  const store = useTableStore.getState();
  if (store.dealComplete) return;

  store.cardOrder.forEach((id, i) => {
    cardHandles.get(id)?.deal(i * MOTION.deal.stagger);
  });

  const total =
    MOTION.deal.jitter +
    (store.cardOrder.length - 1) * MOTION.deal.stagger +
    MOTION.deal.perCard +
    250; // settle margin
  setTimeout(() => useTableStore.getState().setDealComplete(), total);
}

/**
 * Onboarding -> table entry point: advances the app phase past onboarding
 * (guarded, no-op if already advanced), then explicitly rises every card
 * from its onboarding shuffle rest position to the real deck position
 * (Card.tsx ascendToDeck — supersedes the shuffle loop on the same spring,
 * same pop-free handoff as every other transition in this file) and only
 * once that finishes does the untouched entrance deal below fire, so
 * deal()'s jitter always starts from the exact deck position rather than
 * blending with a still-arriving card.
 */
export function beginDeal() {
  const store = useTableStore.getState();
  if (store.appPhase !== "onboarding") return;
  store.startDealing();

  store.cardOrder.forEach((id) => {
    cardHandles.get(id)?.ascendToDeck(0);
  });
  setTimeout(() => dealTable(), MOTION.onboardingShuffle.ascendDuration + 50);
}

/** Ranks every other card by distance from the open card's grid slot. */
function rankByDistance(openId: string, layout: TableLayout, ascending: boolean) {
  const s = useTableStore.getState();
  const openIdx = s.cards[openId].gridIndex;
  const openPos = layout.positions[openIdx];
  const others = s.cardOrder.filter((id) => id !== openId);
  const withDist = others.map((id) => {
    const p = layout.positions[s.cards[id].gridIndex];
    return { id, dist: Math.hypot(p.x - openPos.x, p.y - openPos.y) };
  });
  withDist.sort((a, b) => (ascending ? a.dist - b.dist : b.dist - a.dist));
  return { openIdx, ranked: withDist };
}

/**
 * Open-reveal gather stage (masks the clip-lift bleed, PRD §4.5): every
 * other card converges under the open card, closest-first, fanned so a
 * sliver of each stays visible. Reuses deal's perCard/stagger/expo-out.
 */
export function gatherAround(openId: string, layout: TableLayout) {
  const { openIdx, ranked } = rankByDistance(openId, layout, true);
  ranked.forEach(({ id }, rank) => {
    cardHandles.get(id)?.gather(openIdx, rank, rank * MOTION.deal.stagger);
  });
  const total =
    Math.max(0, ranked.length - 1) * MOTION.deal.stagger + MOTION.deal.perCard + 100;
  setTimeout(() => useTableStore.getState().setOpenPhase("scaling"), total);
}

/**
 * Close-reveal scatter stage: mirrors gather — the fanned stack bursts back
 * out to each card's own grid slot, farthest-first, before the interaction
 * fully resets.
 */
export function scatterFromCenter(openId: string, layout: TableLayout) {
  const { ranked } = rankByDistance(openId, layout, false);
  ranked.forEach(({ id }, rank) => {
    cardHandles.get(id)?.scatter(rank * MOTION.deal.stagger);
  });
  const total =
    Math.max(0, ranked.length - 1) * MOTION.deal.stagger + MOTION.deal.perCard + 100;
  setTimeout(() => useTableStore.getState().finishClose(), total);
}

/**
 * Home <-> About dock-nav transition (hooks/useShowTableContent.ts,
 * components/dom/PlayArea.tsx): the deck slides off-table to the left and
 * fades, staggered like every other multi-card sequence in this file. The
 * reverse (entering Home) is decided per-card at its own mount time
 * instead (components/canvas/Card.tsx's startOffTable) — cards fully
 * unmount while off Home, so there's no continuously-mounted instance left
 * for an external orchestrator to reach on the way back.
 */
export function exitCardsOffTable() {
  const store = useTableStore.getState();
  store.cardOrder.forEach((id, i) => {
    cardHandles.get(id)?.exitOffTable(i * MOTION.tableNav.cardStagger);
  });
}

/** Shuffle (PRD §4.4): derangement + staggered curved travel. */
export function shuffleTable() {
  const store = useTableStore.getState();
  const assignment = store.shuffle();
  if (!assignment) return;

  const order = useTableStore.getState().cardOrder;
  order.forEach((id, i) => {
    const delay =
      i *
      (MOTION.shuffle.staggerMin +
        Math.random() * (MOTION.shuffle.staggerMax - MOTION.shuffle.staggerMin));
    cardHandles.get(id)?.shuffleTo(assignment[id], delay);
  });
}
