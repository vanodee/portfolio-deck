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

## Phase 3 (PRD §9)

- [ ] **Category color-coding of card backs** — the back compositor already takes `traceColor/borderColor/bgColor` params; add the category → palette lookup and real category colors. Corresponds to the integration checklist's **Phase 11 — blocked**: needs a new color field added to the `category` schema on the Sanity side (user-administered).
- [ ] **Deep-linking** — URL routes to a specific opened card. Corresponds to the integration checklist's **Phase 12 — parked**, not blocking anything else.
- [ ] **Search / filter** — possible scope, not committed

## Phase 4 — open decision (PRD §9)

- [ ] Decide whether this becomes the primary portfolio front end, a permanent alternate route, or stays a standalone experiment (revisit after Phase 1–2 results)

## Non-feature housekeeping

- [ ] **Onboarding gate has no keyboard/screen-reader path** — the deck's click target (`DeckClickCatcher.tsx`) is a Three.js pointer-events mesh only; a keyboard-only visitor currently cannot trigger the deal and has no way to reach the table at all (PRD §8, DS §3.5)
- [ ] **Onboarding + route-transition + section-reveal timing values need a tuning pass** — `MOTION.onboardingShuffle` / `MOTION.onboarding` / `MOTION.tableNav` / `MOTION.aboutNav` / `MOTION.aboutSectionReveal` (`lib/motion.ts`) are marked in code as placeholders (DS §6/§7) — also listed under "About page — content & polish" above
- [ ] **Full accessibility polish** — prototype ships the PRD §8 baseline (focusable card buttons, Escape, focus rings); a full pass (screen-reader flow, reduced-motion support, contrast audit) is deferred
- [ ] **Test framework** — no automated tests; `scripts/snap.mjs` covers visual verification only
