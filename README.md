# Card Table Portfolio

An interactive portfolio presented as a top-down view of a card table. Each project is a physical playing card — face-down until revealed, shufflable, and clickable to flip and scale up into a scrollable reading view of the project detail.

This is the **Phase 1 prototype**: a standalone build with mock/hardcoded content, focused on proving out the visual and interaction design before any CMS is wired in. Sanity CMS integration and full portfolio replacement are a deferred later phase — the intended swap point is `data/projects.ts`.

## Highlights

- **Onboarding gate** — cards spawn shuffling at a deck position; the visitor taps in before anything else animates or becomes interactive.
- **Deal / idle / shuffle** — cards deal into a grid with dealer-style stagger, bob gently at rest, and can be reshuffled with a physically plausible reposition animation.
- **Cover / reveal** — a global toggle flips the whole table between face-down and face-up in one action.
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
- CSS Modules + `app/tokens.css` (no Tailwind)

## Getting started

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

- `app/` — Next.js routes (`/` table, `/about`)
- `components/canvas/` — R3F scene: cards, table, click handling
- `components/dom/` — DOM/overlay UI (control dock, header, open-card overlay, About page sections)
- `lib/` — shared layout math, motion tokens, easing curves, card texture compositing, multi-card choreography
- `store/` — Zustand store for table/card interaction state
- `data/` — mock content (`projects.ts` is the Phase 2 CMS swap point)
- `scripts/snap.mjs` — Playwright screenshot harness for visual verification

## Status

Phase 1 prototype — mock data, no CMS, no routing from an existing portfolio site. See `CHECKLIST.md` for outstanding items and the PRD's open-questions section (§10) for unresolved design decisions.
