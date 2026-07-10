// Imperative per-card animation handles, registered by each Card on mount.
// Choreography functions (bulk reveal, deal, shuffle) drive all cards with
// per-card delays through this registry instead of prop-drilling springs.

export interface CardHandle {
  /** Animate the flip to a face state (DS §6 flip timing). */
  flip: (faceUp: boolean, delayMs?: number) => void;
  /** Entrance deal: travel from deck to grid position (Phase 4). */
  deal: (delayMs: number) => void;
  /** Shuffle travel to a new grid position (Phase 4). */
  shuffleTo: (gridIndex: number, delayMs: number) => void;
  /** Open-reveal gather stage: converge/stack fanned under the open card. */
  gather: (openGridIndex: number, gatherRank: number, delayMs: number) => void;
  /** Close-reveal scatter stage: burst back out to this card's own grid slot. */
  scatter: (delayMs: number) => void;
  /** Onboarding-only: start the looping overhand-shuffle merge/cut cycle. */
  onboardingShuffleStart: () => void;
  /** Onboarding-only: stop the loop (ascendToDeck's takeover supersedes it anyway). */
  onboardingShuffleStop: () => void;
  /** Onboarding-only: rise from the shuffle rest position to the real deck position, before deal(). */
  ascendToDeck: (delayMs: number) => void;
  /** Home <-> About dock-nav transition: slide off-table to the left and
   * fade, from wherever the card currently rests. */
  exitOffTable: (delayMs: number) => void;
  /** Reverse of exitOffTable: slide back to this card's own grid slot and fade in. */
  enterFromOffTable: (delayMs: number) => void;
}

export const cardHandles = new Map<string, CardHandle>();
