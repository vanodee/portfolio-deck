// Grid math shared by the canvas cards and the a11y buttons. Cards live in
// "content-local" space: origin at the content box's own center, 1 unit = 1
// CSS px, +Y up. The content box can be taller than the visible play-area
// frame (more rows than fit) — PlayArea.tsx turns the overflow into a real
// native scrollport, and Card.tsx converts content-local positions into true
// full-viewport world coordinates via contentPanOffset() on every frame.

import { PROJECTS } from "@/data/projects";

export type Breakpoint = "desktop" | "mobile";

export const MOBILE_BREAKPOINT = 767;

export const CARD_COUNT = PROJECTS.length;

// DS §3.1 / §4.1
export const DESKTOP = {
  cardW: 214,
  cardH: 300,
  pitchX: 274,
  pitchY: 360,
  cols: 4,
  outerPadX: 60,
  topPad: 96, // clearance under the pinned heading
  bottomPad: 48, // clearance above the scrollport's bottom edge
  // The original (Phase 1) design fit exactly 2 rows on screen at this
  // density with no scroll. Scale is pinned to whatever fits that 2-row
  // reference height, regardless of the actual row count — so today's 8
  // cards still render at the same size/density with no scrollbar, and
  // any rows beyond 2 simply extend the content height and scroll instead
  // of shrinking every card further.
  referenceRows: 2,
} as const;

// DS §4.2 — derived to preserve the 214:300 aspect ratio.
export const MOBILE = {
  cardW: 110,
  cardH: 154,
  gutter: 12,
  outerPad: 16,
  cols: 3,
  topPad: 64,
  // Below 767px the control dock restacks into a fixed-position vertical
  // column (ControlDock.module.css's max-width:767px block) that sits on
  // top of the card grid rather than beside it — 32px wasn't enough
  // clearance, so the last row stayed permanently hidden (and unclickable)
  // behind the dock even scrolled all the way down (responsive audit
  // finding). Derived from the stacked dock's own fixed mobile geometry:
  // 16px*2 padding + centerLogo(42) + toggleTrack-height row(53, the
  // tallest of the two button rows) + the other button row(45) + 2x32px
  // row-gap = 236px dock height, +12px bottom offset = 248px total
  // footprint from the viewport's bottom edge. Recompute if ControlDock's
  // mobile padding/row-gap/bottom offset or DockToggle's track height
  // change.
  bottomPad: 264,
} as const;

export interface CardLayout {
  /** World-space center of the card at this grid index. */
  x: number;
  y: number;
}

export interface TableLayout {
  cardW: number;
  cardH: number;
  positions: CardLayout[]; // indexed by gridIndex 0..CARD_COUNT-1
  deck: CardLayout; // entrance-deal origin
  contentWidth: number;
  contentHeight: number;
}

/**
 * @param availableHeight The play area's visible scrollport height (not the
 * content height — that's an output, `contentHeight`, and can exceed this).
 * Desktop uses it only to size cards against the original 2-row reference
 * density; mobile never height-scales (matches the pre-scroll design, which
 * only ever width-fit mobile cards).
 */
export function getLayout(
  breakpoint: Breakpoint,
  contentWidth: number,
  availableHeight: number,
): TableLayout {
  if (breakpoint === "mobile") {
    const { cardW, cardH, gutter, cols, outerPad, topPad, bottomPad } = MOBILE;
    // Scale cards up proportionally on wider phones (DS §4.2), capped so
    // three columns + padding always fit. Width-only — no height budget.
    const available = contentWidth - outerPad * 2;
    const scale = Math.min(1.25, available / (cols * cardW + (cols - 1) * gutter));
    const w = cardW * scale;
    const h = cardH * scale;
    const pitchX = w + gutter;
    const pitchY = h + gutter;
    const rows = Math.ceil(CARD_COUNT / cols);
    const contentHeight = topPad + (rows - 1) * pitchY + h + bottomPad;
    const positions: CardLayout[] = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const inRow = Math.min(cols, CARD_COUNT - row * cols);
      const rowW = inRow * pitchX - gutter;
      const rowCenterFromTop = topPad + row * pitchY + h / 2;
      positions.push({
        x: -rowW / 2 + w / 2 + col * pitchX,
        y: contentHeight / 2 - rowCenterFromTop,
      });
    }
    const deck = { x: 0, y: contentHeight / 2 - (topPad + h / 2) };
    return { cardW: w, cardH: h, positions, deck, contentWidth, contentHeight };
  }

  const {
    cardW,
    cardH,
    pitchX,
    pitchY,
    cols: maxCols,
    outerPadX,
    topPad,
    bottomPad,
    referenceRows,
  } = DESKTOP;
  const referenceGridH = (referenceRows - 1) * pitchY + cardH;
  const heightScale = Math.min(1, (availableHeight - topPad - bottomPad) / referenceGridH);
  // A hard mobile/desktop breakpoint used to force maxCols (4) columns the
  // instant a viewport crossed 767px, even though 4 full-size columns need
  // ~1360px+ of contentWidth to actually fit — cards got visibly SMALLER
  // moving from the mobile grid into "desktop" (responsive audit finding,
  // DS §4.1 gap). Comparing maxCols against one fewer column and keeping
  // whichever yields the larger scale means a narrower "desktop" viewport
  // renders 3 wide columns instead of 4 cramped ones, and the switch to 4
  // only happens once it no longer shrinks anything relative to 3 — the
  // crossover is continuous by construction, not a guessed pixel breakpoint.
  const scaleFor = (n: number) => {
    const gridW = (n - 1) * pitchX + cardW;
    return Math.min(heightScale, (contentWidth - outerPadX * 2) / gridW);
  };
  const narrowScale = scaleFor(maxCols - 1);
  const wideScale = scaleFor(maxCols);
  const cols = wideScale >= narrowScale ? maxCols : maxCols - 1;
  const scale = cols === maxCols ? wideScale : narrowScale;
  const w = cardW * scale;
  const h = cardH * scale;
  const stepX = pitchX * scale;
  const stepY = pitchY * scale;
  const rows = Math.ceil(CARD_COUNT / cols);
  const contentHeight = topPad + (rows - 1) * stepY + h + bottomPad;
  const positions: CardLayout[] = [];
  for (let i = 0; i < CARD_COUNT; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    // Centers each row independently on its own card count, so a partial
    // last row (fewer than `cols` cards) centers instead of hugging the
    // left edge — identical result to the old fixed formula when the row
    // is full.
    const inRow = Math.min(cols, CARD_COUNT - row * cols);
    const rowW = (inRow - 1) * stepX;
    const rowCenterFromTop = topPad + row * stepY + h / 2;
    positions.push({
      x: -rowW / 2 + col * stepX,
      y: contentHeight / 2 - rowCenterFromTop,
    });
  }
  const deck = { x: 0, y: contentHeight / 2 - (topPad + h / 2) };
  return { cardW: w, cardH: h, positions, deck, contentWidth, contentHeight };
}

/**
 * Reading-pane geometry shared by the open-card animation (canvas) and the
 * DOM overlay, so the scaled card mesh lands exactly behind the pane. Always
 * true-viewport-relative — the reading view grounds in the viewport
 * regardless of the play area's scroll position (DS §5).
 */
export function getReadingPane(viewportW: number, viewportH: number) {
  const mobile = viewportW <= MOBILE_BREAKPOINT;
  const width = mobile ? viewportW - 16 : Math.min(680, viewportW - 32);
  const top = mobile ? 8 : Math.max(24, viewportH * 0.06);
  return { width, top };
}

/**
 * Content-local center → content-local top-left rect, for the a11y buttons.
 * They're real DOM children of the native scrollport, so no viewport or
 * scroll-offset math is needed — the browser scrolls them for free.
 */
export function worldToContentRect(layout: TableLayout, pos: CardLayout) {
  return {
    left: layout.contentWidth / 2 + pos.x - layout.cardW / 2,
    top: layout.contentHeight / 2 - pos.y - layout.cardH / 2,
    width: layout.cardW,
    height: layout.cardH,
  };
}

export interface FrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Converts a card's content-local position into the translation that lands
 * it at its true full-viewport world coordinate (canvas origin = viewport
 * center). Card.tsx applies this per-frame, imperatively, and unconditionally
 * — including for the currently-open card, whose position spring targets a
 * content-local coordinate too (computed by inverting this same offset), so
 * pan never has to jump discretely at an open/close phase boundary.
 */
export function contentPanOffset(
  layout: TableLayout,
  frameRect: FrameRect,
  scrollTop: number,
  viewportW: number,
  viewportH: number,
) {
  const screenX = frameRect.left + layout.contentWidth / 2;
  const screenY = frameRect.top - scrollTop + layout.contentHeight / 2;
  return {
    x: screenX - viewportW / 2,
    y: viewportH / 2 - screenY,
  };
}

// How far down the viewport (as a fraction of viewport height) the
// onboarding deck rests — independent of the real entrance-deal position.
export const ONBOARDING_REST_CENTER_FRACTION = 0.48;

/**
 * Content-local Y that lands the onboarding deck at centerFraction of the
 * viewport height. Derived from contentPanOffset's own screenY math (with
 * scrollTop always 0 pre-deal): screenPixelY = frameRect.top +
 * contentHeight/2 - posY. layout.deck.y never enters this — the onboarding
 * rest position is fully independent of the real deal-entrance position.
 */
export function onboardingRestY(
  layout: TableLayout,
  frameRect: FrameRect,
  viewportH: number,
  centerFraction: number = ONBOARDING_REST_CENTER_FRACTION,
): number {
  return frameRect.top + layout.contentHeight / 2 - viewportH * centerFraction;
}
