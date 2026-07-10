# Design System: Card Table Portfolio

**Status:** Draft v14 — derived from Figma source file; About page routing/route-transition, the Chip component (from user-provided SVG exports), the Brand Card component (net-new, no Figma source), and the Photo Card / Experience Card components (from Figma, with confirmed deviations — see §3.9/§3.10) added post-Figma; About page section layout (§3.11) added post-Figma, structure/content only; Photo Card spread hover interaction (§3.9) and tool/brand grid flex-wrap layout (§3.11) added post-Figma
**Source:** [Portfolio Deck](https://www.figma.com/design/8ENJvHnX9pC73D9qUn7SN6/Portfolio-Deck) (node `1:2408`, "Main Elements")
**Last updated:** July 10, 2026

This document captures only what's confirmed — either extracted directly from the Figma file or explicitly stated. Anything not listed here is still open.

---

## 1. Color

### 1.1 Table surface
Radial gradient, center anchored at mid-top of the page.

| Token | Hex | Role |
|---|---|---|
| `table-center` | `#186245` | Gradient center — felt green |
| `table-edge` | `#030F0A` | Gradient outer — near-black, vignette |

### 1.2 Card back
| Token | Value | Role |
|---|---|---|
| `card-back-bg` | `#130A5D` | Deep indigo-navy fill |
| `card-back-border` | `#FFFFFF` @ 100% | 1px inner border, inset from card edge |
| `card-back-trace` | *(unresolved — baked into raster asset)* | Circuit trace linework color |

### 1.3 Card front
| Token | Value | Role |
|---|---|---|
| `card-front-bg` | `#FFFFFF` | Card shell background |
| `card-front-text` | `#1C1C1C` | Title, category/date text |
| `card-front-watermark` | `#000000`-based logo @ 5% opacity | Behind text block, decorative only |

### 1.4 Control dock
Two-layer liquid glass: an outer pill container and a brighter, nested
button/logo layer, each with its own `backdrop-filter` blur — the first use
of real backdrop blur anywhere in this codebase (previously the "glass" look
was gradient-only, no blur).

| Token | Value | Role |
|---|---|---|
| `dock-fill` | `linear-gradient(160deg, rgba(255,255,255,0.12) 0%, rgba(8,24,18,0.42) 45%, rgba(3,15,10,0.58) 100%)` | Outer pill container fill — tinted off `table-center`/`table-edge`, not neutral black |
| `dock-border` | `rgba(255,255,255,0.32)` | Outer pill 1px outline |
| `dock-shadow` | `0px 16px 32px rgba(3,15,10,0.45)` | Outer pill elevation shadow (same rgb/logic as `shadow-opened`, scaled down) |
| `dock-blur` | `blur(16px) saturate(1.6)` | Outer pill `backdrop-filter` |
| `dock-button-border` | `rgba(255,255,255,0.3)` | 1px button outline |
| `dock-button-fill` | `linear-gradient(135deg, rgba(255,255,255,0.06) 15%, rgba(255,255,255,0.3) 85%)` | Glass-chip fill — brightened/widened so buttons still read as a distinct layer over the now-visible outer pill fill |
| `dock-button-shadow` | `4px 4px 8px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.55), inset 0 -1px 2px rgba(0,0,0,0.25)` | Drop shadow + inset specular highlight/shade, all dock buttons — dropped only while a button is actively pressed (§3.3) |
| `dock-button-blur` | `blur(20px) saturate(1.4)` | Per-button `backdrop-filter` |
| `dock-icon` | `#FFFFFF` | Monochrome icon fill — eye, shuffle, resume, about (Home dock); email, linkedin, twitter, resume, cards (About dock, §3.6) |

### 1.5 Table typography
| Token | Value | Role |
|---|---|---|
| `heading-color` | `#FFFFFF` @ 20% opacity | "Pick a Card" watermark heading |
| `tagline-color` | `#FFFFFF` @ 100% | Wordmark tagline |
| `body-text-color` | `#FFFFFF` @ 72% opacity | About page body copy (Hero intro, House Rules paragraphs, §3.11) — first on-felt body-copy token; previously only heading/label tokens existed |

**Confirmed dropped:** cyan is not part of the system. Brass gold returns, but scoped narrowly — see 1.6.

### 1.6 Card state color

No new "accent" token was added for hover — hover is communicated through motion and elevation (lift, scale, shadow, glow), not a color shift. See §7 for the full elevation/motion spec.

| Token | Value | Role |
|---|---|---|
| `card-hover-glow` | `#FFFFFF` @ low opacity (~12–18%), soft blur | Outer glow on hover, normal cards |
| `card-back-trace` | `#FFFFFF` (same as `card-back-border`) | Default circuit trace color — no separate token needed |

### 1.7 Flagship card (gold variant)

The dealer's-choice/flagship card (PRD §4.7) is the **only** place gold appears. On this card, every white element on both faces shifts to gold — front and back.

| Token | Value | Role |
|---|---|---|
| `flagship-gold` | `#B8860B` (warm antique gold) | Replaces white on: card-back border, circuit trace, card-back logo mark; and on hover glow for this card only |

Everything else on the flagship card (navy back fill, white card-front shell, `#1C1C1C` text) stays standard — only the "white" elements convert to gold.

**Ambient glow (resolved):** beyond the interactive hover glow (§1.6/§5), the flagship card also carries an always-on, slow soft gold pulse — visible at rest, independent of hover state and of which face (front/back) is showing, since the glow mesh sits outside the flip-rotation subtree like the hover glow. See §6 for timing.

---

## 2. Typography

Two typefaces, with a strict division of labor — this is intentional, not a placeholder pairing:

### 2.1 Meow Script — decorative, table-level only
Reserved **exclusively** for aesthetic/atmospheric text directly on the table surface: instructional messaging ("Pick a Card"), and future embellishment on the About page. **Never used for functional or utilitarian UI.**

| Use | Size | Color |
|---|---|---|
| "Pick a Card" heading | 96px | white @ 20% |
| About page hero heading ("Nice to meet you...", §3.11) | `clamp(40px, 6vw, 72px)` | `tagline-color` (white @ 100%) |
| About page section headings (The Run, House Rules, Chips up my sleeve, Tables I've Played, Ready to deal?, §3.11) | `clamp(32px, 4.5vw, 56px)` | `tagline-color` (white @ 100%) |

### 2.2 Outfit — all utilitarian text
Everything else: card content, labels, dock-adjacent text, body copy in the opened reading view.

- **Regular** and **Medium** are the working weights.
- **Semibold** reserved for cases only where absolutely necessary (strong emphasis, not default hierarchy).

| Use | Weight | Size | Tracking | Color |
|---|---|---|---|---|
| Card title | Medium | 20px | normal | `#1C1C1C` |
| Card category/date | Light | 6px | 2.4px, uppercase | `#1C1C1C` |
| Wordmark tagline | Regular | 12px | normal | white |

Note: Light appears once (category/date micro-label) despite the "Regular/Medium primarily" rule — treat that as the confirmed exception for small tracked-out labels rather than a contradiction.

---

## 3. Components

### 3.1 Card Back
- Frame: 214×300px, 8px padding, 4px outer corner radius
- Fill: `card-back-bg`, 2px inner corner radius
- Circuit trace: procedural SVG, centered, rotated 90°, clipped to a 192×279px window
- Inner border: 1px white, inset (194×280px), 2px radius — reads as a card "frame"
- Center mark: logo monogram, 50×46px, centered

### 3.2 Card Front
- Frame: 214×300px, 8px padding, 4px outer corner radius, white fill
- Image block: bleeds past the card's left/right edges (−54px each side) and top (−10px), aspect ratio 1153:634 — the photo intentionally overflows the card boundary rather than sitting inset
  - *Implementation note (Phase 1):* on the WebGL card a texture cannot paint outside the mesh, so the bleed is reproduced as an oversized crop clipped at the card silhouette — same composition, no literal overflow. If literal overflow is ever required, it needs a separate oversized image plane.
- Text block: anchored bottom, 127px tall, 18px top / 8px bottom / 8px side padding
- Watermark: logo mark at 5% opacity, 106×98px, sits behind the text block

### 3.3 Control Dock
- Two-layer liquid glass: an outer pill container (`dock-fill`, `dock-border`, `dock-shadow`, `dock-blur` backdrop-filter) with the button/logo group as a second, brighter nested glass layer inside it — not a flat frosted-chip look, a real `backdrop-filter` blur that refracts the table/cards behind the dock
- Layout is CSS Grid (`grid-template-columns: 1fr auto 1fr`), not flexbox — the two equal-width outer tracks guarantee the center logo stays truly centered regardless of how many buttons sit in each group (flex `justify-content:space-between` only splits free space between adjacent siblings, so it can't guarantee true centering once the groups hold unequal button counts)
- Explicit pill width: `min(500px, calc(100vw - 64px))` desktop, `calc(100vw - 24px)` mobile — no longer shrink-wrapped; 16px horizontal padding, 8px vertical, 16px column gap between groups and logo, 16px gap within each group
- **Left group** (card controls, pinned to the pill's left edge): **Visibility Toggle** (eye), **Shuffle**
- **Right group** (pinned to the pill's right edge): **Resume**, **About** — About triggers the Home <-> About route transition (§3.6); Resume opens a placeholder link pending a real destination (`lib/aboutLinks.ts`)
- The About page (`/about`) has its own dock instance, same pill layout/sizing/glass tokens, different buttons — left group **Email, LinkedIn, X**; right group **Resume, Back to Home**. See §3.6.
- Each button: 45px circle, `999px` radius, `dock-button-border`, `dock-button-fill`, `dock-button-shadow`, `dock-button-blur` backdrop-filter — a nested glass "bubble" brighter than the outer pill
- Icon: 30×30px, centered, monochrome white
- Button interaction states:
  - **Hover** (pointer devices only, `(hover: hover) and (pointer: fine)` — never engages on touch, which has no way to "un-hover" and would otherwise leave a button stuck scaled up): scales to `1.08×`, 160ms ease
  - **Press** (`:active`, all input types): scales down to `0.92×` and the button's drop shadow/inset highlight drops out entirely, reading as physically pushed flat into the glass — snappier, 90ms
  - **Toggled on** (`.buttonActive`, e.g. reveal-all engaged): border brightens and a second, brighter gradient layer crossfades in behind the icon via a `::before` overlay rather than animating `background` directly (gradients can't interpolate smoothly through a `background-color`-style transition; opacity can) — 200ms ease
  - All other property changes (border-color, opacity, box-shadow) transition on the same 160–200ms ease rhythm so no state change ever snaps
- Visibility Toggle icon crossfades between two states rather than snapping — closed eye (`closed_eye.svg`, covered/default) and open eye (`eye.svg`, revealed/active) stack in place and cross-fade opacity over 220ms ease
- Center logo mark sits in the grid's true-centered middle column, with an inset shadow (`inset 0px 1px 2px rgba(0,0,0,0.55)`) for a subtle embossed effect, plus a faint fill + small blur (`blur(8px) saturate(1.3)`, inlined in `ControlDock.module.css` — component-local, not a shared token) so it reads as part of the same glass language

### 3.4 Table Header
- Wordmark (SVG logo lockup) + "Designer • Developer • AI-Fluent Builder" tagline, top-left
- "Pick a Card" script heading, top-center

### 3.5 Onboarding Gate (pre-table)

**Resolved (Phase 1 build, July 2026):** a new phase, preceding the entrance deal, that gates the whole table behind one deliberate click on the deck. Two independent fixed DOM layers sit either side of the WebGL canvas (text behind, logo in front), plus an onboarding-only shuffle loop on the cards themselves and a formation sequence on the control dock:

- **Text layer:** "Hello!" in Meow Script (same treatment as "Pick a Card," §2.1 — white @ 50% opacity here vs. 20% for "Pick a Card"), plus a "Tap the deck to deal yourself in" subheading using the same recipe as the table header's tagline (§1.5/§2.2). Centered, top of viewport.
- **Logo layer:** a standalone wordmark mark, floating near the bottom of the viewport, independent of the control dock until the deck is clicked.
- **Deck (cards):** instead of a static stack, all cards loop a continuous lateral "overhand shuffle" — cut apart on the X-axis into two piles, hold, recombine, hold, repeat — staggered per card. Rest position is below the real entrance-deal deck position, at a fixed fraction of viewport height (`ONBOARDING_REST_CENTER_FRACTION`, `lib/layout.ts`) rather than tied to the real deck coordinate.
- **On click (the only exit from this phase):** the text layer fades out; the standalone logo travels/scales via a shared-element transition onto the control dock's own center logo, crossfading into it on arrival; the cards rise from their shuffle rest position up to the real deck position; the entrance deal (§4.1) then plays as before.
- **Dock formation:** the control dock is fully hidden (0-opacity, clipped to a small ellipse around where its center logo will resolve) through onboarding. Once the traveling logo arrives and crossfades in, the dock's clip-path expands from that small ellipse to its full pill shape, and each button group staggers in from the center outward.
- **Header/heading reveal:** the table header (wordmark/tagline) and "Pick a Card" heading stay hidden through onboarding + dealing, then fade/translate in once the deal completes — header first, heading immediately after (see §6 for exact delays).
- The play area's dashed border (§4.3) is also invisible through onboarding, fading in (alpha only) the moment the deck is clicked — independent of the deal itself finishing.

**Still open:** the specific timing constants for this phase (shuffle cut/hold durations, logo travel, dock formation, header/heading delays — `MOTION.onboardingShuffle` / `MOTION.onboarding` in `lib/motion.ts`) are implemented and functional but explicitly flagged in code as placeholder values pending a dedicated tuning pass, not yet signed off the way the rest of §6 is.

### 3.6 Home <-> About Route Transition

**Resolved (Phase 1 build, July 2026):** the dock's About button navigates to a dedicated `/about` route (resolving §7 item 7 / PRD §10's "About panel treatment") rather than opening an in-page overlay. The transition reuses the onboarding-formation choreography (§3.5) bidirectionally rather than inventing a second animation language:

- **Exit** (About click on Home, or Back to Home click on About): the dock's button groups stagger inward toward center and the pill's clip-path contracts to the small rest-state ellipse (mirror of §3.5's stagger-in/expand), the center logo hands off to a fresh standalone-logo instance that crossfades in and travels back out to the standalone/floating position (reverse of the onboarding logo-travel FLIP), and — Home-side only — the deck slides off-table to the left while fading, with the "Pick a Card" heading fading out and translating upward. Only once this settles does the actual route change fire.
- **Enter** (About page forming, or Back to Home landing): the identical sequence plays forward — the standalone logo travels into the dock's center, the pill expands, buttons stagger in — exactly like the original onboarding formation, just replayed at the new route.
- **About's own dock** (`AboutDock`): same pill layout/sizing/glass tokens as the Home dock (§3.3) — left group **Email, LinkedIn, X**; right group **Resume, Back to Home**. All one-shot actions, no new interaction states.
- **Persistent chrome:** the table header (wordmark/tagline, §3.4) and the play area's frame/dashed border (§4.3) persist across both routes rather than remounting — on `/about` they render immediately regardless of Home's deal state, since Home's onboarding-gated hide/reveal (§3.5) is a Home-only concept. Home's cards, canvas, and open-card overlay are route-gated and never render on `/about`.
- **Direct-load case:** a direct load of `/about` (bookmark, typed URL) renders the dock already fully formed, with no animation — mirrors how a direct load of `/` only skips onboarding once a deal has actually completed.
- **Skipping onboarding on return:** clicking Back to Home forces the deal to "complete" before Home mounts, even if `/about` was reached without ever dealing on Home this session — so the deck always translates into frame already dealt rather than showing the onboarding gate.

New motion tokens for this transition live in `MOTION.tableNav` (`lib/motion.ts`) — the dock/logo portion reuses §3.5's `logoTravel`/`dockCrossfade`/`dockFormation` verbatim; the deck/heading-specific values are new (see §6), flagged with the same placeholder-pending-tuning caveat as §3.5.

### 3.7 Chip (stat / tool)

**Resolved (Phase 1 build, July 2026):** a poker-chip visual component (`components/dom/Chip.tsx`), built for the About page's Hero (stat chips) and Tools (tool chips) sections. **Now placed** (§3.11) — two inline stat-chip instances in the Hero section, and a 19-entry tool-chip grid ("Chips up my sleeve") sourced from `data/tools.ts`. One component, `variant: 'stat' | 'tool'` prop, sharing all structural layers; only the content slot and interactivity differ per variant.

- **Source:** geometry, gradients, and filters are transcribed verbatim from user-provided Figma SVG exports (`public/assets/referneces/stat.svg`, `tool.svg` — note the "referneces" spelling is the actual folder name on disk). These are *not* pulled from the live Figma file: MCP extraction of these layers returned only flattened rasters with no vector/fill data, so real exports were required for pixel-accurate reproduction. Native SVG size 200×202px.
- **Layer structure** (bottom to top): chip-structure (SVG) → content (HTML, per-variant) → light/gloss (SVG) — matches the Figma layer order.
  - Chip-structure: a drop shadow (main disc offset 6px down, darkened), the base disc, 6 fixed white "edge-spot" marks (a plain circular silhouette with inset marks — not protruding gear teeth, despite how they read at thumbnail size), a beveled ring (inner-shadow filters), and a center disc with its own drop-shadow filter for a recessed look. Every fill that was a literal color in the Figma source now takes the instance's `color` prop; the white/black layers stay fixed regardless of color — this is what makes the chip recolorable from one prop.
  - Light/gloss: a fixed white radial gradient (55%→4%→0% opacity), offset upper-left, no color prop — identical for both variants.
  - SVG filter/gradient IDs are generated per-instance (React `useId()`) so multiple chips on one page don't collide.
- **Sizing:** stat chip renders at 150px wide, tool chip at 100px wide (both via CSS custom properties `--chip-w`/`--chip-h`, scaled proportionally from the 200×202 SVG baseline, preserving aspect ratio). Content (text/logo) sizes scale proportionally from that same 200px baseline.
- **Stat variant:** non-interactive. Two-line centered text — value (24px) and label (8px), Outfit Medium, white.
- **Tool variant:** centered logo image (30px). Hover reuses the existing `MOTION.hover` token (§6) verbatim — lift 14px, scale 1.03×, 220ms ease-out in / 320ms ease-in-out out — making this the first DOM/CSS consumer of that token (previously canvas-only, on the R3F cards); Brand Card (§3.8) is now a second, applied via Framer Motion variants rather than a plain CSS transition. A name label reveals in a reserved gap below the chip: the wrapper reserves chip + 6px gap + 20px label slot at rest, so hover never reflows sibling chips, and hover binds to the whole wrapper rather than just the chip, so the cursor sitting in the revealed gap doesn't drop outside the hover hit-box mid-animation. Label background always matches the chip's own `color` prop (no separate override); label text is 12px, `card-front-text` (§1.3).
- **Shadow:** both variants rest with a `filter: drop-shadow()` using the existing `shadow-rest` token (§5) — follows the SVG's actual circular silhouette rather than drawing a box shadow's rectangle. The tool variant's shadow animates to the `shadow-hover` token (§5, new) on hover, alongside the lift, simulating the chip rising off the table.

### 3.8 Brand Card

**Resolved (Phase 1 build, July 2026):** a small interactive card component (`components/dom/BrandCard.tsx`), built for the About page's "Tables I've Played" section (past clients/brands). **Now placed** (§3.11) — a 19-entry grid, `data/brands.ts` extended from its original 4 placeholder entries to fill out the reference's 4-column density (one short of a full last row, deliberately — see §3.11's flex-wrap note).

- **Frame:** 230×150px `<button>`, 1rem padding, 1px `flagship-gold` (§1.7) border that stays unchanged across every state, `overflow: hidden`, no fill at rest.
- **Rest state:** brand name, all-caps white text, centered — reuses the table header wordmark *name's* tracking (`TableHeader.module.css` `.name`: 14px, weight 300, `letter-spacing: 0.5em` — not yet its own row in §2.2's typography table, which only covers card title/category-date/tagline; flagged rather than silently added, since retrofitting that table is a separate decision) in preference to the tighter 2.4px category/date tracking or the tagline's 0.1em. `text-transform: uppercase` is applied explicitly rather than relying on source-string casing, since brand names are data-driven.
- **Reveal state (desktop hover or touch tap):** background fades transparent → white; border stays unchanged; the name translates upward and fades out (clipped by the frame's `overflow: hidden`), then the logo (`<img>`, `object-fit: contain`, aspect ratio always preserved, never stretched/cropped) translates upward and fades in from below, settling where the name was. Only one of {name, logo} is ever mounted at a time (Framer Motion `AnimatePresence`, keyed swap) — the DOM-animated equivalent of Chip's "fixed frame + swappable content" idea (§3.7), not two permanently-stacked layers. A single 20px travel-distance constant drives both elements symmetrically (each element's `initial` and `exit` share the same offset), so the un-reveal direction falls out as the natural mirror rather than a separately authored animation.
- **Timing:** reuses `MOTION.hover` (§6) verbatim — 220ms ease-out in / 320ms ease-in-out out — making this the second DOM consumer of that token after Chip's tool-variant hover (§3.7), and the first applied via Framer Motion variants rather than a plain CSS `:hover` transition.
- **Hover/touch gating — deviates from §3.3's mechanism:** the dock buttons gate real hover behind a CSS `@media (hover: hover) and (pointer: fine)` query, but that can't drive an `AnimatePresence` mount/unmount swap. Brand Card instead tracks real hover via `onPointerEnter`/`onPointerLeave`, gated to `event.pointerType === "mouse"` — the JS-layer equivalent of the same gating intent (touch pointers never set the hover flag), not a literal reuse of the CSS mechanism. A tap-driven `revealed` prop (from the parent grid) combines with this hover state into one `isRevealed` boolean. The click handler is separately gated: keyboard activation (`event.detail === 0`) always toggles the tap state (hover has no keyboard equivalent), touch-only devices toggle, and real mouse clicks on hover-capable devices do not (hover alone drives the reveal there, avoiding a double-toggle).
- **Exclusivity:** only one Brand Card may be tap-revealed at a time within its grid — page-scoped local state owned by the grid's parent container, not `store/useTableStore.ts`. Distinct from, but conceptually parallel to, PRD §4.5's "only one card can be open at a time" rule for the table itself.
- **Accessibility:** `aria-pressed={isRevealed}` and `aria-label` set to the brand's name on the button; `:focus-visible` outline matches `A11yCardButtons.module.css` (`2px solid rgba(255,255,255,0.9)`, 4px offset) — added so keyboard users, who have no hover equivalent, can still trigger the reveal.
- **Data shape:** a `Brand` interface (`id`, `name`, `logoSrc`) in `data/types.ts`, mock instances in `data/brands.ts` — same Phase 1 mock-data convention as `data/projects.ts` (a future CMS swap should only touch that file).

### 3.9 Photo Card

**Resolved (Phase 1 build, July 2026):** a small always-face-up card component (`components/dom/PhotoCard.tsx` + `PhotoCardSpread.tsx`), built for the About page's Hero section. **Now placed** (§3.11) — the Hero's 2-entry `data/photos.ts` set, right of the intro copy/stat chips. Sourced from Figma node `52:2161` (file `8ENJvHnX9pC73D9qUn7SN6`).

- **Frame:** 214×300px, `card-front-bg`, 4px outer corner radius, `shadow-rest` elevation — same base dimensions as Card Front (§3.2), but **24px padding, not 8px**, and no flip state (always face-up). **Confirmed deviation from §3.2**, per Figma.
- **Corner marks:** two small opaque monogram marks (not §3.2's single 5%-opacity watermark) — a new asset, `public/assets/icons/card-corner-mark.png` (sourced from Figma node `52:2168`), used unrotated at both top-left (6px, 6px inset; 17.38×16px) and bottom-right (7px, 8px inset; 17×16px). **Confirmed deviation from §3.2** — Photo Card and Experience Card (§3.10) are the first, and so far only, consumers of this corner-mark treatment; the Home project card's single watermark is unchanged.
- **Image block:** 216px tall, full content width, `object-fit: cover`, 2px inner radius — a simplified equivalent of Figma's literal oversized/offset crop (same visual result, no negative-offset percentages to replicate in DOM).
- **Text block:** name (Outfit Medium, 15px, `card-front-text`, centered) + subtitle (Outfit Light, 6px, 2.4px tracking, uppercase, `card-front-text`, centered) — the subtitle reuses §2.2's category/date micro-label recipe verbatim rather than Figma's raw exported value (4px size, 1.6px tracking), which was judged an implausible Figma-export scaling artifact (illegible at that size on a 214px-wide card) and confirmed against Experience Card's date-range field (§3.10), which exports at the exact §2.2 values.
- **Data shape:** `PhotoCardData` (`id`, `image`, `name`, `subtitle`) in `data/types.ts`, mock instances in `data/photos.ts` — 2 placeholder entries (only 2 real placeholder images provided), same Phase 1 mock-data convention as `data/brands.ts`/`data/projects.ts`.
- **Spread behavior:** capped at 3 cards, array-driven (`PHOTOS.map`, not fixed JSX instances). Stacked with a per-rank peek offset/rotation — a generous peek (not a tight/subtle one) so the non-front card(s) read clearly behind the front card, per the reference images. Clicking or keyboard-activating (Enter/Space) anywhere on the spread promotes the next card in fixed order to the front, round-robin (1→2→3→1...). New motion tokens, `MOTION.photoSpread` (`lib/motion.ts`): `offsetXStepPx` 34, `offsetYStepPx` 22, `rotationStepDeg` 7, `cycleDuration` 380ms — a dedicated new geometry, not a reuse of `MOTION.gather`'s fan constants (§3.10 explains why that reuse is intentionally avoided).
- **Hover widens the fan (Phase 1 build, July 2026):** hovering anywhere on the spread (mouse only — `pointerType === "mouse"` gating, same touch-safety convention as Brand Card §3.8, so a tap can't leave the fan stuck open) increases the back cards' per-rank rotation from `rotationStepDeg` (7°) to `hoverRotationStepDeg` (14°). The front (rank 0) card sits outside that rank×step formula — normally pinned at a flat 0° regardless of rank — so without its own reaction it read as dead/static next to the fanning cards behind it; it now tilts to `frontHoverRotationDeg` (−6°) on hover, opposite the back cards' direction, so the whole spread reads as pivoting apart from a shared pivot rather than an inert top card with only its backing cards moving. Reuses the existing `cycleDuration`/ease-out tween (no separate hover-timing token) for both the widen-in and settle-out.

### 3.10 Experience Card

**Resolved (Phase 1 build, July 2026):** a small always-face-up, non-interactive card component (`components/dom/ExperienceCard.tsx` + `ExperienceCardSpread.tsx`), built for the About page's Experience section. **Now placed** (§3.11) — "The Run" section, the existing 4-entry `data/experience.ts` set. Sourced from Figma node `54:2197`.

- **Frame:** same 214×300px shell, 24px padding, and corner-mark treatment as Photo Card (§3.9) — both confirmed deviations from §3.2 apply here too.
- **Inner content box:** a bordered box (1px `rgba(0,0,0,0.1)`, 2px radius) filling the padded content area, with its text **vertically centered** rather than bottom-anchored (unlike the Home project card's Card Front, §3.2, and unlike Photo Card's bottom-anchored text, §3.9).
- **Text block:** date range (Outfit Light, 6px, 2.4px tracking, uppercase, centered — an exact match to §2.2's category/date micro-label recipe) + title (Outfit Medium, 14px, centered) + company (Outfit Regular, 8px, centered).
- **Data shape:** `ExperienceCardData` (`id`, `title`, `dateRange`, `company`) in `data/types.ts`, mock instances in `data/experience.ts` — 4 placeholder roles, most-recent-first.
- **Spread behavior:** capped at 4 cards (most recent roles only — older history lives on the resume), static/non-interactive, array-driven (`EXPERIENCE.map`). Forms a symmetric bow: cards are rotated outward from center (alternating left/right) and each card's vertical position drops the further it sits from center, so center cards ride highest and the two edge cards dip lowest — the silhouette of a hand of cards fanned around a pivot below, matching the reference images (not a "cup" shape with edges raised). Fanned via new motion tokens, `MOTION.experienceFan` (`lib/motion.ts`): `xStepPx` 190, `rotationStepDeg` 7, `liftPx` 26 — a dedicated new fan geometry, **explicitly not a reuse or edit of `MOTION.gather`'s `fanStepPx`/`fanAngleStepRad`/`fanMaxRank`** (those are signed-off WebGL open-card 3D stack constants tuned for a different purpose, PRD §4.5). This spread's constraint is stricter than `gather`'s peeking-stack overlap: every card's text block must stay fully unobstructed at any rank. `xStepPx` (190) was tuned specifically for this — an initial 168px value let a higher-stacked neighbor cover ~14px of the previous card's title text; verified visually via the project's snap tooling after the fix.

### 3.11 About Page Content Layout

**Resolved (Phase 1 build, July 2026), structure and content only — no entrance/scroll choreography yet (see §7):** the About page's frame-interior content (`components/dom/AboutContent.tsx`) is built and placed, closing out PRD §10's "About page content" item. Six sections, top to bottom, per the reference screenshot (`public/assets/refereneces/About Page.png`):

1. **Hero** — "Nice to meet you..." intro paragraph + two stat Chips (§3.7, inline data — `06+ Years at the Table`, `150+ Hands Played (Projects)`) + `PhotoCardSpread` (§3.9) to the right; stacks to one column on mobile.
2. **The Run** — "Career so far, dealt in order" + `ExperienceCardSpread` (§3.10), centered.
3. **House Rules** — "How I play the game" + three body-copy paragraphs, plain Outfit text (`body-text-color`, §1.5) — no new component.
4. **Chips up my sleeve** — "Tools & stack" + a tool-chip grid (§3.7), `data/tools.ts` (new `ToolChipData` interface, `data/types.ts`) — 19 entries, every one reusing the single real logo asset that exists (`public/assets/icons/Typescript.png`) as a placeholder, varying only name/color pending real per-tool icons.
5. **Tables I've Played** — "Brands & clients" + a `BrandCard` grid (§3.8), `data/brands.ts` extended from 4 to 19 fictional placeholder entries — one short of a full 4-column row so the last row's centering (see Grid tracks below) is visibly exercised rather than only theoretically correct.
6. **"Ready to deal?"** — standalone closing text ("Get in touch"), not a numbered section — sits above the already-built `AboutDock`, which is not rebuilt here.

- **Placement:** `.frame` (§4.3) is chrome hoisted into `app/layout.tsx`, a DOM sibling of each route's own `page.tsx` — so `AboutContent` is rendered by `PlayArea.tsx`'s `!onHome` branch (mirroring Home's own `onHome` content branch) rather than from `app/about/page.tsx` directly, which stays limited to route-owned chrome (`FeltBackground`, `AboutDock`).
- **Scroll mechanism:** a single plain `overflow-y: auto` region — deliberately not a reuse of Home's eased-scroll + draggable-rail system (`PlayArea.tsx`'s `SCROLL_EASE`/`scrollYRef`), which exists to stay synced with the WebGL canvas that never renders on `/about`. Bottom padding (140px desktop / 120px mobile) reserves clearance above the fixed `AboutDock`.
- **Tool/brand layout (flexbox, not CSS Grid):** both the tool grid and brand grid use `display: flex; flex-wrap: wrap; justify-content: center` — **deliberately not CSS Grid's `auto-fit`**, which was the first implementation. Grid's `auto-fit` places each item into its own fixed column track, so an incomplete final row left-aligns within those tracks instead of centering as a group; flex-wrap centers every row's content independently, incomplete rows included, since `justify-content` applies per line rather than per fixed track. Both grids keep an explicit `width: 100%` on the flex container (not just `max-width`) since they're flex children of a parent that centers rather than stretches its children (`align-items: center`) — without a definite width, `flex-wrap` has no fixed box to wrap against and just grows to fit its own content instead of reflowing at the frame's true edge. Same max-widths as before: tool grid 100px items/32px column-gap/40px row-gap, max-width 640px (desktop, ~5 columns); brand grid 230px items/24px gap, max-width 992px (desktop, exactly 4 columns).
- **Mobile fallback for "The Run":** `ExperienceCardSpread`'s width is computed internally (not prop-resizable) and doesn't fit narrow viewports at 4 cards — rather than rescale the shared component, its wrapper becomes a horizontally-scrollable region on mobile instead.

---

## 4. Layout

### 4.1 Table grid (desktop)
- **Fixed 4-column grid** — card count is data-driven (`data/projects.ts`, currently 15 → 4 rows), no longer a hard cap. Cards are sized to fit the play area's width only; rows beyond the original 2-row reference density extend the content downward and scroll within the play area (§4.3) rather than shrinking every card to fit.
- Card pitch: 274px horizontal, 360px vertical
- Card size: 214×300px → **gutter: 60px** both axes (consistent)

### 4.2 Mobile
Not present in Figma — derived to satisfy the PRD's 3-column requirement while preserving the desktop card's proportions.

- Card size: **~110×154px** (maintains the 214:300 / ~0.713 aspect ratio)
- Gutter: **12px** between cards
- Outer padding: **16px**
- Fits 3-up comfortably on a ~390px viewport with room to breathe; scales proportionally on wider phones
- Fixed 3-column grid, same data-driven row count/scroll behavior as desktop (§4.1) — mobile never height-scaled even before the play-area refactor, so this is a direct extension rather than a behavior change.

### 4.3 Table framing
- The dashed border in the Figma table view is a **permanent UI element** — the tablecloth/play-area edge, not an annotation to strip.
- **Resolved (Phase 1 build, play-area refactor):** the play area is now the app's real main content container (everything except the top header), not a decorative overlay. It renders as a fully-bordered box on all four sides — no longer bleeding past the viewport bottom — and its interior is the actual native scroll boundary for card content: rows beyond the 2-row reference density (§4.1) scroll within it. The "Pick a Card" heading is a real child of this container, pinned at its top (does not scroll with the cards).
- **Onboarding-gated border (§3.5):** on Home, the dashed border itself is invisible (alpha 0) through the onboarding phase, fading in once the deck is clicked — geometry/scroll-boundary role never changes, only the border color's alpha channel animates.
- **Persists across routes (§3.6):** the frame (and the table header, §3.4) is hoisted into the root layout and persists across the Home <-> About route change as site-wide chrome rather than remounting. On `/about` there's no onboarding concept, so the border renders immediately regardless of Home's deal state; only Home's own onboarding gate keeps the alpha-fade behavior above. The frame's interior content (heading, card grid, canvas) is Home-only and never renders on `/about`.
- **Scrollbar rail:** a slim, visibly-draggable scrollbar (`rgba(255,255,255,0.35)` thumb) is pinned to the frame's right edge, inside the grid's guaranteed outer margin — the native scrollport underneath has its own scrollbar hidden, so this rail is the only visible/draggable one. Hidden entirely until the deal completes (and, per the above, only present on Home).

---

## 5. Elevation scale

Shadow color is `rgba(3,15,10,α)` throughout — derived from `table-edge`, so shadows read as part of the felt rather than generic black.

| State | Offset X, Y | Blur | Opacity | Notes |
|---|---|---|---|---|
| Rest | 4px, 8px | 8px | 0.35 | idle bob baseline |
| Idle bob peak | 6px, 14px | 14px | 0.28 | softer/larger as the card "lifts" (PRD §4.2 — shadow responds to hover offset) |
| Hover | 8px, 20px | 20px | 0.40 | plus `card-hover-glow` outer glow (gold for flagship) |
| Opened / scaled | 0px, 24px | 40px | 0.50 | grounds the reading view in the viewport |
| Dock buttons | 4px, 4px | 4px | 0.45 | unchanged — matches Figma source |

Hover itself is communicated primarily through **motion** (lift, scale) and this elevation shift — not a color change (see §1.6).

**CSS token (Phase 1 build, July 2026):** the Hover row above is now also exposed as `--shadow-hover` in `app/tokens.css` (`8px 20px 20px rgba(3,15,10,0.4)`, mirroring `ELEVATION.hover` in `lib/colors.ts` exactly), alongside the pre-existing `--shadow-rest`/`--shadow-opened`. First consumer is the Chip component's tool-variant hover shadow (§3.7) — previously this row only existed in the JS `ELEVATION` table for canvas cards.

## 6. Motion tokens

| Animation | Duration | Easing | Notes |
|---|---|---|---|
| Idle bob | 3200–4200ms loop | sine in-out | randomized ±400ms per card, deliberately desynced across the grid |
| Hover lift in / out | 220ms / 320ms | ease-out / ease-in-out | snappy response in, softer settle out |
| Peek ("tell") in / out | 380ms / 280ms | ease-out / ease-in | triggers after a 600ms hover hold threshold |
| Flip (full, covered → revealed) | 500ms | `cubic-bezier(0.34, 1.56, 0.64, 1)` | slight overshoot — reads as a card "snapping" face-up |
| Scale-open (card → reading view) | 550ms | `cubic-bezier(0.22, 1, 0.36, 1)` | deliberate, weighty |
| Close (reading view → card) | 400ms | ease-in | quicker than open |
| Shuffle (per card) | 150ms lift + 500–650ms travel, 50–80ms stagger | curved path, ease-out-back settle | not a straight-line teleport — see PRD §4.4 |
| Deal (entrance) | 400–600ms deck jitter, then 450ms/card with 60–90ms stagger | expo-out | reads as a dealt card decelerating into place |
| Bulk cover/reveal toggle | reuses Flip timing, 40–60ms stagger across grid | — | per PRD §4.3 |
| Gather (open, card → under clicked card) | reuses Deal's 450ms/card, 75ms stagger | expo-out | closest-card-first; fans each card by rank (`fanStepPx` 10px, `fanAngleStepRad` ~3°, capped at `fanMaxRank` 4) and stacks it behind the clicked card (`stackZBase` −2, `stackZStep` 0.15/rank) — see PRD §4.5 |
| Scatter (close, under clicked card → card) | reuses Deal's 450ms/card, 75ms stagger | expo-out | mirrors Gather; farthest-card-first (a "burst" read, see §7) |
| Flagship ambient glow pulse | 2800ms loop | sine in-out | always-on, opacity 0.28–0.75; separate from and additive to the interactive hover glow (§1.7) |
| Onboarding shuffle loop (per card) | 190ms cut/recombine, 130ms hold-merged, 160ms hold-cut | ease-in-out | X-axis only, loops until deck click; per-card phase offset 10ms × card index (§3.5) — *placeholder, pending tuning* |
| Onboarding ascend-to-deck | 800ms | ease-in-out | cards rise from onboarding rest position to the real deck position on click, before the entrance deal's own jitter (§3.5/§4.1) — *placeholder, pending tuning* |
| Onboarding "Hello!" enter (load) / exit (click) | 1000ms / 180ms | openEase / — | translates in from 32vh below on load; fades + translates up 24px on click — *placeholder, pending tuning* |
| Onboarding subheading fade-in | 500ms | openEase | delayed until both the "Hello!" enter and the cards' own fade-in finish, plus a 120ms gap (§3.5) — *placeholder, pending tuning* |
| Onboarding logo travel → dock crossfade | 900ms travel, then 220ms crossfade | openEase | shared-element FLIP from the standalone logo to the dock's center logo (§3.5) — *placeholder, pending tuning* |
| Dock formation | 1400ms | openEase | clip-path ellipse expansion + per-button stagger (90ms/button), starts right after the logo crossfade (§3.5) — *placeholder, pending tuning* |
| Play-area border fade-in | 700ms | ease | alpha-only, starts on deck click (§3.5/§4.3) — *placeholder, pending tuning* |
| Header fade/translate-in | 850ms | openEase | starts once the entrance deal completes; translates in 40px from the left (§3.5) — *placeholder, pending tuning* |
| "Pick a Card" fade/translate-in | 700ms | openEase | starts 80ms after the header's fade/translate fully finishes (§3.5) — *placeholder, pending tuning* |
| Deck exit/enter (route transition) | 450ms/card, 40ms stagger, 1200px travel | ease-in (exit) / ease-out (enter) | slides the whole deck off-table to the left and fades it, or the reverse — Home <-> About route transition (§3.6); travel distance must clear the play area's max width or a card can be left partially in-frame — *placeholder, pending tuning* |
| "Pick a Card" exit/enter (route transition) | 500ms | openEase | fades + translates 60px upward on About/Back-to-Home click, reverses on return — distinct from the onboarding entrance above, no header-relative delay (§3.6) — *placeholder, pending tuning* |

**Interrupt behavior:** clicks on a card are ignored while the entrance deal is in progress — no queuing, no interrupt. The visitor simply has to wait the ~1–2s for the deal to finish before any card is interactive.

## 7. Confirmed open items

Resolved during the Phase 1 build (July 2026):

1. **Meow Script fallback** — loaded via `next/font` with `display: swap`; a brief cursive-fallback FOUT is accepted since the heading is decorative. Outfit loads the same way and canvas text drawing awaits `document.fonts.load` before compositing card fronts.
2. **Dock "active" toggle state** — the cover/reveal button gets a brighter glass fill (`rgba(255,255,255,0.32)` top stop) and brighter border while "revealed" is active, plus `aria-pressed`. No new color token.
3. **Peeking + flagship interaction** — peek stays purely geometric (angle only). The gold back is simply what's physically peeking; no color change is triggered.
4. **Play area as real container** — the dashed play-area box (§4.3) is now the app's live content container and scroll boundary, not decorative-only; card count is data-driven rather than a fixed 8 (§4.1/§4.2). ControlDock and ChipStackTracker remain viewport-pinned chrome outside the play area; OpenCardOverlay remains viewport-grounded, independent of play-area scroll position.
5. **Scatter stagger direction (close, PRD §4.5)** — farthest-card-first, not nearest-first. Rationale: since travel duration is fixed rather than distance-scaled (matching Gather/Deal's precedent), farthest-first means the cards with the most ground to cover start earliest and cover it at the same visual speed as everything else, while near-neighbors peel off moments later and snap back almost immediately — reading as a single outward "burst" that settles together, rather than a slow trickle or an "unstacking a deck" motion.
6. **Onboarding gate (pre-table)** — a "Hello!"/tap-the-deck gate now precedes the entrance deal; the deal no longer fires automatically on load (PRD §4.1, DS §3.5). Structure and choreography (text/logo layers, shuffle loop, dock formation, header/heading reveal sequencing) are built and functioning.
7. **About panel scope** — resolved as its own route (`/about`), not the card-open overlay pattern (§3.6, PRD §4.8/§10). Dock formation/collapse choreography (§3.5) is reused bidirectionally for the route transition; the table header and play-area frame persist site-wide as chrome.
8. **About page content** — the route/dock/transition, and now the page's own section layout and copy, are built (§3.11): Hero, The Run, House Rules, Chips up my sleeve, Tables I've Played, and the closing "Ready to deal?" text, using all four previously-unplaced building blocks (Chip §3.7, Brand Card §3.8, Photo Card §3.9, Experience Card §3.10). Structure and content only — see still-open item below for the remaining animation pass.

Still open:

9. **Onboarding + route-transition timing values (§3.5/§3.6/§6)** — implemented and functional, but every duration/delay in `MOTION.onboardingShuffle`, `MOTION.onboarding`, and the new `MOTION.tableNav` (`lib/motion.ts`) is explicitly marked in code as a placeholder pending a dedicated tuning pass, unlike the rest of §6 which is signed-off.
10. **About page section entrance/scroll choreography** — §3.11's content renders directly in its final resting layout with no reveals, stagger, or scroll-triggered animation yet; that's a separate follow-up pass once the structure above is confirmed.
11. **Real contact/resume destinations** — the About dock's Email, LinkedIn, X, and Resume all point to placeholder values (`lib/aboutLinks.ts`).
12. **Real tool-chip logo assets** — every entry in `data/tools.ts` (§3.11) reuses the one real logo asset that exists (`Typescript.png`) as a placeholder; real per-tool icons (Figma, Photoshop, Notion, etc.) are a separate follow-up, deliberately deferred this pass (confirmed decision, not an oversight).

---

## 8. Source reference

- Figma file: `8ENJvHnX9pC73D9qUn7SN6`, page "Main Elements" (node `1:2408`)
- Card Back: node `1:2409`
- Card Front: node `1:2672`
- Homepage/table view: node `1:2685`
- Control Bar: node `1:2695`
- Chip (stat/tool, §3.7): user-provided Figma SVG exports, `public/assets/referneces/stat.svg` and `tool.svg` — not sourced via the Figma MCP node IDs above (see §3.7 for why)
