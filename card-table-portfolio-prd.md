# PRD: Card Table Portfolio (Prototype Phase)

**Status:** Draft v18 — Prototype scope (Phase 1 implemented; About page resolved as its own route; Chip, Brand Card, Photo Card, and Experience Card components built and now placed into the About page's section layout; control dock revised to persist across the Home <-> About route change instead of replaying its formation choreography per navigation; control dock made responsive below 767px; About's own content now has its own page-level route-transition motion, translating in/out from the right; Hero/Run/Chips/Brands now have first-visit-only section-reveal choreography on viewport intersection; a 404/Not Found page added (§4.9), net-new, not previously scoped; Sanity CMS integration — originally scoped as this PRD's own Phase 2 — has since shipped as a separate, more granular tracked effort, `public/cms/INTEGRATION_CHECKLIST.md` (Phases 1-10 done); the mock-data era described in §1/§2 below no longer reflects the live app)
**Owner:** [Your name]
**Last updated:** July 22, 2026

---

## 1. Summary

An alternate, spatially-themed front end for an existing portfolio, presented as a top-down view of a card table. Each project (and eventually other content) is represented as a physical playing card. Cards can be face-down (covered) or face-up (revealed), can be shuffled, and can be clicked to open — flipping and scaling up into a scrollable reading view of the underlying page content.

This PRD originally covered the **prototype phase only**: a standalone project with mock/hardcoded content, focused entirely on proving out the visual and interaction design, with CMS integration (Sanity) and full portfolio replacement explicitly deferred to a later phase. That later phase has since happened: Sanity CMS integration is live (see `public/cms/INTEGRATION_CHECKLIST.md` for the phase-by-phase build). The interaction/animation design this PRD specifies is unchanged by that work — only the content source moved from `data/projects.ts` (deleted) to live Sanity queries (`lib/getProjects.ts`, `lib/getSiteSettings.ts`).

---

## 2. Goals

- Validate that the card-table metaphor is visually compelling and usable as portfolio navigation.
- Build and tune the core animation choreography (entrance/deal, idle hover, flip, scale, shuffle) before wiring in real content.
- Establish the technical architecture (WebGL table layer + DOM content layer) so CMS integration later is a data-swap, not a rebuild.
- Layer in optional gamification/delight touches that reward curiosity and lingering without gating core navigation.
- Produce something demoable/shareable to gut-check the concept.

### Non-goals (this phase)

- ~~Sanity CMS integration or any dynamic content fetching.~~ — was a Phase 1 non-goal; done as of July 2026, see §9 Phase 2 and `public/cms/INTEGRATION_CHECKLIST.md`.
- Replacing or routing from the existing Next.js portfolio.
- Non-project content types (About, Contact, Resume) as cards.
- Search, filter-by-tag, or sort.
- Hand-ranking / poker-hand-strength tagging of projects (considered, parked — not in scope).
- Full accessibility/SEO polish (baseline keyboard support only — see §8).

---

## 3. User Stories

- As a visitor, I land on a pre-table gate — a "Hello!" heading over the deck, which is visibly shuffling itself — and tap/click the deck to deal myself in, so the first action on the site is deliberate rather than a passive animation I have to wait out.
- As a visitor, I land on the table and watch cards deal themselves into a grid, so the site feels alive and intentional from the first second.
- As a visitor, I can toggle all cards between face-down and face-up, so I can browse either by curiosity (backs) or by preview (fronts).
- As a visitor, I can shuffle the cards to re-randomize their positions, as a playful way to re-encounter the same content.
- As a visitor, I can click any card to open it — it flips (if covered) and/or scales up into a readable, scrollable page, so I can read the project detail without leaving the table's context.
- As a visitor, I can close an opened card and return to the table in its prior state (positions, face-up/down state preserved).
- As an impatient visitor, I can flip the whole table face-up in one action, so I'm never gated behind an animation I don't want to watch.
- As a curious visitor, I can hover a covered card a beat longer than a glance and get a subtle "tell" of what's underneath, without committing to a full flip.
- As a mobile visitor, I get a simplified 3-column grid version of the same cards and interactions, since the literal "table" spatial metaphor doesn't translate well to a small screen.

---

## 4. Feature Requirements

### 4.1 Onboarding Gate + Entrance Animation ("The Deal")

**Resolved (Phase 1 build, July 2026): the deal no longer fires automatically on load.** A pre-table "onboarding" phase now gates it behind a deliberate first action:

- On load, cards spawn already gathered at a single on-screen deck position (below true center) and immediately loop a continuous "overhand shuffle" — a merge/cut/recombine cycle, purely lateral — rather than sitting still. A "Hello!" heading and a "Tap the deck to deal yourself in" subheading sit centered over the table; a standalone wordmark logo floats near the bottom of the viewport.
- The visitor taps/clicks the shuffling deck to proceed. Nothing else on the page is interactive yet — there is no auto-advance and no timeout.
- On click: the "Hello!"/subheading text fades out, the standalone logo travels/scales into the control dock's future position (crossfading into the dock's own center logo as it arrives), and the cards rise from their onboarding rest position up to the real entrance-deal deck position.
- Only once that rise finishes does the entrance deal itself begin: a brief shuffle/jitter plays at the deck, then cards animate outward into their resting grid positions, staggered like a dealer dealing hands — not all cards arriving simultaneously.
- The control dock, table header (wordmark/tagline), and "Pick a Card" heading are all invisible/collapsed during onboarding and reveal in sequence after the deal completes (dock forms first as the logo arrives, header fades in once dealing is done, heading follows immediately after) — see Design System §3.5/§6 for the exact choreography and timings.
- Cards settle face-down by default at the end of the deal, unless the user's last known filter state (see 4.3) says otherwise.
- Once the deal is underway, it is not skippable/interruptible — a user clicking during the deal shouldn't feel blocked, but doesn't skip it either (see open questions, §10). The onboarding gate itself has no skip either; tapping the deck is the one required action before anything else on the table works.

### 4.2 Idle Animation
- At rest, each card exhibits a subtle continuous "hover" — a slight vertical bob and/or scale pulse, independently timed per card (not synchronized) so the table feels alive rather than mechanical.
- Shadow intensity/size should respond to the hover offset (card "higher" = softer/larger shadow, mimicking increased light distance) to sell depth.
- Idle animation pauses on a card once it's selected/opened; resumes on close.

### 4.3 Cover/Reveal Filter
- A global control (eye icon, control dock) lets the user toggle all cards between:
  - **Covered** — all cards face-down (back design visible).
  - **Revealed** — all cards face-up (front/preview visible).
- Toggling animates every card's flip, staggered slightly across the grid rather than snapping instantly (reuse the per-card flip animation from §4.5, just triggered in bulk).
- This control also serves as the "reveal all" shortcut for impatient visitors — a single tap bypasses any per-card flip choreography, so no one is gated behind an animation they don't want to watch.
- This is a global state, independent of individual card position.

### 4.4 Shuffle
- A "Shuffle" button randomizes the *grid position* of all cards (not their face-up/down state).
- Shuffle should play a physically plausible animation: cards lift slightly, reposition along paths (not just teleport/crossfade), and settle back into the idle state at their new positions.
- Shuffle is available regardless of current cover/reveal state.

### 4.5 Card Open Interaction
- Behavior depends on the card's current face state at time of click:
  - **Covered card clicked:** flips face-up, *then* the rest of the deck gathers, *then* scales up into the open/reading view (sequential — flip completes, then gather, then scale).
  - **Revealed card clicked:** already face-up, so it skips the flip but still gathers the deck before scaling (no flip needed).
- **Gather stage:** the rest of the deck converges on the clicked card's table position, closest-card-first, fanning into a stacked, slightly-offset pile so a sliver of each gathered card stays visible peeking out from behind the clicked card — read as a deliberate "dealing under" motion, not an instant disappearance. This masks a rendering constraint: the canvas's clip-path (which normally confines resting cards to the play-area frame) has to lift for the clicked card to scale past the frame into its reading position, and a single WebGL canvas can't clip one card but not others — so the other cards need to already be tucked out of sight before that clip-path lifts. Gathering happens first, in full view, while the clip-path is still engaged (both the gather source and destination positions stay within the frame), so the later hide-for-scaling moment is imperceptible.
- "Scaling up" means: the card grows to a fixed max-width reading size, centered in viewport, and becomes a scrollable container for that project's page content (WebGL card animates into position/size, then hands off to a DOM overlay for actual scrollable content).
- A visible close control (e.g., an X or click-outside) reverses the animation, mirrored: content fades out, the card scales back down to its table position/size, then the gathered deck bursts back out from behind it to each card's own table position (farthest-first, see Design System §7), and the card remains in whatever face state it was opened in.
- Only one card can be open at a time.

### 4.6 Mobile Layout
- Below a defined breakpoint, the literal table/free-position metaphor is replaced with a static **3-column grid**.
- Entrance (deal), idle hover, cover/reveal, shuffle, and open/close interactions all still apply, adapted to the grid layout (e.g., shuffle reorders grid cells rather than free-form table positions).
- Open card view on mobile scales to near-full-screen rather than a fixed max-width (small viewport doesn't support a centered fixed-width reading pane well).

### 4.7 Gamification / Delight Layer
Optional interaction-as-signal touches, scoped so none of them gate or slow down a visitor who just wants to scan the table and leave (the "55-second reviewer"). All are additive to §4.1–4.6, not replacements.

- **Tell mechanic (hover-peek):** hovering a covered card past a short hold threshold triggers a partial reveal — a few degrees of flip rather than a full 180°, functioning as a poker "tell." Applies only to covered cards; revealed cards have nothing left to tease. Implemented as a new transient phase in the per-card state machine (`idle → peeking → idle`), not a new animation primitive.
- **Dealer's choice card:** exactly one card in the deck is the designer's flagship/best-strength project, styled distinctly (gold-edged, gold glow — cyan was considered and dropped, see Design System §1.5) so it reads as intentional even on a 5-second glance. Driven by an `isFlagship` flag on the mock project object, feeding the same back-texture generator as everything else — no separate rendering path. Carries an always-on soft gold pulse (independent of hover, visible on both faces) in addition to the interactive hover glow shared with other cards.
- **Table tells / achievements:** small optional Easter eggs layered onto existing animations — e.g., three shuffles in a row triggers a riffle-with-wink flourish at the deck; dragging or nudging a card near the table edge gives it a subtle wobble. Pure polish, no new state beyond a shuffle counter and an edge-proximity check.
- **Chip stack as session tracker:** the existing chip-stack card counter gains a second data source — opened-card count vs. total card count — as gentle progress feedback rather than a literal score. Backed by a `Set` of opened card IDs in the shared store.
- **Shuffle-triggered rediscovery:** on shuffle, there's a small chance a card's back renders with a rarer trace-pattern or accent-color variant, as a "did you notice that" moment for visitors spending real time at the table. Extends the procedural back-texture generator (see §5) with a rarity-tier roll; treated as a stretch item since it's the one piece here that adds genuinely new generative complexity rather than reusing existing infrastructure.

### 4.8 About Page + Route Transition

**Resolved (Phase 1 build, July 2026):** the control dock's About button navigates to a dedicated `/about` route rather than opening an in-page overlay — resolving §10's "About panel treatment" open question in favor of its own route. Home's cards, canvas, and open-card overlay are Home-only and never render on `/about`.

**Revised (July 2026):** the control dock itself is now persistent site-wide chrome (like the table header and play-area frame below) rather than a per-route instance that replays its onboarding-formation choreography on every navigation. About and Back-to-Home no longer trigger any dock animation — the dock's button content swaps instantly, in place, the moment the route changes. The dock's onboarding-formation sequence (§4.1, Design System §3.5) still plays exactly once, on Home, the first time the deck is clicked.

- Clicking About (or Back to Home) still delays the actual route change briefly: the deck slides off-table to the left while fading, and the "Pick a Card" heading fades out and translates upward (Home-side only, unaffected by this revision) — only once that settles does navigation fire. The dock itself is unaffected and stays fully interactive throughout.
- **About's own content now animates too (resolved, July 2026):** on Home -> About, `AboutContent` translates in from the right + fades as it mounts; on About -> Home, it translates out to the right + fades *before* the route actually changes — its own brief pre-navigation delay, mirroring the deck/heading's existing one above, so Home's translate-in-from-left plays cleanly right after. A direct load of `/about` skips this and renders already settled, same rule as the rest of this section's chrome.
- On `/about`, the dock immediately shows its About button set — **Email, LinkedIn, X** (left group), **Resume, Back to Home** (right group) — no travel/crossfade/expand sequence, since the dock never left. All five are one-shot actions (open mail client / open a profile link / download a resume / navigate home), reusing the existing dock button interaction spec (Design System §3.3) — no new states.
- **Back to Home** additionally guarantees the visitor never sees the onboarding gate on return: even if `/about` was reached via a direct link/bookmark (Home never actually dealt this session), Back to Home forces the deal to "complete" before Home mounts, so the deck simply translates into frame already dealt rather than replaying "Hello!"/the entrance deal.
- The table header (wordmark/tagline), the play area's frame/dashed border, and the control dock all persist across both routes as site-wide chrome — unlike Home's own onboarding gate (§4.1), which still hides the header/heading/border/dock until the first deck click, they're visible immediately on `/about`, including a direct load.
- **Resolved (Phase 1 build, July 2026):** About's own substantive layout/content is now built — six sections (Hero, The Run, House Rules, Chips up my sleeve, Tables I've Played, "Ready to deal?"), per Design System §3.11. Its Email/LinkedIn/X/Resume destinations were initially placeholders (`lib/aboutLinks.ts`); resolved to real Sanity-sourced values by CMS integration Phase 10 (July 17, 2026) — see §10.
- **Resolved (follow-up pass, July 2026):** Hero, The Run, Chips up my sleeve, and Tables I've Played each play a first-visit-only "dealt in" section-reveal on viewport intersection — gated the same way Home's onboarding gate is (a store flag that never resets except a hard reload), and held back until the page-level Home -> About slide-in has settled on a nav-arrival. House Rules and the closing "Ready to deal?" text remain plain copy with no reveal (Design System §3.11/§7 item 18).

### 4.9 404 / Not Found Page

**Resolved (Phase 1 build, July 2026):** a net-new page, not previously scoped anywhere in this document — reached for any URL that doesn't match `/` or `/about` (`app/not-found.tsx`). Reuses the same site-wide chrome as every other route (felt background, play-area frame, table header) rather than a bare error message.

- **Content:** a large, dim "Bust!" (Meow Script, table-level decorative heading per Design System §2.1) with a fan of three cards reading **4, 0, 4** in front of it, sized and spaced so the fan never fully covers the word, and "Page Not Found" (Outfit) beneath — see Design System §3.12 for the full visual/motion spec. The card fan's shape and entrance motion deliberately mirror the About page's Experience Card ("The Run") rather than introducing a new look.
- **Getting back:** no separate "return home" link/button — the card-spread itself is the click target (the whole fan, not just the individual cards), with a short instruction line telling visitors to click the cards. The cards also play a continuous ambient deal-in/hold/deal-out loop, independent of the click affordance.
- **Control dock:** doesn't render at all on this page — not even a reduced state. Clicking the card spread lands directly on Home's own onboarding gate, which has no dock either, so there's nothing for it to usefully show in between.
- **No connection to the Home <-> About route-transition system:** a 404 is only ever reached via a hard/broken link, never the in-app dock toggle, so it doesn't participate in `dockNavPhase`/the deck-exit or About-content-exit choreography (§4.8) — it has its own independent, self-contained entrance instead.

---

## 5. Technical Approach

*(Carried over from architecture discussion — included here for reference/alignment.)*

- **Rendering split:**
  - WebGL layer (React Three Fiber + Drei): owns the table surface, lighting/shadows, and all card meshes in closed/idle/flipping/scaling states.
  - DOM layer: a sibling fixed-position container that mounts real, scrollable HTML content only once a card finishes opening. Native scroll, real text, no `<Html>`-in-canvas content rendering.
- **Routing (§4.8/§4.9):** Next.js App Router — `/` (table), `/about`, and a catch-all not-found route (`app/not-found.tsx`, §4.9) for anything else. The table header, play-area frame, and control dock are all hoisted into the root layout so they persist across every route without remounting; their Home-specific contents (heading, card grid, WebGL canvas) are gated to the `/` route (`usePathname()`), and the play-area frame's interior content branches three ways (Home / About / not-found) so nothing route-specific bleeds onto another route. *(Correction: an earlier draft of this bullet said the control dock was not shared and remounted per route — that was superseded by Design System §3.6's "Revised" dock-persistence change and no longer reflects the actual implementation.)*
- **State management:** a single store (e.g., Zustand) holding per-card position/face-state, global cover/reveal state, `openCardId`/phase (`closed | flipping | scaling | open | closing`), and lightweight session data for §4.7 (opened-card set, shuffle count), consumed by both the canvas and the DOM overlay.
- **Animation:** `@react-spring/three` for in-canvas card motion (flip, scale, deal, shuffle, idle bob, peek); Framer Motion for the DOM overlay's fade/scale entrance.
- **Content for prototype:** hardcoded/mock array of "project" objects (title, category, date, image, body content, back styling, flagship flag) — shaped loosely like the eventual Sanity schema so the future data-swap is low-friction, but with zero actual CMS dependency.
- **Card faces are generated textures, not static images.** Both card back and card front are composited on an offscreen canvas and uploaded as a `THREE.CanvasTexture`, rather than using baked PNGs directly on the mesh. This is what makes per-card/per-category color and content variation possible without a redesign:
  - **Back:** the existing procedural circuit-trace generator takes `traceColor`, `borderColor`, and `bgColor` as parameters instead of hardcoded values. A `category` (and later, flagship/rarity tier) can key into a lookup table that drives these params — effectively pre-building the Phase 3 category color-coding hook while still in Phase 1.
  - **Front:** a composite pass — fill `frontBg` color, draw the project image (via `THREE.TextureLoader` or an offscreen `drawImage`, so a local mock path and a future CMS asset URL are handled identically), then draw title/category/date text via `ctx.fillText` using Outfit (per the Design System §2 — this supersedes an earlier Fraunces + IBM Plex Mono direction), awaited through `document.fonts.load` before first draw.
  - Textures are recomposited only when their source params change (color, text, image, rarity roll) — never per-frame — with `@react-spring/three` left to animate the mesh (flip/scale/position), not the texture itself.
- **Mock project schema (indicative):**
  ```js
  {
    title: 'Cashare',
    category: 'Product Design',
    date: 'May 2025',
    image: '/mock/cashare-thumb.png',
    frontBg: '#FFFFFF',
    isFlagship: false,
    back: { traceColor: '#F5F0E6', borderColor: '#F5F0E6', bgColor: '#0A1128' }
  }
  ```

---

## 6. Visual Reference

- A Figma table-view mockup exists (felt-green background, dashed play-area border, "Pick a Card" script heading, 4×2 grid of navy circuit-back cards, bottom control dock with reveal, shuffle, and two additional icons) establishing the current visual direction for the table state.
- Card front and back mock designs exist as standalone reference images, confirming the procedural circuit-trace back and the CMS-driven front layout (image, wordmark/title, category label, date) described in §5.
- Open questions on dashed-border permanence, exact target card count, and the dock's fourth icon are tracked in §10.

---

## 7. Success Criteria for Prototype

- All seven interaction behaviors in §4 (§4.1–§4.6 core, plus the §4.7 delight layer where scoped as Phase 1) are implemented and feel physically plausible (not just functionally correct).
- Runs smoothly (60fps target) with a realistic card count on a mid-range laptop and a mid-range phone.
- Mobile grid variant is functional and doesn't feel like a broken desktop layout.
- Codebase is structured so swapping mock data for Sanity queries later doesn't require touching animation or layout logic.
- Gamification touches (§4.7) never block or delay access to core navigation for a visitor who wants to move fast.

---

## 8. Non-Functional Considerations

- **Performance:** flat plane geometry with baked/composited canvas textures for cards; avoid per-card real-time shadow casting if it tanks frame rate at higher card counts — evaluate `ContactShadows`/`AccumulativeShadows` vs. baked shadow textures. Texture recompositing is param-triggered only, never per-frame (see §5).
- **Baseline accessibility:** every card should have a corresponding focusable/keyboard-actionable DOM element synced to its screen position, even in this prototype, so keyboard users aren't fully locked out. Full a11y polish deferred, but not ignored entirely.
  - **Known gap (flagged, not yet fixed):** the onboarding gate's deck click target (§4.1) is a Three.js pointer-events mesh only, with no keyboard/screen-reader equivalent — a keyboard-only visitor currently has no way to trigger the deal and reach the table at all. Tracked in `CHECKLIST.md`.
- **Input handling:** canvas pointer events should be disabled while a card is open, so scrolling the opened content doesn't fight with table interactions underneath.

---

## 9. Phased Roadmap

- **Phase 1 (this PRD):** Standalone prototype, mock content, full core animation/interaction set (§4.1–§4.6), desktop + mobile grid, plus the lower-cost delight items that reuse existing infrastructure — tell mechanic, dealer's choice card, chip-stack session tracker. Also includes the About page's routing/dock-transition architecture and section content (§4.8), pulled forward from the original Phase 2 placeholder scope — its entrance/scroll animation choreography remains a separate follow-up.
- **Phase 1-stretch:** Table tells/achievements (shuffle-wink, edge wobble) and shuffle-triggered rediscovery — pure polish, easiest items to cut if time gets tight, tackled during animation tuning rather than as dedicated build tickets.
- **Phase 2 — ✅ Done, July 2026:** Sanity CMS integration — map existing project schema to card data, replace mock array with live queries. Built as its own granular, phased effort rather than a single swap; see `public/cms/INTEGRATION_CHECKLIST.md` for the 10 completed phases (data flow, texture wiring, reading-pane content, autoplay video, revalidation webhook, About page) plus the 2 phases still pending below.
- **Phase 3:** Category color-coding of card backs (infrastructure already in place per §5) — corresponds to the integration checklist's **Phase 11, blocked**: needs a new color field added to the `category` schema on the Sanity side (user-administered, not actionable from this repo yet). Deep-linking to an opened card via URL — corresponds to the integration checklist's **Phase 12, parked** (no urgency, not blocking anything else). Possible search/filter remains uncommitted scope, unstarted.
- **Phase 4 (open):** Decide whether this becomes the primary portfolio front end, a permanent alternate route, or a standalone experiment — revisit based on Phase 1–2 results.

---

## 10. Open Questions

### Resolved (Phase 1 build, July 2026)

- **Clicking during the entrance deal:** ignored — no queuing, no interrupt (see Design System §6).
- **Card count:** data-driven, no longer a hard cap — originally 15 mock projects (`data/projects.ts`, since deleted), now the live count of Sanity projects (14 as of the CMS integration's Phase 2 dataset spot-check) fetched via `lib/getProjects.ts`; any row count beyond the 2-row reference density scrolls within the play area rather than being capped or downscaled (Design System §4.1).
- **Onboarding gate (pre-table):** the deal no longer fires automatically on load — a "Hello!"/tap-the-deck gate precedes it (§4.1). Click-to-deal is the only supported input; there's no auto-advance/timeout fallback.
- **Dashed play-area border:** permanent UI element — the tablecloth edge, and (as of the play-area refactor) the app's real main content container and scroll boundary, not decorative-only (Design System §4.3).
- **Cover/reveal + shuffle while a card is open:** visible but disabled (reduced opacity, non-interactive) until the card closes.
- **Dealer's choice card:** shuffles freely — the gold treatment reads even face-down, so no positional guarantee is needed.
- **About dock icon:** wired to real navigation — clicking it takes the visitor to `/about` (§4.8). The dock itself persists across the navigation with no transition of its own; the deck/heading table-nav exit and (on the way back) About's own content translate/fade briefly delay the route change instead.
- **About panel treatment:** resolved as its own route (`/about`), not the card-open DOM overlay pattern — see §4.8. Routing architecture is built and functioning.
- **About page content:** the page's own section layout and copy are now built (§4.8, Design System §3.11) — Hero, The Run, House Rules, Chips up my sleeve, Tables I've Played, and a closing "Ready to deal?" text, using all four previously-unplaced building blocks: Chip (`components/dom/Chip.tsx`, Design System §3.7), Brand Card (`components/dom/BrandCard.tsx`, Design System §3.8), Photo Card (`components/dom/PhotoCard.tsx`/`PhotoCardSpread.tsx`, Design System §3.9), and Experience Card (`components/dom/ExperienceCard.tsx`/`ExperienceCardSpread.tsx`, Design System §3.10).
- **Control dock on mobile:** below 767px the dock restacks into a centered vertical column (logo, left group, right group) rather than staying a horizontal pill with no room left to shrink — see Design System §3.3 for the exact layout.
- **404 / Not Found page:** not previously scoped in this document — a net-new page is now built, reusing the site-wide chrome (felt, play-area frame, header) with its own "Bust!"/4-0-4 card fan content; the control dock doesn't render on this route at all (§4.9, Design System §3.3/§3.12).

### Resolved (CMS integration Phase 10, July 17, 2026)

- **Real contact/resume destinations:** `lib/aboutLinks.ts` (placeholder values) is deleted. The About dock's Email, LinkedIn, X, and Resume now read real `resumeUrl`/`socialLinks` off Sanity's `siteSettings` document via `lib/getSiteSettings.ts`'s `getSiteSettings()` — degrades to an empty/placeholder default only if the fetch itself fails, not by design.
- **Real tool-chip logo assets:** `data/tools.ts` (the `Typescript.png`-for-everything placeholder) is deleted. Tool chips now read real per-tool `logoUrl`/`logoAlt`/`color` off Sanity's `tools` documents via `getFeaturedTools()`, falling back to the tool's `title` only when `logoAlt` itself isn't authored in the Studio yet (a content gap, not a code gap).

### Still open

(none remaining as of this pass)
