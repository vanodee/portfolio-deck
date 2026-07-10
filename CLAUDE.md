# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Card Table Portfolio" — an interactive portfolio where projects are playing cards on a WebGL card table (Next.js App Router + React Three Fiber + Zustand + @react-spring/three for canvas motion + Framer Motion for DOM overlays, npm, no Tailwind — CSS Modules + `app/tokens.css`). Phase 1 prototype is implemented with mock data in `data/projects.ts`; Sanity CMS is Phase 2 — the swap should only touch that file.

Two spec documents are the source of truth; read the relevant one before designing or implementing anything (exact tokens, timings, easings, and dimensions live there, not here):

- `card-table-portfolio-prd.md` — features, interactions, tech approach, open questions (§10)
- `card-table-portfolio-design-system.md` — colors, typography, layout, elevation, motion tokens (§5–§6), open items (§7)

## Specs are living documents

Implement from the specs, but when a decision resolves an open question — or the build has to deviate — update the relevant doc: the affected section, its status/date line, and the open-items list (`/sync-specs` skill). Flag deviations to the user rather than silently improvising. The Design System wins over the PRD where they conflict.

## Architecture invariants

- Orthographic camera, 1 world unit = 1 CSS px, origin at viewport center — grid math in `lib/layout.ts` is shared by canvas cards, the a11y buttons, and the open-card ↔ overlay handoff. Don't introduce a second coordinate mapping.
- Card textures are composited once per param set (`lib/textures/`) — springs animate meshes, never textures.
- All durations/easings come from `lib/motion.ts` / `lib/easing.ts` (verbatim DS §6). Don't inline animation numbers.
- Multi-card choreography (deal/shuffle/bulk-flip) drives per-card springs through `lib/cardHandles.ts`; store actions in `store/useTableStore.ts` own the interaction guards.

## Commands & verification

- `npm run dev` / `npm run lint` / `npm run build` (build runs the type check — do this before calling work done).
- Visual verification: `node scripts/snap.mjs <outDir> <step> [--mobile]` — headless Playwright screenshots (steps: load-sequence, hover, reveal, shuffle, open, close). Prefer this over driving the user's Chrome: **WebGL renders nothing in a hidden/backgrounded browser tab** (rAF is throttled to zero), which looks exactly like a rendering bug.
- OneDrive gotcha: `.next/` can serve stale chunks after edits (file locks). If edits mysteriously don't apply, stop the dev server, delete `.next`, restart.
