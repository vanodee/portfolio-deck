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

## Post-deployment actions (do once a real production URL exists)

- [ ] **Register the Sanity webhook** pointed at `https://table.stevano.dev/api/revalidate` —
      deliberately deferred pre-deploy since Sanity's cloud webhook infra can't reach localhost.
      See `public/cms/INTEGRATION_CHECKLIST.md` Phase 9 for the full detail (handler is already
      built and verified locally with a real signed test request).
- [ ] **Confirm `SANITY_REVALIDATE_SECRET` is set in Vercel's project env vars** (already set in
      `.env.local`; Vercel's copy gets entered during the deploy itself, but worth a second check
      once live, since the webhook above depends on it matching).
- [ ] **End-to-end revalidation check** — once the webhook and the Vercel secret are both in
      place: publish a test edit in the Sanity Studio and confirm the deployed home page updates
      without a manual redeploy (`public/cms/INTEGRATION_CHECKLIST.md` Phase 9 flags this as
      unprovable from `next dev` alone — Vercel's on-demand ISR is what actually needs verifying).

## Content & data gaps (not blocking, worth a deliberate call)

- [ ] **`isFlagship` is hardcoded**, not CMS-driven — `lib/getProjects.ts` flags whichever project
      happens to be first in the fetch order as flagship (`i === 0`), with a `TODO` to replace once
      a real field exists in the other project's Sanity schema. Confirm the first-fetched project
      is actually the one meant to read as flagship in production, or wire the real field first.
- [ ] **Only 2 of 3 photo slots filled** in the About page's Hero photo spread (`data/photos.ts`) —
      `PhotoCardSpread.tsx` already supports a 3rd card, just no 3rd real photo was provided yet.
      Confirm 2 is the intended final count or add one.
- [ ] **Confirm `resumeUrl` is actually populated** in Sanity's `siteSettings` document — if it's
      unset or the fetch fails, `lib/getSiteSettings.ts` silently degrades the About page's Resume
      link to a dead `#` anchor rather than erroring, so a content gap here wouldn't be obvious from
      testing alone.

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
      (built): a left-most Home-dock button + popover menu (`CategoryFilterButton.tsx`/
      `CategoryFilterMenu.tsx`/`hooks/useCategoryFilter.ts`/`lib/categoryFilter.ts`) that narrows
      the table to one category client-side, dimming/desaturating/shrinking non-matching cards and
      dropping them from the tab order (PRD §4.10, Design System §3.15). Corresponds to the
      integration checklist's **Phase 11 — now closed**, not just blocked: no Sanity schema field
      is being requested; card backs stay default-blue/flagship-gold permanently.
- [x] ~~Search / filter~~ — filter-by-category is built (see above); full-text search and sort
      remain out of scope (PRD §2 non-goals).
- [x] ~~**Deep-linking** — URL routes to a specific opened card.~~ Closed out as a deliberate
      won't-do, not deferred — the existing Next.js portfolio (stevano.dev) already owns the
      "share a specific project" job with real SEO/semantic HTML, and a deep link would let
      visitors skip past this app's actual value (the crafted onboarding/deal sequence and
      self-directed table exploration). Routes stay exactly `/` and `/about`, permanently.
      Corresponds to the integration checklist's **Phase 12 — closed** (PRD §9/§10).

## Phase 4 — open decision (PRD §9)

- [ ] Decide whether this becomes the primary portfolio front end, a permanent alternate route, or stays a standalone experiment (revisit after Phase 1–2 results)

## Non-feature housekeeping

- [ ] **Onboarding gate has no keyboard/screen-reader path** — the deck's click target (`DeckClickCatcher.tsx`) is a Three.js pointer-events mesh only; a keyboard-only visitor currently cannot trigger the deal and has no way to reach the table at all (PRD §8, DS §3.5)
- [ ] **Onboarding + route-transition + section-reveal timing values need a tuning pass** — `MOTION.onboardingShuffle` / `MOTION.onboarding` / `MOTION.tableNav` / `MOTION.aboutNav` / `MOTION.aboutSectionReveal` (`lib/motion.ts`) are marked in code as placeholders (DS §6/§7) — also listed under "About page — content & polish" above
- [ ] **Category Filter timing values need a tuning pass** — `MOTION.categoryFilter` (`lib/motion.ts`) — card dim/desaturate/scale, menu row fade+scale, button icon-swap — is marked in code as placeholder, same caveat as the row above (DS §3.15/§6)
- [ ] **Full accessibility polish** — prototype ships the PRD §8 baseline (focusable card buttons, Escape, focus rings); a full pass (screen-reader flow, reduced-motion support, contrast audit) is deferred
- [ ] **Test framework** — no automated tests; `scripts/snap.mjs` covers visual verification only
