---
name: sync-specs
description: Keep the Card Table Portfolio spec docs (PRD and Design System) in sync with implementation. Use whenever a build decision resolves an open question, changes a documented token/timing/behavior, or deviates from spec — or when the user asks to update the specs.
---

Update the spec documents so they reflect what was actually decided or built. The two docs are:

- `card-table-portfolio-prd.md` — product behavior, interactions, tech approach; open questions live in **§10 Open Questions**
- `card-table-portfolio-design-system.md` — tokens, components, layout, elevation, motion; open items live in **§7 Confirmed open items**

For each decision or deviation being synced:

1. Identify which doc (or both) it touches. Behavior/scope → PRD; visual/motion/token values → Design System.
2. Edit the affected section so it states the new confirmed value or behavior. Match the doc's existing voice: declarative, confirmed-facts-only (the Design System explicitly captures only what's confirmed).
3. If the decision resolves an entry in §10 (PRD) or §7 (Design System), remove it from that list — or, if partially resolved, rewrite the entry to state only what remains open.
4. Update the doc's header: bump the `**Status:**` draft version if the change is substantive, and set `**Last updated:**` to today's date.
5. If the change deviates from what the spec previously said (rather than filling a gap), say so explicitly to the user in your summary — deviations need their sign-off, not silent edits.

Finish by summarizing what changed in each doc and what remains in the open-items lists.
