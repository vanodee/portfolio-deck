# Card Table Portfolio

An interactive portfolio presented as a top-down view of a card table. Each project is a physical playing card — face-down until revealed, shufflable, and clickable to flip and scale up into a scrollable reading view of the project detail.

Started as a **Phase 1 prototype** with mock/hardcoded content, to prove out the visual and interaction design before any CMS was wired in. That's since happened: content — projects, About page copy, tools, clients — is now live from a shared **Sanity** dataset (`lib/getProjects.ts`, `lib/getSiteSettings.ts`), fetched server-side and hydrated into the Zustand store. This is a **read-only** consumer of that dataset; there's no Studio or schema authoring in this repo. See `public/cms/INTEGRATION_CHECKLIST.md` for the phased integration history and what's still pending.

## Highlights

- **Onboarding gate** — cards spawn shuffling at a deck position; the visitor taps in before anything else animates or becomes interactive.
- **Deal / idle / shuffle** — cards deal into a grid with dealer-style stagger, bob gently at rest, and can be reshuffled with a physically plausible reposition animation.
- **Cover / reveal** — a global toggle flips the whole table between face-down and face-up in one action.
- **Category filter** — a dock button + popover menu narrows the table to one project category; non-matching cards dim, desaturate, and drop out of interaction/tab order.
- **Open / close** — clicking a card flips it (if covered), gathers the rest of the deck behind it, then scales it up into a scrollable reading view; closing reverses the sequence.
- **Hover "tell"** — lingering on a covered card triggers a partial peek flip, like a poker tell.
- **About route** — a dedicated `/about` page. The control dock persists across the route change with no transition of its own; the page's own content slides in/out from the right, timed alongside the table's deck sliding off/on. First-visit-only, its four card/chip sections (Hero, The Run, Chips up my sleeve, Tables I've Played) deal themselves in one at a time on scroll.
- **Responsive** — below a breakpoint, the free-form table collapses to a static 3-column grid with the same interactions.

See `card-table-portfolio-prd.md` for the full feature spec and `card-table-portfolio-design-system.md` for exact tokens, timings, easings, and dimensions.

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) / [three.js](https://threejs.org) for the WebGL card table
- [@react-spring/three](https://react-spring.dev) for canvas motion, [Framer Motion](https://www.framer.com/motion) for DOM overlays
- [Zustand](https://zustand-demo.pmnd.rs) for shared table state
- [Sanity](https://www.sanity.io) (`next-sanity`, `@sanity/image-url`) for content — read-only, shared dataset
- CSS Modules + `app/tokens.css` (no Tailwind)

## Getting started

Requires `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` in `.env.local` (see `public/cms/INTEGRATION_CHECKLIST.md`'s env & credentials table for the full list, including what's only needed for deploy).

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other commands:

```bash
npm run lint    # ESLint
npm run build   # production build (also runs the type check)
```

### Visual verification

WebGL doesn't render in a hidden/backgrounded browser tab (requestAnimationFrame is throttled to zero), so prefer headless screenshots over manually driving a browser:

```bash
node scripts/snap.mjs <outDir> <step> [--mobile]
# steps: load-sequence, hover, reveal, shuffle, open, close
```

## Project structure

- `app/` — Next.js routes (`/` table, `/about`), plus `api/revalidate` (Sanity webhook) and `global-error.tsx` (listing-fetch failure boundary)
- `components/canvas/` — R3F scene: cards, table, click handling
- `components/dom/` — DOM/overlay UI (control dock, header, open-card overlay + its category-specific `ProjectBody/` renderers, About page sections)
- `lib/` — shared layout math, motion tokens, easing curves, card texture compositing, multi-card choreography, and the Sanity data layer (`sanity.client.ts`, `queries.ts`, `getProjects.ts`, `getSiteSettings.ts`)
- `store/` — Zustand store for table/card interaction state, hydrated with live content via `ProjectsHydrator`/`SiteSettingsHydrator`
- `data/` — shared type definitions (`types.ts`) and the Hero photo spread (`photos.ts`); no mock content remains
- `public/cms/` — reference docs for the shared Sanity dataset this repo consumes (`SCHEMA.md`, `FRONTEND_INTEGRATION.md`, `PROJECT_PAGE_LAYOUT.md`) and this project's own integration plan/log (`INTEGRATION_CHECKLIST.md`)
- `scripts/snap.mjs` — Playwright screenshot harness for visual verification

## Status

Core interaction/animation set (PRD Phase 1) and Sanity CMS integration (PRD Phase 2, `public/cms/INTEGRATION_CHECKLIST.md` Phases 1-10) are both built, as is a Home-dock **Category Filter** (PRD Phase 3/§4.10) — narrows the table to one project category, client-side. It supersedes what Phase 3 originally planned as category-based card-back color-coding (integration checklist Phase 11, blocked on a Sanity schema field that was never added) — that plan is closed out, not just blocked. Remaining: URL deep-linking to an opened card (parked, Phase 12). See `CHECKLIST.md` for outstanding polish items and the PRD's open-questions section (§10) for unresolved design decisions.
