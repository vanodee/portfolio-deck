# Project Checklist — Card Table Portfolio

Features and work items **not yet built**, grouped by roadmap phase (PRD §9).
Phase 1 core (onboarding gate, deal, idle bob, cover/reveal, shuffle,
open/close, mobile grid, peek, flagship card, chip tracker, keyboard
baseline) is implemented, as is the About page's routing/dock-transition
architecture, its own section content — Hero, The Run, House Rules,
Chips up my sleeve, Tables I've Played, Ready to deal (PRD §4.8, DS
§3.6/§3.11) — and, for four of those six sections, a first-visit-only
section-reveal entrance (PRD §4.8, DS §3.11/§7 item 18). Phase 2 (Sanity
CMS integration) is also done — see `public/cms/INTEGRATION_CHECKLIST.md`
for that phase's own detailed log — this list is everything that remains.

## Post-deployment actions — ✅ Done 2026-07-24

- [x] **Register the Sanity webhook** pointed at `https://table.stevano.dev/api/revalidate` —
  ```
  registered at manage.sanity.io (Create/Update/Delete, `{"_type": _type}` projection, secret
  matching `SANITY_REVALIDATE_SECRET`). See `public/cms/INTEGRATION_CHECKLIST.md` Phase 9.
  ```
- [x] **Confirm** `SANITY_REVALIDATE_SECRET` **is set in Vercel's project env vars** — confirmed
  ```
  matching `.env.local`'s value.
  ```
- [x] **End-to-end revalidation check** — confirmed a Studio publish updates the deployed home
  ```
  page without a manual redeploy; Vercel's on-demand ISR honors `revalidateTag` against the
  statically-prerendered route as expected.
  ```



## Content & data gaps (not blocking, worth a deliberate call)

- [ ] `isFlagship` **is hardcoded**, not CMS-driven — `lib/getProjects.ts` flags whichever project
  ```
  happens to be first in the fetch order as flagship (`i === 0`), with a `TODO` to replace once
  a real field exists in the other project's Sanity schema. Confirm the first-fetched project
  is actually the one meant to read as flagship in production, or wire the real field first.
  ```
- [ ] **Only 2 of 3 photo slots filled** in the About page's Hero photo spread (`data/photos.ts`) —
  ```
  `PhotoCardSpread.tsx` already supports a 3rd card, just no 3rd real photo was provided yet.
  Confirm 2 is the intended final count or add one.
  ```
- [ ] **Confirm** `resumeUrl` **is actually populated** in Sanity's `siteSettings` document — if it's
  ```
  unset or the fetch fails, `lib/getSiteSettings.ts` silently degrades the About page's Resume
  link to a dead `#` anchor rather than erroring, so a content gap here wouldn't be obvious from
  testing alone.
  ```



## Phase 1 — stretch (cut-line items, PRD §4.7 / §9)

- [ ] **Shuffle-wink flourish** — three shuffles in a row triggers a riffle-with-wink flourish at the deck (`shuffleCount` already tracked in `store/useTableStore.ts`)
- [ ] **Edge wobble** — dragging/nudging a card near the table edge gives it a subtle wobble
- [ ] **Shuffle-triggered rediscovery** — small chance on shuffle that a card back renders a rarer trace-pattern or accent-color variant (rarity-tier roll parameter into `lib/textures/compositeCardBack.ts`)



## Phase 1 — polish left open

- [ ] **Wordmark fidelity pass** — header lockup is rebuilt in DOM (Outfit tracking + logo PNG) because the Figma SVG export was polluted; compare against the Figma source and adjust tracking/sizing if needed
- [ ] **Per-node Figma side-by-side** — fine-grained fidelity check of card back (node 1:2409), card front (1:2672), and table view (1:2685); watermark size/position on card fronts is approximate
- [ ] **60fps trace on real hardware** — verified 50fps under headless software rendering; confirm a locked 60 on a mid-range laptop and phone (PRD §7)
- [ ] **Touch alternative for the peek "tell"** — hover doesn't exist on touch; currently peek is simply inert on mobile (acceptable per plan, but worth a deliberate decision)



## About page — content & polish (PRD §4.8, DS §3.6/§3.11)

The route, dock, Home <-> About transition, the page's own section
content (`components/dom/AboutContent.tsx`, DS §3.11), and a first-visit-only
section-reveal entrance for four of the six sections are built and
functioning — Hero (intro + stat Chips + Photo Card spread), The Run
(Experience Card spread), House Rules (body copy, no reveal), Chips up my
sleeve (tool Chip grid), Tables I've Played (Brand Card grid), and a closing
"Ready to deal?" text (no reveal). Real tool-chip logos and real contact/resume destinations are both done, wired
to Sanity's `siteSettings`/`tools` documents (CMS integration Phase 10 —
`lib/getSiteSettings.ts`; `data/tools.ts` and `lib/aboutLinks.ts` are deleted).
What's left:

- [ ] **Route-transition + section-reveal timing pass** — `MOTION.tableNav` (deck/heading exit-enter) and `MOTION.aboutSectionReveal` (section-reveal stagger/hold, `lib/motion.ts`) are marked in code as placeholders, same as the onboarding values below



## Phase 2 — CMS (PRD §9) — ✅ Done, July 2026

Sanity integration is live — see `public/cms/INTEGRATION_CHECKLIST.md` for the
full 10-phase build log (data flow, texture wiring, reading-pane content,
autoplay video, revalidation webhook, About page).

## Phase 3 (PRD §9) — mostly done, July 2026

- [x] ~~Category color-coding of card backs~~ — closed out, superseded by the **Category Filter**
  ```
  (built): a left-most Home-dock button + popover menu (`CategoryFilterButton.tsx`/
  `CategoryFilterMenu.tsx`/`hooks/useCategoryFilter.ts`/`lib/categoryFilter.ts`) that narrows
  the table to one category client-side, dimming/desaturating/shrinking non-matching cards and
  dropping them from the tab order (PRD §4.10, Design System §3.15). Corresponds to the
  integration checklist's **Phase 11 — now closed**, not just blocked: no Sanity schema field
  is being requested; card backs stay default-blue/flagship-gold permanently.
  ```
- [x] ~~Search / filter~~ — filter-by-category is built (see above); full-text search and sort
  ```
  remain out of scope (PRD §2 non-goals).
  ```
- [x] ~~**Deep-linking** — URL routes to a specific opened card.~~ Closed out as a deliberate
  ```
  won't-do, not deferred — the existing Next.js portfolio (stevano.dev) already owns the
  "share a specific project" job with real SEO/semantic HTML, and a deep link would let
  visitors skip past this app's actual value (the crafted onboarding/deal sequence and
  self-directed table exploration). Routes stay exactly `/` and `/about`, permanently.
  Corresponds to the integration checklist's **Phase 12 — closed** (PRD §9/§10).
  ```



## Phase 4 — open decision (PRD §9)

- [x] Decide whether this becomes the primary portfolio front end, a permanent alternate route, or stays a standalone experiment (revisit after Phase 1–2 results) - stand alone experiment. Main portfolio lives on stevano.dev. This lives on table.stevano.dev, offereing a uniqyue experience.



## Performance audit findings (2026-07-28) — ordered by overall impact

Whole-project perf pass triggered by reported About-page scroll slowdown
(tools section, especially mobile). Ordered by total impact across all
routes/devices (bundle size, network payload, parse/hydrate cost), not just
the scroll-jank symptom — items 3-4 are the bigger win for that specific
symptom even though they rank lower here. Work through individually.

- [x] **Sanity images fetched at full original resolution site-wide** — every GROQ query
  ```
  (`lib/queries.ts`: siteSettingsQuery, featuredToolsQuery, projectListingQuery, the ~150-field
  projectDetailQuery) dereferences `asset->url` directly with no width/format/quality params.
  `@sanity/image-url` is already an installed dependency but unused. Rendered via raw <img> tags
  in Chip.tsx/BrandCard.tsx (not next/image, unlike ProjectBody/Media.tsx which does this right).
  Biggest single lever in the app: hits network payload, decode cost, and LCP on every route,
  worst on the project reading-pane (most images per view) and worst on mobile networks/CPUs.

  Fixed: reused the existing `sanityImageAtWidth()` helper (lib/sanityImage.ts — already proven
  for the canvas card-texture compositor and the reading-pane hero/closing images) at the three
  spots that were still passing raw, unsized Sanity URLs straight to an `<img>` — Chip.tsx's tool
  logo (60w, 2x its fixed 30px box), BrandCard.tsx's client logo (396w, 2x its 198px desktop box),
  and OpenCardOverlay.tsx's tool icon (40w, 2x its fixed 20px box). Kept these as plain `<img>`
  rather than switching to next/image or the @sanity/image-url builder: Chip/BrandCard animate
  their logo via Framer Motion's `motion.img` in an AnimatePresence swap, which next/image's
  `Image` doesn't drop into cleanly, and the builder needs raw asset refs (not the pre-resolved
  `asset->url` strings these queries return) to earn its keep. The ~150-field projectDetailQuery
  body images already route through next/image (ProjectBody/Media.tsx, PortraitImageGrid.tsx),
  which handles format negotiation/resizing automatically — follow-up open below.
  ```
  - [x] Open follow-up: those next/image usages have no `sizes` prop, so Next assumes the full
    intrinsic `width` (1920/1080) applies and won't shrink the srcset for narrower mobile
    containers — smaller win than the raw-`<img>` fix above (bounded by next/image's own
    deviceSizes breakpoints, not unbounded like full original resolution was) and requires
    mapping each container's actual fluid width (rowImageContainer, soloImageContainer,
    portraitImageContainer) to correct `sizes` values per breakpoint to avoid under-serving.

    Fixed: added a `sizes` prop to `Media.tsx` (passed through to its `<Image>`) and a
    `sizes` string at each call site — `TextImageRow.tsx` (50/50 row), `SoloImageContainer.tsx`
    and `DividerSection.tsx` (full pane content width), and `PortraitImageGrid.tsx`'s own
    `next/image` call (3-column grid) — each using plain CSS-condition strings tied to the
    codebase's existing 767px breakpoint and `lib/layout.ts`'s `getReadingPane` pane-width
    formula, rather than threading the pane's exact JS-computed width through
    `PaneScrollRootContext`: next/image's srcset only offers a handful of discrete width
    buckets, so a `sizes` hint just needs to land in the right bucket, not be pixel-exact —
    a live-data path added no real accuracy over static breakpoint math here.
  ```
- [x] **Three.js/R3F/drei/@react-spring/three ship in the bundle on every route** — `PlayArea.tsx`
  ```
  statically imports TableCanvas (components/canvas/TableCanvas.tsx), and PlayArea is mounted
  unconditionally in app/layout.tsx. The canvas only *renders* when `onHome`, but static import
  means the whole Three.js-family bundle is still parsed/executed on /about and the 404 route
  even though it's never used there. JS parse/compile is disproportionately expensive on mobile
  CPUs. Fix: `next/dynamic(() => import(".../TableCanvas"), { ssr: false })` so it's a separate
  chunk only fetched when onHome.

  Fixed: `PlayArea.tsx` now loads TableCanvas via `next/dynamic(..., { ssr: false })`, plus a
  `useEffect` gated on `onHome` (not `layout`) that fires the same `import()` the instant we
  know we're on Home, so the fetch starts in parallel with the first ResizeObserver measurement
  rather than after it. Verified the split actually worked: `npm run build` then diffed
  `.next/static/chunks` against both routes' `build-manifest.json` — the ~937KB chunk containing
  `THREE.`/`react-three` code is absent from `rootMainFiles` (identical, <460KB total, for both
  `/` and `/about`).

  This surfaced a real regression, caught by `node scripts/snap.mjs <dir> load-sequence` (dev
  mode): TableCanvas's chunk can now finish loading *after* OnboardingScreen's "Tap the deck to
  deal yourself in" prompt has already appeared, since that prompt was previously only timed off
  `MOTION.onboarding` constants under the assumption TableCanvas (and DeckClickCatcher, its
  child) was always available synchronously. A click on the deck during that window silently did
  nothing — DeckClickCatcher's hitbox didn't exist yet. Fixed by adding `canvasReady` to
  `useTableStore` (same "set once, never reset" convention as `aboutSectionsRevealed`), set from
  TableCanvas's own mount effect (proof it actually rendered, not just that the fetch resolved),
  and gating the subheading's render on it in `OnboardingScreen.tsx` — the invitation to click
  now never appears before the click can land. No visible effect on a normal-speed load:
  `canvasReady` is already true long before the existing ~1120ms subheading timer elapses;
  confirmed via a production build (`next build && next start`) that the deck/subheading/deal
  flow behaves identically to before. (Separately, while debugging this, found that
  scripts/snap.mjs's own hardcoded `DECK` click coordinate is stale against the current card
  layout — pre-existing, unrelated to this fix, worth a follow-up recalibration per the script's
  own "recompute if layout constants change" comment.)
  ```
- [x] **`ControlDock`'s stacked `backdrop-filter` layers over scrolling content** — `dockShell`,
  ```
  every button (`.buttonGlass`), `.categoryMenuRow`, and `.toggleTrack` (ControlDock.module.css)
  all use backdrop-filter, on a `position: fixed` element mounted on every route. Fixed +
  backdrop-filter + active scroll underneath forces continuous GPU re-sampling per scroll frame —
  a well-documented mobile Safari/Chrome jank source, and it geographically overlaps the bottom of
  the About page (Tools/Brands/CTA) where the user noticed the slowdown. Primary suspect for the
  reported symptom. Fix: reduce blur radius or drop backdrop-filter for a solid fill below a
  breakpoint, or reduce the number of independently-blurred layers.

  Fixed: the two-layer glass structure (outer pill + brighter nested button/toggle layer) was a
  deliberate contrast decision (design-system.md §1.4), but each layer independently applying its
  own `backdrop-filter` was an oversight, not part of that decision — on the About page this
  stacked 7 separately-blurred layers (dockShell + 3 social buttons + Resume + toggleThumb +
  toggleTrack), all `position: fixed`, all forcing their own GPU re-sample every scroll frame.
  Removed `backdrop-filter` from `.buttonGlass` and `.toggleTrack`, keeping it only on
  `.dockShell` — every element that had its own blur lives spatially inside the shell's own rect,
  and both `dock-fill`/`dock-button-fill` already stack a solid layer under their gradient
  (design-system.md's July 2026 revision), so a second blur pass over that already-blurred,
  already-opaque surface was providing negligible visible contribution. The brighter/nested
  contrast (the actual point of the two-layer design) comes entirely from the fill/border/shadow
  tokens, untouched here. `.categoryMenuRow` (the category-filter popover) deliberately keeps its
  own real blur — it floats over raw table/page content, not over `.dockShell`, so there's nothing
  already-blurred beneath it, and it's only mounted while the menu is open (Home only), not part
  of the always-fixed persistent chrome that motivated this fix.

  Verified with a before/after pixel diff (production build, `/about`, desktop + mobile + hover,
  via a one-off Playwright canvas diff): max per-pixel channel delta of 5/255, zero pixels over a
  12/255 threshold — visually indistinguishable from the 7-layer original. Synced to
  design-system.md via `/sync-specs` (§1.4/§3.3 + token table, dated).
  ```
- [x] **`Chip.tsx`'s per-instance SVG filter stack** — every chip (stat and tool variants) renders
  ```
  two <svg> blocks with 3 unique <filter> defs each (feGaussianBlur/feColorMatrix/feComposite/
  feBlend) plus 2 radial-gradient defs, IDs generated per-instance via useId() so nothing can be
  shared across the ~8+ tool chips rendered simultaneously in the grid. Expensive to
  composite/rasterize, especially on mobile where these often fall back to software rendering.
  Secondary suspect for the reported symptom, scoped to the About page's hero/tools sections.
  Fix: bake into a pre-rendered PNG/WebP sprite per color (same pattern as lib/textures/ already
  uses for card art), or replace with cheaper CSS box-shadow/gradient approximations.

  Fixed: none of the filter/gradient defs actually depend on `--chip-color` — only 4 path fills do
  (the rest, including the entire `chipLight` gloss overlay, are pure geometry/opacity, identical
  regardless of color) — so `useId()`'s per-instance IDs were guaranteeing zero reuse of otherwise-
  identical work. New `lib/chipStructureDataUrl`/`chipLightDataUrl` (`lib/chipSprite.ts`) render the
  same SVG markup into a `data:image/svg+xml,...` string, cached per distinct resolved color in a
  plain `Map` (no canvas/PNG conversion needed — the browser's own SVG engine does the identical
  one-time rasterization). `Chip.tsx`'s two live `<svg>` blocks became `<img>` tags pointing at the
  cached URLs; `useId()` and the raw path constants were removed entirely. Beyond deduplicating the
  DOM/parse cost, this plausibly also removes an ongoing per-frame cost: live SVG filters are known
  to force re-running the whole filter pipeline whenever the filtered element (or an ancestor)
  animates a transform, rather than being reusable as a static texture — Chip's hover-lift and
  entrance stagger both do exactly that, so every hover/reveal frame was likely re-triggering all 3
  filters live before this fix.

  One wrinkle: a `data:image/svg+xml` document is fully isolated from the host page's CSS, so a
  `var(--token)` reference can't resolve inside it — stat chips previously passed
  `color="var(--card-back-bg)"`/`"var(--flagship-gold)"` (`AboutContent.tsx`), so those became
  literal hex values (`#130a5d`/`#b8860b`, matching `app/tokens.css` exactly) instead. Tool chips
  were already passing literal hex/rgb from `chipTint()`, unaffected.

  Verified with a before/after pixel diff (production build, `/about` hero stat chips + tools grid
  + hover, desktop + mobile): mobile came back pixel-identical (0.000% diff); desktop showed a small
  (<1.7%), stable, deterministic difference confined to a thin anti-aliased ring right at each
  chip's vector edge (confirmed via direct visual comparison, not just the diff numbers) — an
  expected artifact of switching from a live inline `<svg>` to an `<img>`-embedded data-URI SVG,
  invisible at normal viewing size; chip interiors (color, bevel, gloss, text) are pixel-identical.
  ```
- [x] **Always-on `requestAnimationFrame` loop runs regardless of route** — the scroll-easing tick
  ```
  in PlayArea.tsx starts on mount and never stops; it's a no-op off Home (proxyRef.current is
  null) but still schedules a frame forever on every route. Negligible cost, easy cleanup.
  Fix: gate the effect to `onHome`.

  Fixed: the effect's dependency array changed from `[]` to `[onHome]`, matching the pattern two
  sibling effects in the same file already use for the identical reason (the `availableHeight`
  ResizeObserver effect and the rail scroll-listener effect are both already `[onHome]`-gated,
  since `proxyRef`/`railRef` — which this loop also depends on — only exist while onHome) — this
  loop was simply never brought in line with that existing convention. Stopping (rather than just
  no-opping) the loop off Home loses no state: `scrollYRef`/`targetScrollRef` already sat untouched
  while `proxy` was null, identically whether the loop kept ticking a no-op or was fully stopped: it
  just resumes from wherever they were once back on Home. Verified live (production build): wheel-
  scrolling on Home, navigating to `/about` and back via the dock toggle, then wheel-scrolling again
  — the scroll proxy still eased correctly post-round-trip, no console errors. A `THREE.WebGLRenderer:
  Context Lost` log noticed during the About→Home transition was confirmed pre-existing (identical
  on a fully-reverted baseline predating this session's changes) — normal WebGL teardown from
  TableCanvas unmounting/remounting across the route change, unrelated to this fix.
  ```



## Non-feature housekeeping

- [ ] **Onboarding gate has no keyboard/screen-reader path** — the deck's click target (`DeckClickCatcher.tsx`) is a Three.js pointer-events mesh only; a keyboard-only visitor currently cannot trigger the deal and has no way to reach the table at all (PRD §8, DS §3.5)
- [ ] **Onboarding + route-transition + section-reveal timing values need a tuning pass** — `MOTION.onboardingShuffle` / `MOTION.onboarding` / `MOTION.tableNav` / `MOTION.aboutNav` / `MOTION.aboutSectionReveal` (`lib/motion.ts`) are marked in code as placeholders (DS §6/§7) — also listed under "About page — content & polish" above
- [ ] **Category Filter timing values need a tuning pass** — `MOTION.categoryFilter` (`lib/motion.ts`) — card dim/desaturate/scale, menu row fade+scale, button icon-swap — is marked in code as placeholder, same caveat as the row above (DS §3.15/§6)
- [ ] **Full accessibility polish** — prototype ships the PRD §8 baseline (focusable card buttons, Escape, focus rings); a full pass (screen-reader flow, reduced-motion support, contrast audit) is deferred
- [ ] **Test framework** — no automated tests; `scripts/snap.mjs` covers visual verification only