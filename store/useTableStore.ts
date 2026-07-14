import { create } from "zustand";
import { PROJECTS } from "@/data/projects";
import { CARD_COUNT } from "@/lib/layout";

export type CardPhase =
  | "dealing"
  | "idle"
  | "hovered"
  | "peeking"
  | "flipping"
  | "shuffling"
  | "gathering"
  | "opening"
  | "open"
  | "scattering"
  // Home <-> About dock-nav transition (lib/choreography.ts's
  // exitCardsOffTable/enterCardsFromOffTable) — the deck has slid off-table
  // and faded, or is mid-doing so; non-interactive like every other
  // non-idle phase (Card.tsx's isInteractive()).
  | "offTable";

export type OpenPhase =
  | "closed"
  | "flipping"
  | "gathering"
  | "scaling"
  | "open"
  | "closing"
  | "scattering";

export interface CardState {
  id: string;
  gridIndex: number;
  faceUp: boolean;
  phase: CardPhase;
}

export type AppPhase = "onboarding" | "dealing" | "table";

// Home <-> About table-nav phase: gates the deck-off-table-slide + "Pick a
// Card" heading exit (lib/choreography.ts's beginTableNavExit/
// exitCardsOffTable, hooks/useShowTableContent.ts). ControlDock itself no
// longer animates on route change (it persists across the route, see
// components/dom/ControlDock.tsx) — this phase exists purely for the
// deck/heading, which aren't hoisted into the canvas the same way. Kept
// independent of AppPhase, which is Home/onboarding-specific and would
// otherwise be meaningless on the About page. Persists across client-side
// route navigation since this store is a module-level singleton — the
// origin page sets "collapsing", the destination page's first render still
// sees it. A hard reload re-instantiates the store at "idle", which is the
// desired "render already settled, no animation" behavior for a direct load.
// "expanding" is also the permanent resting state once a nav has settled
// (there's no reset back to "idle" — the next collapse just starts from
// "expanding" again, since a page that arrived via nav can itself later
// become the origin of the next transition).
export type DockNavPhase = "idle" | "collapsing" | "expanding";

interface TableStore {
  cards: Record<string, CardState>;
  cardOrder: string[]; // stable render order (project order)

  appPhase: AppPhase;
  dealComplete: boolean;
  allRevealed: boolean;
  openCardId: string | null;
  openPhase: OpenPhase;

  shuffleCount: number;
  openedCardIds: Set<string>;

  dockNavPhase: DockNavPhase;
  // About page section-reveal (hooks/useAboutSectionsGate.ts): whether the
  // first-visit "dealt in" stagger for Hero/Run/Chips/Brands has already
  // played this session. Same "set once, never reset except a hard reload"
  // convention as dealComplete/dockNavPhase above — a plain boolean is
  // sufficient here (unlike dockNavPhase) since nothing else in the app
  // needs to react to an in-progress intermediate state, only "has it
  // happened yet."
  aboutSectionsRevealed: boolean;

  /** onboarding -> dealing, guarded no-op once already past onboarding. */
  startDealing: () => void;
  setDealComplete: () => void;
  setCardPhase: (id: string, phase: CardPhase) => void;
  setFaceUp: (id: string, up: boolean) => void;
  toggleRevealAll: () => void;
  /** Writes a derangement of grid indices; returns the new index per id. */
  shuffle: () => Record<string, number> | null;
  openCard: (id: string) => boolean;
  setOpenPhase: (p: OpenPhase) => void;
  closeCard: () => void;
  /** Called once the closing scale-down and the scatter-back settle. */
  finishClose: () => void;

  /** Starts the deck/heading table-nav exit. Guarded no-op (returns false)
   * unless a collapse isn't already in flight — covers double-clicking the
   * trigger. "expanding" (the resting state once a previous nav has
   * settled) is a valid starting point too, since a page that arrived via
   * nav can itself later trigger the next collapse (e.g. About settling in,
   * then the visitor clicking Back to Home). */
  beginDockCollapse: () => boolean;
  /** Called once the deck's off-table exit has finished, right before the
   * actual navigation (lib/choreography.ts's beginTableNavExit). Guarded
   * no-op unless currently "collapsing". Settles at "expanding" permanently
   * — there's no reset back to "idle"; the next collapse simply starts from
   * there. */
  beginDockExpand: () => void;

  /** Marks the About section-reveal as played. Guarded no-op if already
   * true — never resets (see aboutSectionsRevealed's doc comment above). */
  markAboutSectionsRevealed: () => void;
}

function initialCards(): { cards: Record<string, CardState>; order: string[] } {
  const cards: Record<string, CardState> = {};
  const order: string[] = [];
  PROJECTS.forEach((p, i) => {
    cards[p.id] = { id: p.id, gridIndex: i, faceUp: false, phase: "dealing" };
    order.push(p.id);
  });
  return { cards, order };
}

/** Fisher–Yates until no element keeps its slot (8 cards → always visible movement). */
function derangement(indices: number[]): number[] {
  const n = indices.length;
  for (let attempt = 0; attempt < 50; attempt++) {
    const next = [...indices];
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    if (next.every((v, i) => v !== indices[i])) return next;
  }
  // Statistically unreachable; rotate as a guaranteed derangement.
  return indices.map((_, i) => indices[(i + 1) % n]);
}

const init = initialCards();

export const useTableStore = create<TableStore>()((set, get) => ({
  cards: init.cards,
  cardOrder: init.order,

  appPhase: "onboarding",
  dealComplete: false,
  allRevealed: false,
  openCardId: null,
  openPhase: "closed",

  shuffleCount: 0,
  openedCardIds: new Set<string>(),

  dockNavPhase: "idle",
  aboutSectionsRevealed: false,

  startDealing: () => {
    if (get().appPhase !== "onboarding") return;
    set({ appPhase: "dealing" });
  },

  setDealComplete: () =>
    set((s) => ({
      appPhase: "table",
      dealComplete: true,
      cards: Object.fromEntries(
        Object.entries(s.cards).map(([id, c]) => [
          id,
          c.phase === "dealing" ? { ...c, phase: "idle" as CardPhase } : c,
        ]),
      ),
    })),

  setCardPhase: (id, phase) =>
    set((s) => ({ cards: { ...s.cards, [id]: { ...s.cards[id], phase } } })),

  setFaceUp: (id, up) =>
    set((s) => ({
      cards: { ...s.cards, [id]: { ...s.cards[id], faceUp: up } },
    })),

  // Guards live here, not in components: no-ops while dealing or while a
  // card is open (locked decision — dock disabled during open).
  toggleRevealAll: () => {
    const s = get();
    if (!s.dealComplete || s.openCardId !== null) return;
    const target = !s.allRevealed;
    set({
      allRevealed: target,
      cards: Object.fromEntries(
        Object.entries(s.cards).map(([id, c]) => [id, { ...c, faceUp: target }]),
      ),
    });
  },

  shuffle: () => {
    const s = get();
    if (!s.dealComplete || s.openCardId !== null) return null;
    const order = s.cardOrder;
    const current = order.map((id) => s.cards[id].gridIndex);
    const next = derangement(current);
    const assignment: Record<string, number> = {};
    const cards = { ...s.cards };
    order.forEach((id, i) => {
      assignment[id] = next[i];
      cards[id] = { ...cards[id], gridIndex: next[i] };
    });
    set({ cards, shuffleCount: s.shuffleCount + 1 });
    return assignment;
  },

  openCard: (id) => {
    const s = get();
    if (!s.dealComplete || s.openCardId !== null) return false;
    const card = s.cards[id];
    if (!card) return false;
    set({
      openCardId: id,
      openPhase: card.faceUp ? "gathering" : "flipping",
      openedCardIds: new Set(s.openedCardIds).add(id),
      cards: { ...s.cards, [id]: { ...card, phase: "opening" } },
    });
    return true;
  },

  setOpenPhase: (p) => set({ openPhase: p }),

  closeCard: () => {
    const s = get();
    if (s.openCardId === null || s.openPhase !== "open") return;
    set({ openPhase: "closing" });
  },

  finishClose: () => {
    const s = get();
    if (s.openCardId === null) return;
    set({
      openCardId: null,
      openPhase: "closed",
      cards: {
        ...s.cards,
        [s.openCardId]: { ...s.cards[s.openCardId], phase: "idle" },
      },
    });
  },

  beginDockCollapse: () => {
    if (get().dockNavPhase === "collapsing") return false;
    set({ dockNavPhase: "collapsing" });
    return true;
  },

  beginDockExpand: () => {
    if (get().dockNavPhase !== "collapsing") return;
    set({ dockNavPhase: "expanding" });
  },

  markAboutSectionsRevealed: () => {
    if (get().aboutSectionsRevealed) return;
    set({ aboutSectionsRevealed: true });
  },
}));

export const TOTAL_CARDS = CARD_COUNT;
