# Design System: Card Table Portfolio

**Status:** Draft v32 — card-front fill reverted from per-project `previewColor` back to the fixed `card-front-bg` token (§3.2, §7 item 23), a deliberate deviation from the prior CMS-integration decision; reading-pane close button restyled to a lifting glass-button treatment, no longer matching the tag pills it was previously documented as sharing a style with (§3.13, §7 item 25); reading pane gained a net-new footer wordmark echoing the table header, and `.customSection`'s internal gap widened 24px → 32px (§3.13, §7 item 26); derived from Figma source file; About page routing/route-transition, the Chip component (from user-provided SVG exports), the Brand Card component (net-new, no Figma source), and the Photo Card / Experience Card components (from Figma, with confirmed deviations — see §3.9/§3.10) added post-Figma; About page section layout (§3.11) added post-Figma, structure/content only; Photo Card spread hover interaction (§3.9) and tool/brand grid flex-wrap layout (§3.11) added post-Figma; control dock revised (§3.3/§3.6) to persist as a single site-wide instance instead of remounting/re-forming per route; the dock's About/Back-to-Home buttons replaced with a single sliding `DockToggle` switch (§3.3/§6); control dock made responsive below 767px, restacking into a vertical column (§3.3); table grid (§4.1) now falls back from 4 to 3 columns instead of shrinking below 3-column mobile sizing, and mobile bottom padding (§4.2) increased so the stacked dock no longer covers the last card row — both found via a responsive audit, not Figma-derived; About page responsive audit follow-up (§3.8/§3.10/§3.11, §7 items 12-17) — Brand Card gains a mobile size reduction for a 2-column grid, Experience Card's text is now top-left-anchored with two responsive spread variants (narrowed fan / mobile peek-stack) replacing the original single fixed fan, the fan continuously scales to its measured available width (both axes' rotation overhang accounted for) instead of staying fixed-size, the mobile peek-stack reveals enough of each card for its full text plus a stronger stacked-card shadow, Hero gained its own 920px stacking breakpoint, and two more shrink-wrap/dock-clearance bugs (mirroring the table-grid ones above) were fixed on `/about`; AboutContent now has its own Home <-> About route-transition motion (§3.6/§6) — translates in from the right on arrival, translates out to the right before navigating back; Hero/Run/Chips/Brands now have first-visit-only section-reveal choreography (§3.11/§6), revised to deal in strictly one item at a time (no overlap) with a `.runSpreadWrap` scrollbar fix; a 404/Not Found page added (§3.3/§3.12/§6), net-new — no Figma source, not previously specced in either doc; card front's fill color and real-image cropping resolved for the Sanity CMS integration (§3.2, §7 item 23) — previewColor sources the frame fill, hotspot/focal-point cropping deferred to a plain center-crop; card front's `date` field dropped entirely for the CMS integration (§3.2, §7 item 24) — no equivalent Sanity field exists, so the micro-label is now category-only; refined once real content was flowing (§3.2, §7 item 24) — title now wraps up to 2 lines (ellipsis beyond that) respecting the same 8px padding on both sides instead of overflowing unbounded, the category micro-label bumped 7px → 11px (every real category name still fits on one line), and the card-front image source switched from `heroImage` to `previewImage` per `SCHEMA.md` §3b's intended grid/listing field, reserving `heroImage` for the expanded project page; reading pane's hero/overview/closing content shell added (§3.13), net-new for the Sanity CMS integration Phase 6 — per-project theming via 4 inline CSS custom properties (plus a 5th, local to each tool pill), structure ported from `PROJECT_PAGE_LAYOUT.md` §5/§6 with every value re-derived from this project's own tokens; reading-pane hero/closing images revised to a fixed-height crop box (§3.13) so every project renders at the same height regardless of source aspect ratio, and the category pill restacked above the title instead of inline with it; reading pane's category-specific body vocabulary added (§3.14), net-new for the Sanity CMS integration Phase 7 — 9 shared pattern components (TextImageRow, SoloTextContainer, SoloImageContainer/MediaGallery, InfoCardGrid/SoloInfoCard, PortraitImageGrid, DividerSection, LiveLinkRow) composed by all 4 category bodies, live-link responsive breakpoints (1024px/450px/320px) introduced, tag/tool pill colors re-derived from this app's own tokens rather than copied from the reference; §7 items 20/21 (real contact/resume destinations, real tool-chip logos) resolved by the CMS integration's Phase 10 (About page integration) — moved from "still open" into the resolved list
**Source:** [Portfolio Deck](https://www.figma.com/design/8ENJvHnX9pC73D9qUn7SN6/Portfolio-Deck) (node `1:2408`, "Main Elements")
**Last updated:** July 22, 2026

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
| 404 page "Bust!" heading (§3.12) | `clamp(140px, 26vw, 380px)` (desktop), `clamp(90px, 30vw, 200px)` (mobile) | `tagline-color` @ 60% opacity — by far the largest Meow Script use in the app; dimmer than every other use (all others sit at 100%) since it's a giant background-filling flourish the card fan sits in front of, not foreground text |

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
- Frame: 214×300px, 8px padding, 4px outer corner radius, fill is the fixed `card-front-bg` token (§1.3, `#FFFFFF`) — **reverted, July 2026** (see §7 item 23) from the brief July 17 window where it sourced the project's Sanity `previewColor` field per-project; card fronts are back to one flat color for every project, same as the original pre-CMS-integration spec. `projectColor`/`projectColorDark`/`ctaColor` still have no card-front role; they theme the reading-pane overlay only (§6/Phase 6 of the CMS integration), matching the reference site's project-detail-only usage of those three.
- Image block: bleeds past the card's left/right edges (−54px each side) and top (−10px), aspect ratio 1153:634 — the photo intentionally overflows the card boundary rather than sitting inset
  - *Implementation note (Phase 1):* on the WebGL card a texture cannot paint outside the mesh, so the bleed is reproduced as an oversized crop clipped at the card silhouette — same composition, no literal overflow. If literal overflow is ever required, it needs a separate oversized image plane.
  - *Implementation note (Phase 4, CMS integration):* the real image is drawn center-cropped ("object-fit: cover," no offset) into this box regardless of source aspect ratio. Sanity's hotspot/focal-point metadata is deliberately ignored for now — first-pass decision, not permanent; revisit if real images crop badly against the card's fixed aspect box.
  - *Implementation note (revised after Phase 5):* sourced from Sanity's `previewImage` field, not `heroImage` — `SCHEMA.md` §3b documents `previewImage` as the field meant for grid/listing use; `heroImage` is reserved for the expanded project page (Phase 6/7).
- Text block: anchored bottom, 127px tall, 18px top / 8px bottom / 8px side padding (both sides —
  title wraps at the right padding rather than overflowing)
  - Two lines max: title (20px Medium, wraps up to 2 lines, ellipsis-truncated beyond that), then a
    category-only micro-label (11px Light, uppercase, 2.4px tracking, always one line — every real
    category name fits comfortably at this size). Micro-label originally showed "category - date";
    `date` dropped entirely (no equivalent field exists in the real Sanity schema, decided out of
    scope rather than deferred), then bumped 6px → 7px → 11px across two passes as real content
    made clear the line had room to spare.
- Watermark: logo mark at 5% opacity, 106×98px, sits behind the text block

### 3.3 Control Dock
- Two-layer liquid glass: an outer pill container (`dock-fill`, `dock-border`, `dock-shadow`, `dock-blur` backdrop-filter) with the button/logo group as a second, brighter nested glass layer inside it — not a flat frosted-chip look, a real `backdrop-filter` blur that refracts the table/cards behind the dock
- Layout is CSS Grid (`grid-template-columns: 1fr auto 1fr`), not flexbox — the two equal-width outer tracks guarantee the center logo stays truly centered regardless of how many buttons sit in each group (flex `justify-content:space-between` only splits free space between adjacent siblings, so it can't guarantee true centering once the groups hold unequal button counts)
- Explicit pill width above the 767px breakpoint: `min(500px, calc(100vw - 64px))` — no longer shrink-wrapped; 16px horizontal padding, 8px vertical, 16px column gap between groups and logo, 16px gap within each group. Below 767px the dock is no longer a horizontal pill at all — see the responsive-stacking bullet below.
- **Left group** (card controls, pinned to the pill's left edge): **Visibility Toggle** (eye), **Shuffle**
- **Right group** (pinned to the pill's right edge): **Resume**, then a **Home/About route toggle** (`DockToggle`) — a two-position sliding switch replacing the old separate About/Back-to-Home buttons; Resume opens the real `resumeUrl` fetched from Sanity's `siteSettings` document (`lib/getSiteSettings.ts`, resolved CMS integration Phase 10 — `lib/aboutLinks.ts`'s placeholder is deleted)
- **Single persistent instance:** one `ControlDock` component, hoisted into the root layout, persists across the Home <-> About route change (§3.6) rather than each route mounting its own dock. The left group's button content still swaps instantly on navigation, keyed on the route — Home's Visibility Toggle/Shuffle swap for **Email, LinkedIn, X** on About. The right group's route toggle is different: it's one persistent element that never swaps/remounts, animating its thumb instead (see below).
- **Route toggle (`DockToggle`, revised July 2026):** a `role="switch"` control, left position = `cards.svg` icon (Home), right position = `about.svg` icon (About), `aria-checked` = About-side active. Reuses the dock button's exact glass treatment for its thumb (extracted as a shared `.buttonGlass` class — fill/border/shadow/blur/45px size, identical to every other dock button) but the track itself is a **groove carved into the dock's surface**: inset-only shadows (`inset 0 2px 5px rgba(0,0,0,0.5)`, `inset 0 -1px 1px rgba(255,255,255,0.12)`), a darker gradient fill with no bright highlight stop, and a lighter `blur(10px) saturate(1.3)` than the raised buttons get — the inverse of the dock's own embossed look, component-local values (same precedent as the center-logo emboss below). Track: 96×51px; thumb: 45px (from `.buttonGlass`, unpositioned); groove padding 3px each side; thumb travel 45px. The **active side** looks exactly like a normal dock button (icon at full 30px/opacity 1, sitting inside the glass thumb); the **inactive side** is the bare icon only, dimmed and shrunk (opacity 0.45, scale 0.72×, `MOTION.dockToggle`) — no glass circle behind it. Transition: the thumb slides over 320ms (`openEaseBezierPoints`); the origin icon de-emphasizes immediately as the thumb departs (150ms); the destination icon's re-emphasis is delayed 140ms so it lands at full size/opacity exactly as the thumb arrives (180ms), producing a sequenced rather than simultaneous feel. The toggle's own click still routes through the existing Home<->About navigation (`beginTableNavExit`, §3.6) — the thumb only actually slides once the route change itself fires (after the deck's own off-table exit finishes), not optimistically on click, since its position is a direct reflection of `pathname`. All values here are provisional, same placeholder-pending-tuning caveat as onboarding/tableNav (§6).
- Each button: 45px circle, `999px` radius, `dock-button-border`, `dock-button-fill`, `dock-button-shadow`, `dock-button-blur` backdrop-filter — a nested glass "bubble" brighter than the outer pill
- Icon: 30×30px, centered, monochrome white
- Button interaction states:
  - **Hover** (pointer devices only, `(hover: hover) and (pointer: fine)` — never engages on touch, which has no way to "un-hover" and would otherwise leave a button stuck scaled up): scales to `1.08×`, 160ms ease
  - **Press** (`:active`, all input types): scales down to `0.92×` and the button's drop shadow/inset highlight drops out entirely, reading as physically pushed flat into the glass — snappier, 90ms
  - **Toggled on** (`.buttonActive`, e.g. reveal-all engaged): border brightens and a second, brighter gradient layer crossfades in behind the icon via a `::before` overlay rather than animating `background` directly (gradients can't interpolate smoothly through a `background-color`-style transition; opacity can) — 200ms ease
  - All other property changes (border-color, opacity, box-shadow) transition on the same 160–200ms ease rhythm so no state change ever snaps
- Visibility Toggle icon crossfades between two states rather than snapping — closed eye (`closed_eye.svg`, covered/default) and open eye (`eye.svg`, revealed/active) stack in place and cross-fade opacity over 220ms ease
- Center logo mark sits in the grid's true-centered middle column, with an inset shadow (`inset 0px 1px 2px rgba(0,0,0,0.55)`) for a subtle embossed effect, plus a faint fill + small blur (`blur(8px) saturate(1.3)`, inlined in `ControlDock.module.css` — component-local, not a shared token) so it reads as part of the same glass language
- **Not rendered on the 404 page (resolved, July 2026):** on any route that isn't `/` or `/about` (i.e. the 404 page, §3.12), `ControlDock` renders nothing at all — no compact/logo-only state, no button groups. Clicking the 404 card spread goes straight into Home's own onboarding state, which has no dock either, so there's nothing for this dock to usefully show in between.
- **Responsive stacking (resolved, July 2026):** below the project's standard 767px breakpoint (same one used everywhere else — Table Header, Play Area, Onboarding, etc.), the dock abandons the edge-pinned horizontal pill and restacks into a single centered column — top to bottom: **center logo, left group, right group**. Buttons within a group stay side-by-side (only the three top-level sections stack). Pure CSS, no `ControlDock.tsx` changes: the grid collapses to one column, the logo (the DOM's middle child) gets `order: -1` to render first, and both groups switch from edge-justified to centered. The container itself reshapes from the horizontal pill (`999px` radius) to a rounded rectangle (`28px` radius) sized to fit its content (capped at `calc(100vw - 24px)`) rather than stretching to the horizontal layout's pill width — a tall stadium shape at 3 rows would read as an ellipse, not a container. Current values: `row-gap: 32px`, `padding: 16px 32px`, `bottom: 12px`.

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

**Resolved (Phase 1 build, July 2026):** the dock's About button navigates to a dedicated `/about` route (resolving §7 item 7 / PRD §10's "About panel treatment") rather than opening an in-page overlay.

**Revised (July 2026):** the control dock (§3.3) is persistent site-wide chrome — one component, hoisted into the root layout — and no longer animates on route change at all. Its onboarding-formation sequence (§3.5) plays exactly once, on Home, the first time the deck is clicked; it is never replayed for Home <-> About navigation. This deviates from the original design, which reused that formation choreography bidirectionally as the route-transition animation itself (dock collapse/expand + a second standalone-logo handoff on every nav) — that reuse has been removed:

- **Dock:** swaps its button content instantly, in place, the moment the route changes — Home's Visibility Toggle/Shuffle for About's Email/LinkedIn/X, and About for Back to Home. No clip-path collapse/expand, no button stagger, no standalone-logo handoff. Stays fully interactive throughout the navigation.
- **Deck + heading (Home-side only, unchanged by this revision):** clicking About (or Back to Home) still slides the whole deck off-table to the left while fading, and fades/translates the "Pick a Card" heading upward, before the actual route change fires — this is what the brief pre-navigation delay is for. The reverse plays per-card at mount time when landing back on Home.
- **About's own content (resolved, July 2026):** `AboutContent`'s root now translates in from the right + fades on arrival (Home -> About) and, symmetrically, translates out to the right + fades before the route actually changes on the way back (About -> Home) — a `beginAboutNavExit` function (`lib/choreography.ts`) mirrors the deck/heading's own `beginTableNavExit` pre-navigation delay, gated on the same `dockNavPhase` store field, but sized for a single DOM block rather than staggered WebGL cards. A direct load of `/about` renders already settled, no animation — same "direct load = no animation" rule as the rest of this section's chrome. This closes the previously-open gap noted in §7 item 19 for the page-level transition specifically (About's *internal* section-scroll choreography remains open).
- **About's own button set:** same pill layout/sizing/glass tokens as Home's (§3.3) — left group **Email, LinkedIn, X**; right group **Resume, Back to Home**. All one-shot actions, no new interaction states.
- **Persistent chrome:** the table header (wordmark/tagline, §3.4), the play area's frame/dashed border (§4.3), and the control dock all persist across both routes rather than remounting — on `/about` they render immediately regardless of Home's deal state, since Home's onboarding-gated hide/reveal (§3.5) is a Home-only concept. Home's cards, canvas, and open-card overlay are route-gated and never render on `/about`.
- **Direct-load case:** a direct load of `/about` (bookmark, typed URL) renders the dock already fully formed, with no animation — mirrors how a direct load of `/` only skips onboarding once a deal has actually completed.
- **Skipping onboarding on return:** clicking Back to Home forces the deal to "complete" before Home mounts, even if `/about` was reached without ever dealing on Home this session — so the deck always translates into frame already dealt rather than showing the onboarding gate.

Motion tokens for the deck/heading exit live in `MOTION.tableNav`, and About's own content translate+fade lives in `MOTION.aboutNav` (`lib/motion.ts`, see §6) — both are new values, not reused from §3.5's dock/logo tokens, which are onboarding-only now.

### 3.7 Chip (stat / tool)

**Resolved (Phase 1 build, July 2026):** a poker-chip visual component (`components/dom/Chip.tsx`), built for the About page's Hero (stat chips) and Tools (tool chips) sections. **Now placed** (§3.11) — two inline stat-chip instances in the Hero section, and a tool-chip grid ("Chips up my sleeve") sourced from Sanity's `tools` documents (`lib/getSiteSettings.ts`'s `getFeaturedTools()`, resolved CMS integration Phase 10 — `data/tools.ts`'s mock/placeholder version is deleted). One component, `variant: 'stat' | 'tool'` prop, sharing all structural layers; only the content slot and interactivity differ per variant.

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

**Resolved (Phase 1 build, July 2026):** a small interactive card component (`components/dom/BrandCard.tsx`), built for the About page's "Tables I've Played" section (past clients/brands). **Now placed** (§3.11) — a grid sourced from Sanity's `clients` field on `siteSettings` (`lib/getSiteSettings.ts`, resolved CMS integration Phase 10 — `data/brands.ts`'s mock array is deleted), count now data-driven rather than a fixed mock array.

- **Frame:** 230×150px `<button>`, 1rem padding, 1px `flagship-gold` (§1.7) border that stays unchanged across every state, `overflow: hidden`, no fill at rest. **Below 767px (responsive audit follow-up, July 2026):** shrinks to 130×104px (0.625rem padding, 9px name text, 0.12em letter-spacing, down from 0.5em) — at the original size, `.brandGrid`'s flex-wrap (§3.11) never produced more than 1 column on a phone; the smaller size fits 2 columns down to a 320px viewport, with wider phones growing to 3 on their own via the same flex-wrap. `BrandCard` has no Figma-fixed-size constraint (it's net-new, unlike Photo/Experience Card below), so resizing it responsively doesn't deviate from any source.
- **Rest state:** brand name, all-caps white text, centered — reuses the table header wordmark *name's* tracking (`TableHeader.module.css` `.name`: 14px, weight 300, `letter-spacing: 0.5em` — not yet its own row in §2.2's typography table, which only covers card title/category-date/tagline; flagged rather than silently added, since retrofitting that table is a separate decision) in preference to the tighter 2.4px category/date tracking or the tagline's 0.1em. `text-transform: uppercase` is applied explicitly rather than relying on source-string casing, since brand names are data-driven.
- **Reveal state (desktop hover or touch tap):** background fades transparent → white; border stays unchanged; the name translates upward and fades out (clipped by the frame's `overflow: hidden`), then the logo (`<img>`, `object-fit: contain`, aspect ratio always preserved, never stretched/cropped) translates upward and fades in from below, settling where the name was. Only one of {name, logo} is ever mounted at a time (Framer Motion `AnimatePresence`, keyed swap) — the DOM-animated equivalent of Chip's "fixed frame + swappable content" idea (§3.7), not two permanently-stacked layers. A single 20px travel-distance constant drives both elements symmetrically (each element's `initial` and `exit` share the same offset), so the un-reveal direction falls out as the natural mirror rather than a separately authored animation.
- **Timing:** reuses `MOTION.hover` (§6) verbatim — 220ms ease-out in / 320ms ease-in-out out — making this the second DOM consumer of that token after Chip's tool-variant hover (§3.7), and the first applied via Framer Motion variants rather than a plain CSS `:hover` transition.
- **Hover/touch gating — deviates from §3.3's mechanism:** the dock buttons gate real hover behind a CSS `@media (hover: hover) and (pointer: fine)` query, but that can't drive an `AnimatePresence` mount/unmount swap. Brand Card instead tracks real hover via `onPointerEnter`/`onPointerLeave`, gated to `event.pointerType === "mouse"` — the JS-layer equivalent of the same gating intent (touch pointers never set the hover flag), not a literal reuse of the CSS mechanism. A tap-driven `revealed` prop (from the parent grid) combines with this hover state into one `isRevealed` boolean. The click handler is separately gated: keyboard activation (`event.detail === 0`) always toggles the tap state (hover has no keyboard equivalent), touch-only devices toggle, and real mouse clicks on hover-capable devices do not (hover alone drives the reveal there, avoiding a double-toggle).
- **Exclusivity:** only one Brand Card may be tap-revealed at a time within its grid — page-scoped local state owned by the grid's parent container, not `store/useTableStore.ts`. Distinct from, but conceptually parallel to, PRD §4.5's "only one card can be open at a time" rule for the table itself.
- **Accessibility:** `aria-pressed={isRevealed}` and `aria-label` set to the brand's name on the button; `:focus-visible` outline matches `A11yCardButtons.module.css` (`2px solid rgba(255,255,255,0.9)`, 4px offset) — added so keyboard users, who have no hover equivalent, can still trigger the reveal.
- **Data shape:** a `Brand` interface (`id`, `name`, `logoSrc`) in `data/types.ts`; instances now come from Sanity via `getSiteSettings()`, not a local mock file (`data/brands.ts` is deleted, same fate as `data/projects.ts`).

### 3.9 Photo Card

**Resolved (Phase 1 build, July 2026):** a small always-face-up card component (`components/dom/PhotoCard.tsx` + `PhotoCardSpread.tsx`), built for the About page's Hero section. **Now placed** (§3.11) — the Hero's 2-entry `data/photos.ts` set, right of the intro copy/stat chips. Sourced from Figma node `52:2161` (file `8ENJvHnX9pC73D9qUn7SN6`).

- **Frame:** 214×300px, `card-front-bg`, 4px outer corner radius, `shadow-rest` elevation — same base dimensions as Card Front (§3.2), but **24px padding, not 8px**, and no flip state (always face-up). **Confirmed deviation from §3.2**, per Figma.
- **Corner marks:** two small opaque monogram marks (not §3.2's single 5%-opacity watermark) — a new asset, `public/assets/icons/card-corner-mark.png` (sourced from Figma node `52:2168`), used unrotated at both top-left (6px, 6px inset; 17.38×16px) and bottom-right (7px, 8px inset; 17×16px). **Confirmed deviation from §3.2** — Photo Card and Experience Card (§3.10) are the first, and so far only, consumers of this corner-mark treatment; the Home project card's single watermark is unchanged.
- **Image block:** 216px tall, full content width, `object-fit: cover`, 2px inner radius — a simplified equivalent of Figma's literal oversized/offset crop (same visual result, no negative-offset percentages to replicate in DOM).
- **Text block:** name (Outfit Medium, 15px, `card-front-text`, centered) + subtitle (Outfit Light, 6px, 2.4px tracking, uppercase, `card-front-text`, centered) — the subtitle reuses §2.2's category/date micro-label recipe verbatim rather than Figma's raw exported value (4px size, 1.6px tracking), which was judged an implausible Figma-export scaling artifact (illegible at that size on a 214px-wide card) and confirmed against Experience Card's date-range field (§3.10), which exports at the exact §2.2 values.
- **Data shape:** `PhotoCardData` (`id`, `image`, `name`, `subtitle`) in `data/types.ts`, mock instances in `data/photos.ts` — 2 placeholder entries (only 2 real placeholder images provided). Unlike Brand Card/Project Card (`data/brands.ts`/`data/projects.ts`, both deleted once Sanity fields landed), `photos.ts` has no `siteSettings` counterpart and stays a mock file indefinitely (confirmed during CMS integration Phase 10).
- **Spread behavior:** capped at 3 cards, array-driven (`PHOTOS.map`, not fixed JSX instances). Stacked with a per-rank peek offset/rotation — a generous peek (not a tight/subtle one) so the non-front card(s) read clearly behind the front card, per the reference images. Clicking or keyboard-activating (Enter/Space) anywhere on the spread promotes the next card in fixed order to the front, round-robin (1→2→3→1...). New motion tokens, `MOTION.photoSpread` (`lib/motion.ts`): `offsetXStepPx` 34, `offsetYStepPx` 22, `rotationStepDeg` 7, `cycleDuration` 380ms — a dedicated new geometry, not a reuse of `MOTION.gather`'s fan constants (§3.10 explains why that reuse is intentionally avoided).
- **Hover widens the fan (Phase 1 build, July 2026):** hovering anywhere on the spread (mouse only — `pointerType === "mouse"` gating, same touch-safety convention as Brand Card §3.8, so a tap can't leave the fan stuck open) increases the back cards' per-rank rotation from `rotationStepDeg` (7°) to `hoverRotationStepDeg` (14°). The front (rank 0) card sits outside that rank×step formula — normally pinned at a flat 0° regardless of rank — so without its own reaction it read as dead/static next to the fanning cards behind it; it now tilts to `frontHoverRotationDeg` (−6°) on hover, opposite the back cards' direction, so the whole spread reads as pivoting apart from a shared pivot rather than an inert top card with only its backing cards moving. Reuses the existing `cycleDuration`/ease-out tween (no separate hover-timing token) for both the widen-in and settle-out.

### 3.10 Experience Card

**Resolved (Phase 1 build, July 2026):** a small always-face-up, non-interactive card component (`components/dom/ExperienceCard.tsx` + `ExperienceCardSpread.tsx`), built for the About page's Experience section. **Now placed** (§3.11) — "The Run" section, sourced from Sanity's `experience` field on `siteSettings` since CMS integration Phase 10 (July 17, 2026; originally a 4-entry `data/experience.ts` mock, now deleted, count data-driven). Sourced from Figma node `54:2197`.

- **Frame:** same 214×300px shell, 24px padding, and corner-mark treatment as Photo Card (§3.9) — both confirmed deviations from §3.2 apply here too.
- **Inner content box:** a bordered box (1px `rgba(0,0,0,0.1)`, 2px radius) filling the padded content area. **Revised (responsive audit follow-up, July 2026) — confirmed deviation:** text is now top-left-anchored (24px top padding, left-aligned in a fixed 105px column) rather than the original Figma-sourced vertical centering — needed so both the narrowed desktop fan and the mobile peek-stack below can reveal a card's text without a neighboring/covering card hiding it (left-alignment specifically means the fan's horizontal step only has to clear one edge of the text, not both, per the constraint noted below). Top padding trimmed from an initial 32px to 24px (the corner mark's own minimum clearance) to give the mobile stack's reveal window more room.
- **Elevation (mobile peek-stack only):** an `elevated` prop (`ExperienceCard.tsx`) swaps in a stronger, mostly-downward shadow (`0px 10px 18px rgba(3,15,10,0.45)`, component-local — not yet in the design system's elevation table, DS §5) in place of the standard `--shadow-rest`. `--shadow-rest` is tuned for a card resting on the green felt (§5) and reads too faintly card-on-card, where both surfaces are close to white; the stronger shadow makes each stacked card visibly cast onto the one beneath it. The fan doesn't use this — its own overlap/rotation already reads as stacked.
- **Text block:** date range (Outfit Light, 6px, 2.4px tracking, uppercase — an exact match to §2.2's category/date micro-label recipe) + title (Outfit Medium, 14px) + company (Outfit Regular, 8px); all three left-aligned (was centered).
- **Data shape:** `ExperienceCardData` (`id`, `title`, `yearRange`, `company`) in `data/types.ts` — field renamed from `dateRange` to `yearRange` during CMS integration Phase 10 to match Sanity's real field name verbatim; instances now come from `getSiteSettings()`, most-recent-first (`data/experience.ts`'s 4-entry mock is deleted).
- **Spread behavior — two responsive variants (`ExperienceCardSpread.tsx`, switching on the page's 767px breakpoint via `hooks/useBreakpoint.ts`):** capped at 4 cards (most recent roles only — older history lives on the resume), static/non-interactive, array-driven (`EXPERIENCE.map`). **Revised (responsive audit follow-up, July 2026)** — the original single fixed fan's 784px natural width (`xStepPx` 190 × 3 + card width) didn't fit any "desktop" viewport below ~1070px, clipping cards with no way to scroll back to them (§7).
  - **>767px, the fan:** same bow silhouette as before — cards rotated outward from center (alternating left/right), vertical position dropping the further from center, so center cards ride highest and edge cards dip lowest, like a hand of cards fanned around a pivot below. Base geometry narrowed via `MOTION.experienceFan.desktop` (`lib/motion.ts`): `xStepPx` 150 (was 190), `rotationStepDeg` 5 (was 7), `liftPx` 18 (was 26) — tightened as far as the now-left-aligned, 105px-wide text column allows while staying unobstructed by the next card, the same constraint the original 190px value was tuned against. **Continuously scaled (revised, responsive audit follow-up, July 2026):** `ExperienceCardSpread.tsx` measures its own available width (`ResizeObserver`, the same pattern `PlayArea.tsx` uses for its frame) and shrinks the whole fan — card size, step, lift, all together — to fit, capped at native (1×) size; cards never fall back to needing a scrollbar under normal use anymore (an earlier pass left cards fixed-size and relied on `.runSpreadWrap`'s `overflow-x: auto` alone, which stayed visibly triggered well above the mobile breakpoint on ordinary desktop/laptop widths). Each card's own rotation still pivots around its own (already-scaled) box center; the size reduction is applied separately, via a nested `scale()` wrapper with a top-left origin, so the two transforms don't fight over one shared origin. The scale/sizing math computes every card's true rotated bounding box (not just an approximation for the outermost one) on **both** axes and fits the wrap to their exact min/max extent — a first pass only corrected the horizontal axis, leaving the fan's bottom edge clipped (and a second, vertical scrollbar) at the same "wide enough" widths, since a `WxH` box rotated by θ extends past its own nominal edge on every side, not just left/right. That `overflow-x: auto` fallback stays in place as defense-in-depth (e.g. the brief pre-measurement frame before the fan's true available width is known) but shouldn't visibly trigger in normal use anymore.
  - **≤767px, a vertical peek-stack, not the fan:** cards stack directly on top of each other (no x-offset or rotation), each offset down by `MOTION.experienceFan.mobile.revealPx` (160px, up from an initial 96px then 135px — both verified too short via live DOM measurement of the longest title+company combination) from the one before, exposing its own top-anchored text above the card beneath it. z-index ascends with stack position (later/lower cards drawn on top) — the physical consequence is that the last (oldest) card ends up fully shown at the bottom of the stack, since nothing sits below it to cover any part; every other card stays equally legible via its own top-anchored peek regardless of position, not just the fully-shown one. Each card also gets the stronger `elevated` shadow noted above, to read clearly as physically stacked.

### 3.11 About Page Content Layout

**Resolved (Phase 1 build, July 2026), structure/content and, as of a follow-up pass, per-section entrance choreography for four of the six sections (see §7 item 18 below for what remains):** the About page's frame-interior content (`components/dom/AboutContent.tsx`) is built and placed, closing out PRD §10's "About page content" item. Six sections, top to bottom, per the reference screenshot (`public/assets/refereneces/About Page.png`):

1. **Hero** — "Nice to meet you..." intro paragraph + two stat Chips (§3.7, inline data — `06+ Years at the Table`, `150+ Hands Played (Projects)`) + `PhotoCardSpread` (§3.9) to the right; stacks to one column below **920px** (its own breakpoint, not the page's general 767px mobile cutover below — **revised, responsive audit follow-up, July 2026**: above 767px, the row's two halves each hit a hard floor that can't shrink further — two unwrapped stat chips on one side, `PhotoCardSpread`'s true native size on the other, since only 2 placeholder photos exist — together exceeding the row's own shrinking width starting around 870px, bleeding the photo card past the dashed frame border through that whole 767-870px gap; §7). Once stacked, `.heroIntro` caps at 600px (was 100%, matching House Rules' body-copy width) so text doesn't stretch into overly long lines at the wider stacking point.
2. **The Run** — "Career so far, dealt in order" + `ExperienceCardSpread` (§3.10), centered.
3. **House Rules** — "How I play the game" + three body-copy paragraphs, plain Outfit text (`body-text-color`, §1.5) — no new component.
4. **Chips up my sleeve** — "Tools & stack" + a tool-chip grid (§3.7), `ToolChipData` (`data/types.ts`) instances now sourced from Sanity's `tools` documents (`getFeaturedTools()`, resolved CMS integration Phase 10) with real per-tool logos/colors — count is data-driven, no longer a fixed 19-entry mock array (`data/tools.ts`, deleted).
5. **Tables I've Played** — "Brands & clients" + a `BrandCard` grid (§3.8), `Brand` (`data/types.ts`) instances now sourced from Sanity's `clients` field on `siteSettings` (resolved CMS integration Phase 10) — count is data-driven (`data/brands.ts`, deleted); the original 19-entry mock was deliberately one short of a full 4-column row to exercise last-row centering (see Grid tracks below), a property real content isn't guaranteed to preserve.
6. **"Ready to deal?"** — standalone closing text ("Get in touch"), not a numbered section — sits above the already-built control dock (§3.3/§3.6), which is not rebuilt here.

- **Placement:** `.frame` (§4.3) is chrome hoisted into `app/layout.tsx`, a DOM sibling of each route's own `page.tsx` — so `AboutContent` is rendered by `PlayArea.tsx`'s `!onHome` branch (mirroring Home's own `onHome` content branch) rather than from `app/about/page.tsx` directly, which stays limited to route-owned chrome (`FeltBackground`). The control dock is also chrome hoisted into `app/layout.tsx` (§3.6), so it isn't authored in `app/about/page.tsx` either.
- **Scroll mechanism:** a single plain `overflow-y: auto` region — deliberately not a reuse of Home's eased-scroll + draggable-rail system (`PlayArea.tsx`'s `SCROLL_EASE`/`scrollYRef`), which exists to stay synced with the WebGL canvas that never renders on `/about`. Bottom padding reserves clearance above the fixed control dock — 140px desktop, **264px mobile (revised, responsive audit follow-up, July 2026; was 120px)**: below 767px the dock restacks into a ~248px-tall fixed column rather than staying the ~61px desktop pill (§3.3), and 120px wasn't enough — "Ready to deal?" stayed permanently hidden behind it even scrolled to the true bottom. Same fix/derivation as the Home card grid's identical bug (§4.2, §7).
- **`.run`'s width (responsive audit follow-up, July 2026):** explicit `width: 100%` — without it, the section shrink-wraps to fit `ExperienceCardSpread`'s oversized child instead of being constrained by the page column, silently overflowing past `.scrollRegion`'s `overflow-x: hidden` with no way to scroll back (§7). Matches `.hero`'s pre-existing pattern.
- **Tool/brand layout (flexbox, not CSS Grid):** both the tool grid and brand grid use `display: flex; flex-wrap: wrap; justify-content: center` — **deliberately not CSS Grid's `auto-fit`**, which was the first implementation. Grid's `auto-fit` places each item into its own fixed column track, so an incomplete final row left-aligns within those tracks instead of centering as a group; flex-wrap centers every row's content independently, incomplete rows included, since `justify-content` applies per line rather than per fixed track. Both grids keep an explicit `width: 100%` on the flex container (not just `max-width`) since they're flex children of a parent that centers rather than stretches its children (`align-items: center`) — without a definite width, `flex-wrap` has no fixed box to wrap against and just grows to fit its own content instead of reflowing at the frame's true edge. Same max-widths as before: tool grid 100px items/32px column-gap/40px row-gap, max-width 640px (desktop, ~5 columns); brand grid 230px items/24px gap, max-width 992px (desktop, exactly 4 columns).
- **"The Run" responsive behavior:** see §3.10 for the full narrowed-fan / mobile-peek-stack redesign (responsive audit follow-up, July 2026) that replaced the original single fixed fan, which didn't fit any viewport below ~1070px.
- **Section-reveal choreography (resolved, July 2026):** Hero, The Run, Chips up my sleeve, and Tables I've Played each play a first-visit-only "dealt in" entrance the first time they're scrolled into view — House Rules and the closing "Ready to deal?" text are plain copy with no cards to animate, so they're unaffected. Gated by a new `aboutSectionsRevealed` store field (never resets except a hard reload, same convention as `dealComplete`/`dockNavPhase`) combined with a per-section `useInView` (once-only) — see `hooks/useAboutSectionsGate.ts`, `hooks/useSectionReveal.ts`, `hooks/useEntranceHoldReveal.ts`. On a nav-arrival from Home, the reveal additionally waits for the page-level slide-in-from-right (`MOTION.aboutNav`) to settle before arming, so the two transitions never overlap.
  - **Revised (July 2026):** every staggered group deals in strictly one item at a time — each item's own entrance fully finishes (plus a small breathing gap, `MOTION.aboutSectionReveal.stagger`) before the next one starts (`delay_i = i * (duration + stagger)`), rather than overlapping stagger offsets. This replaced an earlier version where a short stagger interval against a much longer per-item duration made items visibly overlap, and a `maxStaggerIndex` cap made every item past #8 fire at once for the tool/brand grids (19 mock entries each at the time) — both removed. A consequence worth knowing: fully sequential timing means large grids take longer to fully sweep through than they would overlapped — the tool/brand grid item counts are now Sanity-driven (§3.7/§3.8), not fixed at 19.
  - **Hero:** `PhotoCardSpread`'s cards fade in translating up from below their resting position, dealt one at a time back-to-front (front/pivot card, highest z-index, dealt last — same convention as The Run below); the two stat `Chip`s play the same fade/translate-up, one at a time, once the photo sequence fully finishes.
  - **The Run:** `ExperienceCardSpread`'s cards play the same fade/translate-up, one at a time in ascending array-index order — both responsive layouts already have z-index ascend with index, so "topmost dealt last" falls out of plain order with no reordering needed. **Revised (July 2026):** `AboutContent.module.css`'s `.runSpreadWrap` sets `overflow-x: auto` with no explicit `overflow-y`, which the CSS Overflow spec silently upgrades to `overflow-y: auto` too (the same `.runSpreadWrap` scrollbar behavior already on record from an earlier bug, §7 item 17) — the entrance's translateY offset, held for the entire pre-trigger wait (not just while animating), was enough to trigger that auto-upgraded scrollbar. Fixed with an explicit `overflow-y: hidden`, plus `padding-bottom` increased from 8px to 48px (8px original scrollbar clearance + the entrance's 40px travel distance) so the container is tall enough to actually contain a card at its offset starting position — `overflow-y: hidden` alone would otherwise have clipped the bottom of each card while pre-trigger/mid-animation.
  - **Chips up my sleeve:** each tool `Chip` deals in already showing its hover-revealed pose (lifted, tool-name label visible — a new `.forceRevealed` CSS class in `Chip.module.css`, declared outside the `(hover: hover)` guard so it also works on touch), one at a time, then settles to idle after a short hold once its own entrance has actually finished (not from when it started) — so the settle-to-idle transitions land one at a time too, in the same order, with no separate bookkeeping needed.
  - **Tables I've Played:** each `BrandCard` deals in already showing its revealed (logo) state via a new, independent `entranceRevealed`-style local flag folded into the existing `isRevealed` check — kept separate from the tap-controlled, exclusive-across-the-grid `revealed` prop, so multiple cards can be entrance-revealed at once without breaking that single-selection invariant — then settles to its name one at a time, same hold/settle timing fix as the tool chips above, via the already-existing swap transition.
  - Tokens: `MOTION.aboutSectionReveal` (`lib/motion.ts`) — `translateY` 40px, `duration` 220ms/item, `stagger` 10ms gap after each item finishes, `heroChipsGap` 150ms, `chipHoldDuration`/`brandHoldDuration` 650ms, `routeTransitionBuffer` 100ms — placeholder values, pending tuning like every other route-nav/onboarding block in §6.

### 3.12 404 Page ("Bust!")

**Resolved (Phase 1 build, July 2026):** a net-new page — no Figma source, not previously specced in either doc — reached for any route that doesn't match `/` or `/about` (`app/not-found.tsx`, plus `components/dom/NotFoundContent.tsx`/`DigitCard.tsx`). Reuses the site-wide chrome (felt background, play-area frame, table header, §3.4/§4.3) exactly like `/about` (§3.11) — only the frame's interior content differs, and the control dock doesn't render on this route at all (§3.3).

- **Placement:** same pattern as `/about` (§3.11) — `app/not-found.tsx` renders only route-owned chrome (`FeltBackground`); the frame's interior content is rendered by `PlayArea.tsx`'s third route branch (alongside the existing Home/`onHome` and About branches), not authored in the page file directly.
- **Layout:** the whole content block (heading + card spread + "Page Not Found") is vertically centered within the play-area frame, same safe-centering pattern as About's `.runSpreadWrap` (§3.11) — centers when it fits, reachable via scroll if it doesn't. Within that block, "Bust!" aligns to its own top edge and the card spread sits well below it (not overlapping its upper/middle portion), so most of the word stays visible above the cards at all times.
- **"Bust!" heading:** Meow Script, `clamp(140px, 26vw, 380px)` desktop / `clamp(90px, 30vw, 200px)` mobile, 60% opacity (§2.1) — a giant, dim background flourish the page is built around. The gap between the text's top alignment and the card spread below it is a fraction of the heading's own font-size clamp (not a fixed px value), so the same proportion of the word — most of it — stays visible above the cards at every viewport width.
- **Card spread:** three `DigitCard`s reading **4, 0, 4** — the same white card-front shell as Photo Card (§3.9: `card-front-bg`, 4px radius, `shadow-rest`, the two-corner-mark treatment), sized down from the shell's usual 214×300 to 160×224 (desktop) / 110×154 (mobile — matching the Home grid's own mobile card size, §4.2) with one large centered digit (Outfit, `card-front-text`) in place of a photo+name. **Deliberately sized down and positioned low enough that the fan never fully covers "Bust!"** at any point in its loop — legibility of both layers simultaneously was a hard requirement, not just an incidental overlap effect.
  - **Fan geometry — mirrors Experience Card's desktop bow shape (§3.10), not a new geometry:** directly reuses `MOTION.experienceFan.desktop` (`xStepPx` 150, `rotationStepDeg` 5, `liftPx` 18) — center card ("0") as the pivot, the two "4" cards rotated outward alternating left/right and dropped lower, the further-from-center-drops-lower "hand fanned around a pivot below" read. **Unlike Experience Card, there's no separate mobile peek-stack layout** — the same bow shape holds at every viewport width; only its scale changes (`xStepPx`/`liftPx` scaled by the same ratio as the mobile card-size reduction, rotation left unscaled since an angle doesn't need to shrink with the card).
  - **Entrance/loop motion — mirrors Experience Card's section-reveal entrance (§3.11), not a new recipe:** each card fades up from below into its fan position using `MOTION.aboutSectionReveal`'s `translateY`/`duration`/`stagger` verbatim (the same "one at a time, `delay_i = i × (duration + stagger)`" recipe Photo/Experience Card use) — then, since this is a continuous ambient loop rather than a one-shot reveal, holds at rest and **plays the identical fade+translate motion in reverse** to deal back out, holds off-screen, and repeats. Two new hold/gap values live in `MOTION.notFound.cardLoop` (§6) — nothing else is new; the motion itself is intentionally the same recipe as the About page, not a bespoke one.
  - **Deal order and stacking — plain left-to-right, not rank/center-based:** dealt in reading order (left "4", then center "0", then right "4"), and z-index ascends with that same array order (the rightmost "4" ends up on top) — matching Experience Card's own "z-index ascends with index" convention (§3.10) exactly, even though this spread's *position* geometry (previous bullet) is a symmetric center-pivot fan, unlike Experience Card's single-direction row. The two aren't the same axis: deal order is a rank/DOM ordering choice, position is pure geometry.
  - **Click-to-return:** the entire card-spread box (not a separate text link) is a `next/link` to `/`, `aria-label="Return to the table"` — clicking or tapping anywhere in it navigates home, including a fresh landing directly on Home's onboarding gate (the dock renders nothing there either until the deck is dealt, §3.3/§4.1). A separate instruction line beneath "Page Not Found" tells sighted visitors where to click.
- **"Page Not Found":** Outfit (§2.2), beneath the Bust!/card-spread block.
- **Control dock:** does not render on this route at all (§3.3) — not a compact/reduced state, simply absent.
- **Entrance:** a single self-contained fade + upward-translate on mount (`MOTION.notFound.entranceDuration`/`entranceTranslateY`, §6) — deliberately independent of the Home <-> About route-transition choreography (`dockNavPhase`, §3.6): a 404 is only ever reached via a hard/broken link, never the in-app dock toggle, so there's no matching "exit" transition on the other end to coordinate with. A direct load renders the entrance once on mount, same as any other route.

### 3.13 Reading Pane Content (hero / overview / closing shell)

**Resolved (Sanity CMS integration Phase 6, July 2026):** the reading pane (`OpenCardOverlay`,
PRD §4.5, pane geometry/crossfade mechanics at DS §5) previously rendered flat title/category/body
text with no real content structure. Structural reference: `public/cms/PROJECT_PAGE_LAYOUT.md` §5/§6
— ported as *structure only* (DOM shape, conditional-rendering rules, which fields go where); every
pixel/hex/rem value re-derived from this project's own tokens, never copied verbatim (its §3 page-
chrome resets — body background, `main` reset, global `h1-h6` reset — were confirmed pure chrome and
explicitly not ported at all; this app already owns its own page shell).

- **Per-project theming:** 4 inline CSS custom properties set on the pane root —
  `--projectBgColor`/`--projectColor`/`--projectColorDark`/`--projectCtaColor`, sourced from Sanity's
  `previewColor`/`projectColor`/`projectColorDark`/`ctaColor` — plus a 5th, `--toolColor`, scoped
  locally per tool pill from the `tools` document's own `color` field. Fetched eagerly at listing
  time (not the lazy per-card detail fetch) specifically so the pane's colors are present from the
  instant it opens, no color-pop.
- **Hero:** full-bleed hero image first (`object-fit: cover` inside a **fixed-height** crop box —
  500px desktop, 360px ≤768px, 240px ≤590px — every project renders at the same height regardless of
  its own image's aspect ratio, tucked behind the sticky close button via a `-52px` margin trick),
  then category pill (bg `--projectColor`, white text) **stacked above** the title as its own block
  (revised from an initial inline "category — title" treatment in the same `<h1>` — deviates from the
  reference's inline pattern, a deliberate call, not a structural constraint) — title alone in `<h1>`
  (34px/500, this project's pre-existing reading-pane title size, not the reference's 2.441rem Figma
  value), conditional subheading `<h2>` and description `<p>` (both omitted if empty — the reference
  doc is silent on this, but rendering visibly-empty text is never correct). No hotspot/focal-point
  cropping (deferred, same precedent as the card-front image, §3.2). The closing image reuses the
  exact same fixed-height crop-box treatment (a shared `.imageBlock` base class) — both share the
  ArtBlock placeholder canvas's sizing logic too (reads its own container's rendered height rather
  than a fixed aspect ratio), so there's no height jump when the real image finishes loading in.
- **Overview:** one `.customSection` (32px internal gap, revised from 24px — §7 item 26 — the padding/gap
  "rhythm device" the reference reuses throughout every category body too, Phase 7) holding, in order: a
  conditional tags row (pill chips — `rgba(28,28,28,0.08)`, not the reference's unthemed static
  `#CCCCCC`; **no longer matches the close button's own treatment** since its July 22 restyle, §7 item
  25 — flagged there as an open styling inconsistency, not resolved here), a conditional quick-stats
  grid (3 columns desktop / 2 at ≤590px, each stat left-bordered in `--projectColor`), and a conditional
  tools row (also left-bordered in `--projectColor`; each tool pill bg'd in its own `--toolColor` with
  dark text — light pastel tool colors made white text unreadable, caught via visual verification
  against real data).
- **Close button (revised, §7 item 25):** `card-front-bg`/`card-front-text` fill/text with a y-axis-only
  drop shadow that grows on hover (scale 1.1×, lift 2px) and flattens on `:active` (scale 0.92×) —
  reads as physically lifting off and settling back onto the page, distinct from the shared `shadow-*`
  elevation tokens (§5) used elsewhere, which carry an x-offset for the table's raking light.
- **Footer wordmark (new, §7 item 26):** a "STEVANO / glyph / PETERS" lockup at the bottom of the pane,
  echoing `TableHeader` (§3.4) at `card-front-text` color/0.55 opacity — see §7 item 26 for the full
  build note.
- **Closing:** the same hero-image markup reused a second time with `closingImage`, omitted entirely
  (no placeholder) if absent — unlike the hero position, there's no flip/crossfade continuity need to
  preserve at the bottom of a scrollable pane.
- **Category-specific body** (`PROJECT_PAGE_LAYOUT.md` §7/§9) is explicitly **not** part of this
  section — it inserts between Overview and Closing, per §3.14.
- **Breakpoints:** only 768px and 590px are used within the shell itself — §3.14's pattern vocabulary
  introduces the other 3 (1024px/450px/320px, live-link responsive rules only).
- **Typography:** headings use this app's default UI face (Outfit), not its decorative script face
  (`--font-script`/Meow Script) — project titles are arbitrary real content needing legibility, unlike
  the app's intentional one-off script moments ("Pick a Card," "Hello!").

### 3.14 Reading Pane Category-Specific Body Patterns

**Resolved (Sanity CMS integration Phase 7, July 2026):** the category-body content that slots
between Overview and the closing image (§3.13), per `PROJECT_PAGE_LAYOUT.md` §7 (pattern vocabulary)
and §9 (per-category section order). One shared component library
(`components/dom/ProjectBody/`), not 4 independent renderers — every category composes the same 9
pattern primitives, matching the reference's own one-vocabulary-four-bodies structure.

- **`TextImageRow`** — heading/body/bullet-list paired with media, `reverse` flips desktop layout
  (image left vs. right); both variants collapse to `column-reverse` ≤768px.
- **`SoloTextContainer`** — heading/body/bullet-list, no paired media (the "section intro" primitive
  nearly every section opens with).
- **`SoloImageContainer`** / **`MediaGallery`** — full-width gallery items at natural aspect ratio (no
  crop, unlike the hero/closing's fixed-height cover-crop) — `MediaGallery` positionally pairs
  parallel images/videos/videoPosters arrays, one `SoloImageContainer` per index.
- **`InfoCardGrid`** / **`SoloInfoCard`** — 2- or 3-col card grid (collapses to 2 ≤768px, 1 ≤590px),
  optionally numbered (`{index+1}`) instead of titled; `SoloInfoCard` is the same card styling
  standalone, left-aligned instead of centered.
- **`PortraitImageGrid`** — 3-col portrait grid, `object-fit: contain` (not `cover` — full designs
  stay uncropped), Logos & Branding Core Sections only. Images and videos render as two independently
  -gated passes, not interleaved.
- **`DividerSection`** — full-bleed media with a dark overlay and centered white heading, UX Case
  Studies' 4 chapter breaks only (Research/Ideation/Visual Design/Final Thoughts).
- **`LiveLinkRow`** — CTA button row, icon resolved from `public/assets/icons/{ctaIcon}LinkIcon.svg`
  (this app's asset path, not the reference's bare-root one), themed via `--projectCtaColor`. Absent
  entirely from Logos & Branding (confirmed — the only one of the 4 categories with no live links).
- **Section rhythm** — light/dark alternation via a shared `Section` component, reusing the padding/
  gap recipe already established for Overview (§3.13).
- **Media recipe** — video always wins over image when both are populated for a slot; `next/image`
  at hardcoded 1920×1080 (landscape) / 1080×1920 (portrait grid only), aspect enforced by container
  CSS, not real asset metadata — matches the reference's own approach exactly.
- **Breakpoints introduced here**: 1024px (live-link row stacks to column), 450px (live-link button
  goes full-width), 320px (live-link icon hidden) — live-links are the only pattern in this
  vocabulary that needs tiers beyond 768px/590px.
- **Alt text**: a single generic fallback per image (built from the section heading), not a real
  per-field CMS-sourced alt — a deliberate scope reduction from the reference's ~150 hand-fetched
  fallback strings; a clean, isolated follow-up if wanted later.
- **Colors re-derived, not copied**: tag pills use this app's existing `rgba(28,28,28,0.08)` chip
  treatment (not the reference's unthemed `#CCCCCC`); tool pills use dark text (`--card-front-text`)
  rather than white — real tool colors turned out to be light pastels, confirmed via live-data
  verification, where white text was unreadable.

---

## 4. Layout

### 4.1 Table grid (desktop)
- **4 columns when there's room, 3 otherwise** — card count is data-driven (`data/projects.ts`, currently 15), no longer a hard cap. Cards are sized to fit the play area's width (and height, up to the 2-row reference density); rows beyond that extend the content downward and scroll within the play area (§4.3) rather than shrinking every card to fit. Below ~1360px of play-area width, a 4th column would force every card to shrink past what 3 columns can already show at full size, so the grid drops to 3 columns instead — the two column counts are compared directly (`lib/layout.ts`'s `getLayout`) and whichever yields the larger card scale wins, so the 3→4 switch always lands exactly where it stops shrinking anything (§7 item 10).
- Card pitch: 274px horizontal, 360px vertical
- Card size: 214×300px → **gutter: 60px** both axes (consistent)

### 4.2 Mobile
Not present in Figma — derived to satisfy the PRD's 3-column requirement while preserving the desktop card's proportions.

- Card size: **~110×154px** (maintains the 214:300 / ~0.713 aspect ratio)
- Gutter: **12px** between cards
- Outer padding: **16px**
- Fits 3-up comfortably on a ~390px viewport with room to breathe; scales proportionally on wider phones
- Fixed 3-column grid, same data-driven row count/scroll behavior as desktop (§4.1) — mobile never height-scaled even before the play-area refactor, so this is a direct extension rather than a behavior change.
- Bottom padding reserves 264px of clearance below the last row — sized to clear the stacked control dock (§3.3), which sits fixed over the grid rather than beside it below 767px (§7 item 11).

### 4.3 Table framing
- The dashed border in the Figma table view is a **permanent UI element** — the tablecloth/play-area edge, not an annotation to strip.
- **Resolved (Phase 1 build, play-area refactor):** the play area is now the app's real main content container (everything except the top header), not a decorative overlay. It renders as a fully-bordered box on all four sides — no longer bleeding past the viewport bottom — and its interior is the actual native scroll boundary for card content: rows beyond the 2-row reference density (§4.1) scroll within it. The "Pick a Card" heading is a real child of this container, pinned at its top (does not scroll with the cards).
- **Onboarding-gated border (§3.5):** on Home, the dashed border itself is invisible (alpha 0) through the onboarding phase, fading in once the deck is clicked — geometry/scroll-boundary role never changes, only the border color's alpha channel animates.
- **Persists across routes (§3.6):** the frame (and the table header, §3.4, and the control dock, §3.3) is hoisted into the root layout and persists across the Home <-> About route change as site-wide chrome rather than remounting. On `/about` there's no onboarding concept, so the border renders immediately regardless of Home's deal state; only Home's own onboarding gate keeps the alpha-fade behavior above. The frame's interior content (heading, card grid, canvas) is Home-only and never renders on `/about`.
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
| Deck exit/enter (route transition) | 450ms/card, 40ms stagger, 1200px travel | ease-in (exit) / ease-out (enter) | slides the whole deck off-table to the left and fades it, or the reverse — Home <-> About route transition (§3.6); the dock itself has no equivalent animation, this is deck/heading-only; travel distance must clear the play area's max width or a card can be left partially in-frame — *placeholder, pending tuning* |
| "Pick a Card" exit/enter (route transition) | 500ms | openEase | fades + translates 60px upward on About/Back-to-Home click, reverses on return — distinct from the onboarding entrance above, no header-relative delay (§3.6) — *placeholder, pending tuning* |
| About content exit/enter (route transition) | 500ms, 60px travel | openEase | `AboutContent`'s own root translates + fades in from the right on arrival (Home -> About), or out to the right before the route changes back (About -> Home) — mirrors the row above but for a single DOM block, not staggered WebGL cards (§3.6) — *placeholder, pending tuning* |
| About section-reveal (Hero/Run/Chips/Brands) | 220ms/item, 10ms gap after each finishes, 40px travel | easeOut | First-visit-only "dealt in" fade+translate-up per section, on viewport intersection, one item at a time — never overlapping (§3.11); tool chips/brand cards additionally hold a forced-revealed pose ~650ms (measured from when their own entrance finishes) before settling, one at a time — *placeholder, pending tuning* |
| Route toggle thumb slide | 320ms | openEase | `DockToggle`'s thumb translates 45px between the Home/About rest positions (§3.3) — *placeholder, pending tuning* |
| Route toggle icon de-emphasis (origin) | 150ms | openEase | starts immediately as the thumb departs — *placeholder, pending tuning* |
| Route toggle icon re-emphasis (destination) | 180ms, 140ms delay | openEase | delayed so it lands at full size/opacity exactly as the thumb arrives (§3.3) — *placeholder, pending tuning* |
| 404 page entrance | 500ms, 40px translateY | openEase | whole-block fade + upward translate on mount, self-contained (§3.12) — *placeholder, pending tuning* |
| 404 card-spread deal-in/hold/deal-out loop | 220ms in (reused `aboutSectionReveal.duration`) / 1600ms hold / 220ms out (reverse of in) / 500ms gap | easeOut in, easeIn out | continuous loop, one card at a time (`aboutSectionReveal.stagger` gap); fan rest geometry reuses `MOTION.experienceFan.desktop` verbatim (§3.10/§3.12) — only `holdDuration`/`cycleGap` (`MOTION.notFound.cardLoop`) are new — *placeholder, pending tuning* |

**Interrupt behavior:** clicks on a card are ignored while the entrance deal is in progress — no queuing, no interrupt. The visitor simply has to wait the ~1–2s for the deal to finish before any card is interactive.

## 7. Confirmed open items

Resolved during the Phase 1 build (July 2026):

1. **Meow Script fallback** — loaded via `next/font` with `display: swap`; a brief cursive-fallback FOUT is accepted since the heading is decorative. Outfit loads the same way and canvas text drawing awaits `document.fonts.load` before compositing card fronts.
2. **Dock "active" toggle state** — the cover/reveal button gets a brighter glass fill (`rgba(255,255,255,0.32)` top stop) and brighter border while "revealed" is active, plus `aria-pressed`. No new color token.
3. **Peeking + flagship interaction** — peek stays purely geometric (angle only). The gold back is simply what's physically peeking; no color change is triggered.
4. **Play area as real container** — the dashed play-area box (§4.3) is now the app's live content container and scroll boundary, not decorative-only; card count is data-driven rather than a fixed 8 (§4.1/§4.2). ControlDock and ChipStackTracker remain viewport-pinned chrome outside the play area; OpenCardOverlay remains viewport-grounded, independent of play-area scroll position.
5. **Scatter stagger direction (close, PRD §4.5)** — farthest-card-first, not nearest-first. Rationale: since travel duration is fixed rather than distance-scaled (matching Gather/Deal's precedent), farthest-first means the cards with the most ground to cover start earliest and cover it at the same visual speed as everything else, while near-neighbors peel off moments later and snap back almost immediately — reading as a single outward "burst" that settles together, rather than a slow trickle or an "unstacking a deck" motion.
6. **Onboarding gate (pre-table)** — a "Hello!"/tap-the-deck gate now precedes the entrance deal; the deal no longer fires automatically on load (PRD §4.1, DS §3.5). Structure and choreography (text/logo layers, shuffle loop, dock formation, header/heading reveal sequencing) are built and functioning.
7. **About panel scope** — resolved as its own route (`/about`), not the card-open overlay pattern (§3.6, PRD §4.8/§10). The control dock, table header, and play-area frame all persist site-wide as chrome (§3.3/§3.4/§4.3) — the dock's onboarding-formation choreography (§3.5) plays once, on Home, and is not replayed for Home <-> About navigation (revised July 2026; originally reused bidirectionally as the route-transition animation itself).
8. **About page content** — the route/dock/transition, and now the page's own section layout and copy, are built (§3.11): Hero, The Run, House Rules, Chips up my sleeve, Tables I've Played, and the closing "Ready to deal?" text, using all four previously-unplaced building blocks (Chip §3.7, Brand Card §3.8, Photo Card §3.9, Experience Card §3.10). Structure and content only — see still-open item below for the remaining animation pass.
9. **Responsive control dock** — below 767px the dock restacks into a centered vertical column (logo, left group, right group) instead of the horizontal pill, and reshapes from a `999px`-radius pill to a `28px`-radius rounded rectangle (§3.3). CSS-only change, no component logic touched.
10. **Table grid had no mid-width tier (§4.1)** — a single 767px breakpoint switched directly between the mobile 3-column grid and the desktop 4-column grid, even though 4 full-size columns need ~1360px+ of play-area width to actually fit — cards visibly shrank crossing from mobile into "desktop" (found during a responsive audit, not a Figma-derived gap). Resolved: the desktop grid computes both a 3- and 4-column scale and keeps whichever is larger, so viewports from 768px up to ~1360px render 3 wide columns instead of 4 cramped ones (`lib/layout.ts`).
11. **Mobile control dock overlapped the last card row (§4.2)** — `MOBILE.bottomPad` (32px) didn't reserve enough clearance for the stacked mobile dock (§3.3), which sits `position: fixed` over the card grid rather than beside it; the last row stayed hidden and unclickable behind it even scrolled all the way down. Resolved: `MOBILE.bottomPad` increased to 264px, derived from the stacked dock's own fixed mobile geometry (`lib/layout.ts`).
12. **About page control dock also overlapped its last section (§3.11)** — same bug as item 11, but for `/about`'s closing "Ready to deal?" text rather than Home's card grid: `AboutContent.module.css`'s mobile bottom padding (120px) was sized for the desktop pill, not the ~248px-tall stacked mobile dock. Resolved: raised to 264px, matching item 11's derivation.
13. **"The Run" silently lost cards below ~1070px width (§3.10/§3.11)** — two compounding bugs, both found via a responsive audit, not Figma-derived: `.run` (`AboutContent.module.css`) had no `width: 100%`, so it shrink-wrapped to fit `ExperienceCardSpread`'s oversized child instead of being constrained by the page column, silently overflowing past `.scrollRegion`'s `overflow-x: hidden` with no way to scroll back; and `ExperienceCardSpread.module.css`'s `.spread` had no `flex-shrink: 0`, so its flex parent compressed it below its own intended width, pushing every card's calculated position into negative, permanently-unreachable territory — a `justify-content: safe center` scroll-fallback attempt alone didn't fix it, since the shrinking (not the alignment) was the actual bug. Resolved: both fixed; combined with the narrowed fan + mobile stack (§3.10), all 4 cards are reachable at every viewport width now.
14. **Hero section had no breakpoint of its own (§3.11)** — above 767px, the Hero row's two halves each hit a hard floor that couldn't shrink further (two unwrapped stat chips on one side, the photo spread's true native size on the other), together exceeding the row's own shrinking width starting around 870px; the photo card visibly bled past the dashed frame border through that whole 767-870px gap. Resolved: Hero's stacking rules moved to their own 920px breakpoint (with a new 600px text cap once stacked), independent of the page's general 767px mobile cutover.
15. **Brand grid stuck at 1 column on phones (§3.8)** — `BrandCard`'s fixed 230×150px size left no room for `.brandGrid`'s flex-wrap to ever produce more than 1 column below ~475px of available content width. Resolved: a mobile size reduction (130×104px) sized for a 2-column fit down to 320px viewports; wider phones grow to 3 columns on their own via the existing flex-wrap, no extra breakpoint needed.
16. **"The Run" fan stayed fixed-size instead of scaling down (§3.10)** — item 13's fix (narrowed fan + working scroll fallback) still left cards pinned at native size from ~1070px down to 767px, needing a visibly-scrolling `.runSpreadWrap` for that whole range instead of just shrinking to fit — noticeable on ordinary laptop-width windows, not just extreme edge cases. Resolved: the fan now measures its own available width and continuously scales card size/step/lift together (capped at native size), so it only needs the scroll fallback in the brief pre-measurement window rather than as normal-use behavior.
17. **"The Run" fan clipped vertically + mobile stack text got cut off (§3.10)** — item 16's scale fix only compensated the horizontal rotation overhang, so the fan's bottom edge still clipped (with both a horizontal and vertical `.runSpreadWrap` scrollbar) at the same widths; separately, the mobile peek-stack's `revealPx` (135px) still cut off the last line of longer title+company combinations. Resolved: the scale calculation now computes every card's true rotated bounding box on both axes (not an approximation for one axis); `revealPx` raised to 160px and `ExperienceCard`'s top padding trimmed 32px->24px, both set from a live measurement of the longest real entry rather than estimated; mobile stack cards also gained a stronger, mostly-downward shadow (`elevated` prop) so the stacking reads clearly against the near-white card-on-card background.
18. **About page section entrance/scroll choreography, partially (§3.11/§6)** — Hero, The Run, Chips up my sleeve, and Tables I've Played now play a first-visit-only "dealt in" stagger on viewport intersection, gated the same way Home's onboarding gate is (a store field that never resets except a hard reload). House Rules and the closing "Ready to deal?" text remain plain copy with no reveal — see item 19 below for what's still open.
20. **Real contact/resume destinations** — the About dock's Email, LinkedIn, X, and Resume previously pointed at placeholder values in `lib/aboutLinks.ts`. Resolved by CMS integration Phase 10 (July 17, 2026): `lib/aboutLinks.ts` is deleted; the dock now reads real `resumeUrl`/`socialLinks` off Sanity's `siteSettings` document (`lib/getSiteSettings.ts`), degrading to an empty default only on fetch failure, not by design.
21. **Real tool-chip logo assets** — every entry in `data/tools.ts` (§3.11) previously reused the one real logo asset that exists (`Typescript.png`) as a placeholder. Resolved by CMS integration Phase 10 (July 17, 2026): `data/tools.ts` is deleted; tool chips now read real per-tool `logoUrl`/`logoAlt`/`color` off Sanity's `tools` documents (`getFeaturedTools()`), falling back to the tool's `title` only when `logoAlt` isn't authored yet in the Studio (a content gap, not a code gap).
22. **404 / Not Found page (§3.12)** — a net-new page (`app/not-found.tsx`), not previously specced in either doc: a giant, dim "Bust!" (Meow Script) with a looping 4/0/4 card fan in front of it (click-anywhere-to-return-home) — sized and gapped so the fan never fully covers the word — and "Page Not Found" (Outfit) beneath. The card fan's geometry and entrance motion are a deliberate mirror of Experience Card's desktop bow shape and section-reveal entrance (§3.10/§3.11), not a new recipe. The control dock doesn't render on this route at all (§3.3). Structure, layout, and the loop/entrance/click-to-navigate behavior are built and functioning.
23. **Card-front per-project color theming (§3.2, CMS integration Phase 4)** — previously undocumented and genuinely unresolved (neither this doc nor the PRD mentioned Sanity's 4 project color fields at all). Resolved (Phase 4, July 17, 2026): `previewColor` sources the card frame's fill; `projectColor`/`projectColorDark`/`ctaColor` are out of scope for the card front entirely, reserved for the reading-pane overlay's per-project theming instead. **Reverted (July 22, 2026):** the per-project fill is out again — the card front fills with the fixed `card-front-bg` token (§1.3) for every project, `project.frontBg`/`previewColor` no longer read on the card front at all (`lib/textures/compositeCardFront.ts`, `lib/textures/textureCache.ts`'s cache key also dropped the now-unused `frontBg` segment). A deliberate design call, not a bug — per-project color felt inconsistent with the rest of the card grid's visual rhythm. Also resolved in the original Phase 4 pass, unaffected by the revert: real hero images are center-cropped into the existing image block (no hotspot/focal-point support yet — deliberate first-pass scope cut, not a gap).
24. **Card-front `date` field (§3.2, CMS integration Phase 5)** — the mock `date` value ("May 2025," etc.) has no equivalent anywhere in the real Sanity schema. Resolved: dropped entirely, not deferred — the card-front micro-label and the reading-pane's meta line both show category only now. The micro-label's font bumped 6px → 7px in the same pass, since the line no longer needs to fit a "- date" suffix. **Refined after real data landed**: title wrapping was added (up to 2 lines, ellipsis-truncated beyond that, respecting the same 8px padding on both sides — it previously ran unbounded past the right padding), the category micro-label bumped again to 11px, and the card-front image source switched from `heroImage` to `previewImage` (the field `SCHEMA.md` §3b actually documents for grid/listing use — `heroImage` is reserved for the expanded project page, Phase 6/7).
25. **Reading-pane close button restyle (§3.13)** — the close button previously used a flat `rgba(28,28,28,0.08)` chip fill (matching the pane's own tag-pill treatment, deliberately, per §3.13). Resolved (July 22, 2026): restyled to a "physically lifting" glass button — `card-front-bg`/`card-front-text` fill/text (matching the card-front frame it echoes), a y-axis-only drop shadow (unlike the shared `shadow-*` tokens, §5, which carry an x-offset for the table's raking light), scale + shadow growth on hover, a fast flatten-back-down on `:active`, and an explicit `:focus-visible` outline (previously relying on default browser focus styling). **Deviation, flagged:** this close button no longer matches the tag-pill treatment §3.13 describes it as sharing — the tag pills themselves are unchanged (still the flat `rgba(28,28,28,0.08)` chip), so that cross-reference in §3.13 is now stale/one-directional; worth a deliberate decision on whether tag pills should follow the button's new treatment or the two should be documented as intentionally divergent.
26. **Reading-pane footer wordmark (§3.13)** — net-new, not previously specced in either doc. A "STEVANO / glyph / PETERS" lockup (`.paneFooter`, `OpenCardOverlay.tsx`) sits at the bottom of every project's reading pane, echoing `TableHeader`'s own wordmark (§3.4) at `card-front-text` color, 0.55 opacity. Unlike the header's `<img>` tag, the glyph is a CSS `mask-image` of the same `/assets/logo-mark.png` asset (the DOM equivalent of the canvas source-in tinting in `lib/textures/tintSvg.ts`), so it renders in an arbitrary color via `currentColor` instead of a fixed white PNG. The pane's former flat `padding-bottom: 64px` is now owned by the footer itself (split evenly top/bottom via the footer's own padding), so the lockup sits centered in that reserved band rather than hugging its top edge. `.customSection`'s internal gap also widened 24px → 32px in the same pass (more breathing room now that a footer block follows the last section).

Still open:

19. **Onboarding + route-transition + section-reveal timing values (§3.5/§3.6/§6)** — implemented and functional, but every duration/delay in `MOTION.onboardingShuffle`, `MOTION.onboarding`, `MOTION.tableNav`, `MOTION.aboutNav`, `MOTION.aboutSectionReveal`, and the new `MOTION.notFound` (`lib/motion.ts`) is explicitly marked in code as a placeholder pending a dedicated tuning pass, unlike the rest of §6 which is signed-off.

---

## 8. Source reference

- Figma file: `8ENJvHnX9pC73D9qUn7SN6`, page "Main Elements" (node `1:2408`)
- Card Back: node `1:2409`
- Card Front: node `1:2672`
- Homepage/table view: node `1:2685`
- Control Bar: node `1:2695`
- Chip (stat/tool, §3.7): user-provided Figma SVG exports, `public/assets/referneces/stat.svg` and `tool.svg` — not sourced via the Figma MCP node IDs above (see §3.7 for why)
