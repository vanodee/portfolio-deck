# Sanity Integration Checklist — Card Table Portfolio

Working checklist for wiring the Card Table Portfolio to the **existing, shared Sanity Content
Lake** documented in `SCHEMA.md`, `FRONTEND_INTEGRATION.md`, and `PROJECT_PAGE_LAYOUT.md` in this
same folder. Those three files describe *what the old portfolio's data and layout look like*; this
file is *the plan for bringing that into this project*, ordered roughly easiest → hardest, with
every gotcha and open decision surfaced from the planning discussion called out inline.

**Standing facts, established during planning:**
- This repo is a **read-only consumer** of the shared dataset. No Sanity Studio, no schema
  authoring, and no write access live here — all content editing happens in the other project.
  Don't scaffold `sanity/schemaTypes/` or anything Studio-related in this repo.
- The user administers all out-of-repo Sanity work (dashboard, CORS, webhooks, schema changes,
  credentials). Tasks below marked **[USER]** are theirs, not something to attempt from this repo
  — prompt them when a task needs one.
- The cms-folder docs reflect the *old portfolio's current* state, which moved on after this
  project's PRD was written. Where the two disagree, treat the cms-folder docs as more current,
  but keep flagging specific conflicts as they surface rather than assuming blanket supersession.
- **Design authority stays with this project's own Design System doc.** The cms-folder CSS values
  (colors, old grey palette, Outfit-only type system) are a **structural reference only** — section
  order, DOM shape, conditional-rendering behavior. Actual colors/spacing/type come from this
  project's tokens, except where a decision below explicitly says otherwise (per-project dynamic
  theming, the merged breakpoint scale).

---

## Open decisions still blocking downstream phases

Resolve (or explicitly park) before starting the phase that depends on them:

| Decision | Blocks | Status |
|---|---|---|
| Flat `/[slug]` vs. nested `/[category]/[slug]` routing | Phase 12 | **Unresolved** — both still on the table |
| Prefetch-all-light vs. lazy-fetch-detail-per-card | Phase 5 | Pick empirically once real content is fetchable; default lean is a light listing query prefetched + detail lazy-fetched on open |
| New category-color schema field(s) on the `category` type | Phase 11 | **[USER]** — not yet added on the other project; default blue stays until it lands |
| Per-field fate of `isFlagship` / `date` / other no-CMS-source fields | Phases 3–4 | Deferred — decided per field when its section is actually built, some may be dropped entirely |

---

## Phase 1 — Foundation & connection (easiest) — ✅ Done 2026-07-16

- [x] Install `next-sanity` and `@sanity/image-url` (mirror `FRONTEND_INTEGRATION.md` §1's client
      setup — `createClient`, `imageUrlBuilder`, `urlFor()`).
- [x] **[USER]** Provide `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` for
      `.env.local` (local dev) — Vercel env vars come later, at deploy time.
- [x] Create `lib/sanity.client.ts` with the same shape as the reference (`apiVersion`, `useCdn`
      — decided **`true`**: this repo has no revalidation webhook yet (Phase 9 doesn't exist),
      so the reference site's reason for `false` — avoiding a double-caching gap against its own
      webhook — doesn't apply here. Re-evaluate/flip to `false` once Phase 9's webhook lands).
- [x] Add `cdn.sanity.io` to `next.config.ts`'s `images.remotePatterns` — confirmed wanted, "especially
      if it helps performance."
- [x] Sanity-check dataset reachability with a plain unauthenticated query (no token needed, per
      `SCHEMA.md`'s confirmed-public note) before writing any real query code. Confirmed via a
      direct unauthenticated GROQ query (`*[_type == "category"]{title}`) against
      `https://<projectId>.api.sanity.io/v2025-01-01/data/query/<dataset>` — returned all 4
      expected categories (Web Apps, Websites, UX Case Studies, Logos & Branding), no token needed.

**Gotchas**
- Don't reuse or reference anything under a `sanity/` directory from the other repo — this project
  has no Studio and shouldn't grow one.

---

## Phase 2 — Minimal query layer (easy) — ✅ Done 2026-07-16

- [x] Create `lib/queries.ts`. Start with one light "card listing" query only: `title`, `"slug":
      slug.current`, `category->{title, "slug": slug.current}`, `heroImage{..., "url":
      asset->url}`, `previewColor`, `projectColor`, `projectColorDark`, `ctaColor`.
- [x] Always dereference **`category->title`**, never trust `categoryName` — it's a Studio-UI-only
      convenience field with no integrity guarantee outside the Studio (`SCHEMA.md` §3a).
- [x] Spot-check the live dataset: how many total projects exist, how they split across the 4
      categories, and whether any two share a slug across different categories (relevant to the
      still-open routing decision). **Results**: 14 total projects — Web Apps: 2, Websites: 3,
      UX Case Studies: 3, Logos & Branding: 6. All 14 slugs are globally distinct strings today
      (no cross-category collisions exist yet in the live data) — doesn't resolve the flat-vs-nested
      routing decision (Phase 12), but means neither shape would break against current content.

**Gotchas**
- `categoriesQuery` (no `tools`) doesn't need reviving — confirmed dead code in the reference
  frontend, don't recreate an unused equivalent here.

---

## Phase 3 — Data modeling (easy–medium) — ✅ Done 2026-07-16

- [x] Expand `data/types.ts`'s `Project` into a shape that can carry category-specific fields —
      a discriminated union keyed by `category`, mirroring `SCHEMA.md` §3c–3f's four field blocks.
      Category-specific fields can start as `Partial`/optional stubs; full fidelity isn't needed
      until Phase 7. **Done**: `Project` is now a 4-member discriminated union
      (`ProjectBase & { category: "Web Apps" } & Partial<WebAppFields>`, etc.); the 4
      `*Fields` interfaces (`WebAppFields`/`WebsiteFields`/`UxCaseStudyFields`/
      `LogoBrandingFields`) are intentionally empty stubs for Phase 7 to populate.
- [x] Replace the current free-text `category` values ("Product Design," "Mobile App," etc.) with
      the four real Sanity categories (`Web Apps`, `Websites`, `UX Case Studies`, `Logos &
      Branding`) throughout `data/projects.ts` (or its Sanity-backed replacement). **Done** via an
      even round-robin remap (old free-text labels carried no real meaning worth preserving) —
      result: Web Apps 4, Websites 4, UX Case Studies 4, Logos & Branding 3 (15 mock projects
      total). Verified via `npm run build`'s type check that no other consumer file needed changes
      — `textureCache.ts`, `compositeCardFront.ts`, `OpenCardOverlay.tsx`, `Card.tsx`, and the rest
      only ever read `ProjectBase`-shared fields. Checked the longer new category strings against
      the card-front micro-label's available width (`compositeCardFront.ts:141-150`, no
      truncation/ellipsis logic exists) — old max was "PRODUCT DESIGN - MAY 2025" (26 chars), new
      max is "LOGOS & BRANDING - AUG 2024" (28 chars); at the label's actual render scale (428px
      texture, ~400px usable) this is comfortably within margin, no overflow.
- [x] Layer in default-blue-back / flagship-gold logic only — no per-category back color yet
      (blocked on Phase 11's schema change). **Done**: `back` was previously two independently
      hand-picked fields (`STANDARD_BACK`/`FLAGSHIP_BACK`) that could drift from `isFlagship` —
      refactored so `back` is now *derived* from `isFlagship` via a single `.map()` pass in
      `data/projects.ts`, removing that drift risk. Same visual output as before (only `cashare`
      is flagship/gold).

**Gotchas**
- A repo-wide grep during planning found no other category-string-dependent logic outside
  `data/projects.ts`, `data/types.ts`, and the texture/overlay files already known about — re-grep
  after this phase's changes land, since new category-dispatch code is about to be added in Phase 7.
  **Re-grepped for this phase** (3 parallel Explore agents): confirmed still accurate — only
  `textureCache.ts:58` (cache key), `compositeCardFront.ts:146` (card-front label), and
  `OpenCardOverlay.tsx:104` (reading-pane meta line) read `.category`, all plain interpolation, no
  branching. `lib/queries.ts`'s `projectListingQuery` models category as a Sanity *reference*
  (`category->{title, slug}`) rather than the mock's plain string — a structural mismatch to
  reconcile in Phase 5, not this phase.
- Not pruning the 7 mock entries marked "Demo-only... remove once real Phase 2 content lands" —
  that's tied to Phase 5's actual data swap, not this type-modeling phase.

---

## Phase 4 — Card front & back texture wiring (medium) — ✅ Done 2026-07-16

- [x] Wire `lib/textures/compositeCardFront.ts`'s image block to draw the real `heroImage` into the
      **existing fixed-size image box** (max-height, no overflow — confirmed: every card front
      stays visually consistent regardless of source image aspect ratio), replacing the
      always-placeholder path at `compositeCardFront.ts:121-127`. **Done**: new
      `lib/textures/loadRemoteImage.ts` (CORS-safe, `crossOrigin="anonymous"`, Promise-cached by
      URL) + a `drawImageCover` helper (object-fit: cover, centered) added directly in
      `compositeCardFront.ts`. Falls back to `drawPlaceholderArt` if the load rejects (bad/missing
      CMS asset) — proven live: see CORS gotcha below.
- [x] Decide the crop mechanics: fetch `heroImage` via `urlFor(...).width(N)` only and let the
      existing canvas clip/box do the cropping (closest to how the placeholder art already
      behaves), vs. requesting a fixed-aspect crop server-side. Recommend the former first —
      visually verify against a handful of real hero images before committing. **Done**: took the
      recommended approach (`?w=800&auto=format`, width-only, no server-side `fit`/height). Verified
      the cover-crop math against a real downloaded hero image (`the-singleton-microsite`,
      1920×1080) via a standalone canvas test (bypassing the app's click-driven flow, which remains
      unreliable under headless Playwright — same issue as Phase 3) — crops correctly, no
      distortion, fills the box cleanly.
- [x] ~~Wire `previewColor` / `projectColor` / `projectColorDark` / `ctaColor` as card-front color
      inputs~~ — **narrowed after research (confirmed with user)**: only `previewColor` has any
      card-front role, and it's already fully wired via the pre-existing `frontBg` field (nothing
      to build; Phase 5 just needs to populate it from real data). `projectColor`/
      `projectColorDark`/`ctaColor` have **no** card-front role anywhere in the design system spec
      or the reference site (both use them exclusively on the project detail page) — they're
      Phase 6's responsibility (reading-pane theming), not this phase's. Design System §3.2 and §7
      item 23 updated to record this via `/sync-specs`.
- [x] Update `lib/textures/textureCache.ts`'s cache-key composition (`textureCache.ts:58`) to
      include the new image-url/color inputs, and remove or replace the `date` segment if/when
      `date` ends up dropped (Phase 3 decision). **Done**: added `project.image` to the front cache
      key (new input affecting composited pixels). `frontBg` was already keyed (covers the
      previewColor dimension, no separate color segment needed). `date` stays in the key, untouched
      — Phase 3's deferral still stands, not resolved here.
- [ ] If `date` is dropped, revisit the card-front's 3-line title/category/date text block
      assumption (Design System §3.2) — that's a layout change, not just a data change. **Still
      open** — `date`'s fate remains an explicitly deferred Phase 3 decision.

**Gotchas**
- Hotspot focal-point handling (`hotspotPosition()` in the reference client) has no canvas
  equivalent — first pass can ignore hotspot and center-crop; only build offset math for it if art
  actually looks wrong on real content. **Taken as-is**: center-crop only, no hotspot math, recorded
  in Design System §3.2 as a deliberate first-pass scope cut.
- Watch for the Sanity-side-crop-fighting-container-side-crop problem called out in
  `FRONTEND_INTEGRATION.md` §3 — even though this app's "container" is a canvas box, not CSS,
  double-cropping (a server-side fixed crop *and* a canvas-side crop) can still compound badly.
  **Avoided**: width-only Sanity request, canvas-side cover-crop is the only crop that ever runs.
- **New finding, corrects `FRONTEND_INTEGRATION.md` §5a**: that doc frames CORS as a Content-API-only
  concern ("server-only fetching... sidesteps it entirely"). In practice, **Sanity's image CDN
  (`cdn.sanity.io`) enforces its own origin allowlist separately** — a live test against this
  project's dataset returned `403 {"message":"CORS Origin not allowed"}` when an `Origin` header was
  present and not allowlisted, confirmed via direct `curl -H "Origin: ..."`. Any client-side canvas
  draw of a `cdn.sanity.io` image (which `crossOrigin="anonymous"` requires, to avoid tainting the
  WebGL texture) needs its origin on the allowlist — same **[USER]** action as the Content-API CORS
  entry (manage.sanity.io → project → API tab), just triggered earlier than Phase 5 anticipated,
  the moment real images start rendering client-side (effectively now, once Phase 5 wires real
  data through). Not blocking for this phase — the fallback-to-placeholder path was proven working
  correctly against the live CDN precisely because of this 403; the cover-crop math itself was
  verified separately against a locally-hosted copy of the same real image.

---

## Phase 5 — Async data flow refactor (medium–hard) — ✅ Done 2026-07-17

- [x] Replace the static `import { PROJECTS } from "@/data/projects"` with a real fetch resolved
      **before** the deal sequence starts (per the architecture invariant that card textures are
      composited once per param set — the param set now depends on network data). **Done**:
      `lib/getProjects.ts`'s `getProjectListing()` fetches server-side in `app/layout.tsx` (not
      `app/page.tsx` — the card grid is hoisted into the root layout, not the page, per its own
      comment) and threads the result into `store/useTableStore.ts` via a new `hydrateProjects`
      action, called once by a new `components/dom/ProjectsHydrator.tsx` client component.
      `data/projects.ts` is deleted.
- [x] Implement and load-test both fetch shapes, then keep whichever is actually faster: (a) a
      light listing query prefetched server-side in `app/page.tsx` and threaded into the Zustand
      store at hydration, or (b) per-card lazy fetch of full detail only on open. Current lean:
      light-prefetch-all for the grid/deal, lazy-detail-fetch-on-open for the reading pane — but
      this is explicitly an empirical call once content is real. **Done, effectively decided by
      necessity rather than an A/B comparison**: building a full "prefetch every project's detail"
      alternative would require Phase 7's category-specific query/renderers to exist first, so
      light-prefetch-all (`projectListingQuery`) + lazy-detail-fetch-on-open (new
      `projectDetailQuery`, by `_id`) was the only practical option pre-Phase-7.
- [x] Decide what the deal animation does if data isn't resolved instantly — skeleton cards, a
      delayed deal start, or something else. Not yet designed. **Resolved**: no skeleton state
      needed. The listing fetch is server-side in the root layout, so Next's SSR model resolves it
      *before* the page ever paints — by the time hydration completes and the onboarding deck is
      clickable, the data is already present. `CardsLayer.tsx` still gates `<DeckClickCatcher>` on
      `projects.length > 0` as a safety net, but in practice this is never observed unresolved.
- [x] Confirm whether `OpenCardOverlay`'s current synchronous `PROJECTS.find()` lookup
      (`OpenCardOverlay.tsx:37`) becomes an async detail fetch triggered by `openCard()`, and what
      the store does with `openCardId` while that detail request is in flight. **Resolved**: research
      found the open/close mesh animation (flip→gather→scale) is already fully decoupled from
      content — it only ever needs the card `id`. So the detail fetch lives entirely in
      `OpenCardOverlay` itself (local `useState`, `useEffect` keyed on `openCardId`), running in
      parallel with the (content-independent) animation rather than gating it. The store's
      `openCardId`/`openPhase` are untouched by this — no new store field needed.
- [x] Add CORS origins **[USER]** (prod + local dev) at manage.sanity.io *only if* any fetch ends
      up client-side rather than server-side-only. **Done** — you added `localhost:3000` ahead of
      this phase (prompted by Phase 4's CORS finding). The detail fetch (`getProjectDetail`,
      triggered client-side on card open) is exactly the case this covers.

**New decisions made this phase (confirmed with you):**
- **No fallback on fetch failure.** The listing fetch is load-bearing — a failure throws and
  surfaces via a new `app/global-error.tsx` (Next's required convention for errors originating in
  the root layout itself; none existed before this phase). Verified live: temporarily pointing
  `NEXT_PUBLIC_SANITY_PROJECT_ID` at a bad value produced the real Sanity error ("Dataset not
  found...") routed correctly to `global-error.tsx` (confirmed via the RSC payload;
  Next's dev-mode error overlay draws over the actual page in dev, so a production build would be
  needed to see the custom page rendered without it — not done, low value for what it'd prove).
  **Important nuance found during verification, worth flagging**: `npm run build`'s output shows
  every route as `○ (Static) prerendered as static content` — meaning `getProjectListing()` runs
  once *at build time*, not per-request. A Sanity outage during a rebuild/deploy would fail the
  **build**, not surface `global-error.tsx` at runtime — that page mainly guards live dev-server
  fetches (as tested) until Phase 9's revalidation changes the caching story. Worth Phase 9 revisiting
  whether `force-dynamic`/ISR is wanted instead of full static generation.
- **`date` field dropped entirely** (no Sanity equivalent) — removed from `ProjectBase`. Card-front
  micro-label is now category-only, font bumped 6px→7px (`compositeCardFront.ts`); reading-pane meta
  line likewise drops the date segment. Synced to `card-table-portfolio-design-system.md` §3.2/§7.
- **`isFlagship`** has no real schema field yet. `lib/getProjects.ts` temporarily hardcodes the
  *first* fetched project as flagship (array-position rule, not data-driven) — `TODO` comments in
  `data/types.ts` and `lib/getProjects.ts` mark this for replacement once a real field is wired up
  in the other project's Sanity schema.
- **Per-card detail-fetch failures degrade locally** (an in-pane "couldn't load" message in
  `OpenCardOverlay`), distinct from the listing fetch's throw-to-global-boundary policy — the
  grid/cards already work regardless of one card's body text failing to load, so a full-app crash
  would be disproportionate. This was my own scoping call, not put to you directly — flagged here
  per the same "how load-bearing is this fetch" reasoning as the listing decision.
- **`body`'s real content**: no Sanity field named `body` exists. `projectDetailQuery` fetches the
  two general-purpose text fields `SCHEMA.md` §3b documents on every project — `heroDescription` and
  `description` — as a stand-in for real body copy until Phase 7's category-specific renderers land.

**Gotchas**
- This is the one phase where `CLAUDE.md`'s "the swap should only touch `data/projects.ts`"
  invariant likely stops being literally true — flag `CLAUDE.md` for an update once this phase's
  actual shape is settled, rather than silently violating a stated architecture invariant. **Done**
  — `CLAUDE.md`'s intro paragraph updated to describe the real data flow.
- Audit `lib/choreography.ts` / `lib/cardHandles.ts` for any implicit assumption that card data is
  synchronously available — this refactor isn't guaranteed to be a pure data-layer change.
  **Audited (2 parallel Explore agents)**: neither is count-driven or content-driven at setup time —
  both were already count-agnostic (`choreography.ts` reads `store.cardOrder` live;
  `cardHandles.ts`'s registry populates incrementally per mounted `Card`). The real coupling was
  narrower than feared: `lib/layout.ts`'s frozen `CARD_COUNT` module constant (now a `getLayout()`
  parameter) and `store/useTableStore.ts`'s module-scope `initialCards()` call (now the
  `hydrateProjects` action). No choreography code changed at all this phase.

**Post-completion refinements, once real content was actually visible on the cards:**
- Card-front title now wraps up to 2 lines (ellipsis-truncated beyond that), respecting the same
  8px padding on both sides — it previously ran unbounded past the right padding for longer real
  titles (`lib/textures/compositeCardFront.ts`'s new `wrapText` helper).
- Category micro-label bumped 7px → 11px — real category names ("Logos & Branding," etc.) had
  plenty of margin at 7px, confirmed comfortably fits one line at 11px too.
- Card-front image source switched from `heroImage` to `previewImage` — `SCHEMA.md` §3b documents
  `previewImage` as the field meant for grid/listing use; `heroImage` is reserved for the expanded
  project page (Phase 6/7). `lib/queries.ts`'s `projectListingQuery` and `lib/getProjects.ts` both
  updated. All 14 live projects have `previewImage` set (spot-checked), so no fallback-image gap.
  Synced to `card-table-portfolio-design-system.md` §3.2/§7 item 24.

---

## Phase 6 — Reading pane: shared shell (medium–hard) — ✅ Done 2026-07-17

- [x] Build the shared hero / overview / closing shell inside `OpenCardOverlay` per
      `PROJECT_PAGE_LAYOUT.md` §6, replacing the current flat title/meta/paragraph rendering
      (`OpenCardOverlay.tsx:101-111`). **Done**: hero (category pill + heading h1, conditional
      subheading h2, conditional description p, hero image), overview (`.customSection` — conditional
      tags row, conditional quick-stats grid, conditional tools row), and closing image (omitted
      entirely if absent) all built. `ArtBlock`'s existing placeholder canvas is retained as both the
      loading state *and* the permanent no-image fallback, not replaced. All fields fetched via an
      expanded `projectDetailQuery` (`lib/queries.ts`) and a new `ProjectDetail` type
      (`data/types.ts`) — `heroSubheading`, `heroDescription`, `heroImage`, `projectTags`,
      `quickStats`, `tools[]->` (dereferenced, incl. icon + color), `closingImage`.
      **Deviation from Phase 5, flagged**: Phase 5's ad-hoc "`body` = `description` + `heroDescription`
      dumped as generic paragraphs" is retired — `heroDescription` now renders in its real structural
      position (the hero), and `description` has no documented home in §6, so it's dropped rather
      than kept as a leftover field. `getProjectDetail()` now returns a `ProjectDetail` object, not
      `string[]`.
- [x] Apply per-project dynamic theming as inline CSS custom properties on the pane root
      (`--projectBgColor`, `--projectColor`, `--projectColorDark`, `--projectCtaColor`), same
      mechanism as the reference, restyled with this project's tokens. **Done**, with one
      architecture refinement: `projectColor`/`projectColorDark`/`ctaColor` were promoted to eager,
      listing-level fields on `Project` (alongside `frontBg`/`previewColor`, already eager) rather
      than the lazy per-card detail fetch — avoids a visible color-pop the instant the pane opens,
      since the colors are needed on the pane root from frame one. Concrete consumers wired within
      this phase's scope: `--projectColor` → category pill bg + quickStat/toolsRow left-border
      accent; a 5th, `--toolColor`, scoped locally per tool pill (fetched per-tool from the `tools`
      document, not a project-level field). `--projectColorDark`/`--projectCtaColor` have no
      consumer yet — their consumers (`.customSection--dark`, `.liveLink`) are category-body content,
      Phase 7 — but the CSS vars are already set on the root, ready for Phase 7 to just use them.
      **Real-data finding**: some tool colors are light pastels (e.g. `#D9EDF2`) — white tool-pill
      text (a natural first guess mirroring the category pill's white-on-saturated-teal treatment)
      was nearly unreadable; switched to `var(--card-front-text)` (dark) instead, caught via visual
      verification against live data before shipping.
- [x] **Explicitly skip** `PROJECT_PAGE_LAYOUT.md` §3's global ancestor CSS (body background, `main`
      container reset, global `h1–h6`/`img` resets) — this app already owns its own page shell;
      only port the *component-level* classes (§6 onward), never the page-chrome resets. **Confirmed
      skippable** — verified via research it's pure page-chrome, zero component classes. One nice
      coincidence found: the reference's `main` column cap is 1000px, and this app's own
      `getReadingPane()` already caps the pane at 1000px — nothing to reconcile.
- [x] Merge in the old portfolio's 7-tier breakpoint scale (320/450/590/768/1024/1280/1400),
      **scoped only to these new reading-pane components** via CSS Modules — every other component
      in the app keeps its existing single 767px breakpoint untouched. **Scoped down, deliberately**:
      only 768px and 590px actually fire within §6's own rules — the other 5 tiers (320/450/1024/
      1280/1400) belong to §7/§9 category-body patterns that don't exist until Phase 7. Only those 2
      tiers were added now; Phase 7 introduces the rest as it needs them, rather than scaffolding
      unused `@media` blocks for content that doesn't exist yet.

**Gotchas**
- Keep Outfit for utilitarian text (already shared with this app's own type system) but confirm
  headings use this app's display face, not the old portfolio's Outfit-only heading treatment.
  **Confirmed, resolved**: hero h1/h2 use this app's default UI face (Outfit, inherited — no
  `--font-script`/Meow Script applied), not the app's decorative script face. Project titles are
  real, arbitrary content needing legibility, unlike the app's intentional one-off script moments
  ("Pick a Card," "Hello!") — this also just preserves the font choice the pre-Phase-6 flat `.title`
  already used, not a new decision made from scratch.
- Treat every cms-folder pixel/hex value as structural reference, not a value to paste verbatim —
  re-derive from this project's DS tokens. **Followed**: tag pills use this pane's existing
  `rgba(28,28,28,0.08)` chip treatment (matching `.close`'s button bg) instead of the reference's
  unthemed static `#CCCCCC`; hero/heading sizes reuse this project's own already-signed-off 34px/500
  weight (the pre-Phase-6 `.title`'s values) rather than the reference's 2.441rem Figma value.

---

## Phase 7 — Reading pane: category-specific body renderers (hard) — ✅ Done 2026-07-17

- [x] Web Apps body (`PROJECT_PAGE_LAYOUT.md` §9, 9 sections).
- [x] Websites body (9 sections, structurally near-identical to Web Apps).
- [x] UX Case Studies body (17 sections + 4 chapter dividers — the largest and most granular).
- [x] Logos & Branding body (7 sections, including 3 "Core Section" blocks).

  **Architecture, decided before writing any of the 4**: one shared component library
  (`components/dom/ProjectBody/` — 9 pattern primitives from §7: `Media`, `TextImageRow`,
  `SoloTextContainer`, `SoloImageContainer`, `MediaGallery`, `InfoCardGrid`, `SoloInfoCard`,
  `PortraitImageGrid`, `DividerSection`, `LiveLinkRow`, `Section`), not 4 independent renderers —
  each category body is thin JSX composition reading flat fields off its typed detail object. All 4
  category field-block interfaces (`WebAppFields`/`WebsiteFields`/`UxCaseStudyFields`/
  `LogoBrandingFields`, `data/types.ts`) written out in full against `SCHEMA.md` §3c–3f (~291
  discrete fields total: 52/62/~115/62) — flat field names matching Sanity's actual shape verbatim,
  not regrouped into nested per-section objects (the reference itself types everything `any`, no
  shared types to import). `ProjectDetail` became a discriminated union keyed by `category`
  (mirroring `Project`'s existing pattern), and `projectDetailQuery` (`lib/queries.ts`) became one
  GROQ conditional projection gated on a `$category` param passed by the caller — no extra
  `category->title` dereference needed since `OpenCardOverlay` already has it from listing data.

  **A real bug caught during visual verification, not just a hypothetical**: `getProjectDetail`'s
  final object build originally spread `raw` *after* the already-correctly-extracted shared base
  fields — `{...base, category, ...raw}` — which silently clobbered `heroImage`/`closingImage` back
  to their raw `{url}` object shape (since `raw` carries those same keys unprocessed) instead of the
  plain string `base` had already extracted. Manifested as a hard runtime crash
  (`url.includes is not a function`) the instant a card was opened. Fixed by reversing the spread
  order (`{...raw, ...base, category}` — base's processed values must win). Caught only because
  verification used the real running app against real data instead of stopping at `tsc --noEmit`,
  which had no way to see this — both sides of the spread type-checked fine individually.

- [x] Implement graceful section-omission: skip rendering a whole section when its backing fields
      are empty, matching the old portfolio's behavior — confirmed, not just a happy-path port.
      **Done**: each category body computes a `hasX` boolean per section (checking its
      heading/text/array fields) before rendering that section's wrapper at all — verified live
      against real projects with genuinely sparse sections (e.g. Web Apps teaser with no images but
      live links present still renders correctly, per the real bug hunt above).
- [x] Implement the shared media-rendering recipe (§8): video-takes-priority-over-image per slot,
      `next/image` with the reference's hardcoded intrinsic dimensions unless real dimensions are
      wanted instead. **Done** (`ProjectBody/Media.tsx`) — 1920×1080 landscape (everywhere) / 1080×1920
      portrait (`PortraitImageGrid`, Logos & Branding Core Sections only), aspect enforced by
      container CSS per the reference's own approach, not real asset metadata.
- [x] Wire live-link CTA icons once icon assets are decided/provided (user's call, case-by-case).
      **Done** — you added `desktop`/`mobile`/`responsiveLinkIcon.svg` to `public/assets/icons/`;
      `lib/liveLinkIcon.ts` resolves the `ctaIcon` enum to that path (not the reference's bare-root
      path). Verified live: real "Visit Live Web App" CTA renders correctly themed
      (`--projectCtaColor`) with the right icon for a real project's `responsive` link.

**Scope decisions made this phase (flagged, not silent):**
- **Alt text**: uses a single generic fallback per image (built from the section heading already
  fetched) rather than fetching+typing a matching `*Alt` sibling field for every one of ~150 image
  fields — the reference does the latter with hand-crafted per-field fallback strings, but that
  would roughly double this phase's already-large query/type surface for accessibility polish beyond
  what's reasonably scoped here. Real per-field alt text is a clean, isolated follow-up if wanted.
- **`*Points` array drift**: needed no special code — `.map()` over any array length already handles
  pre-migration 1-item arrays correctly.
- **UX Case Studies / Logos & Branding overlap**: confirmed disjoint at the data level (mutually
  exclusive per document) despite shared naming *conventions* — kept fully separate interfaces and
  renderers, per the checklist's own instruction.

**Gotchas**
- Don't bother porting confirmed-dead classes: `.platformImageContainer`/`.platformImage`, or the
  stray always-empty `infoCardContainer` in Logos & Branding's First Core Section. **Skipped, as
  planned** — UX Case Studies' Platform Display uses `SoloImageContainer` like every other gallery.
- `*Points` array fields may still carry pre-migration 1-item arrays on older content
  (`itemPoints` drift, `SCHEMA.md` §5) — render defensively, don't assume multi-item. **No special
  handling needed** (see scope decisions above).
- UX Case Studies and Logos & Branding share several field *names* with different meanings
  (`outcomesSectionHeading`, `keyLearnHeading`, etc.) — keep their type definitions and renderers
  fully separate, no shared interface between the two despite the naming overlap. **Followed** — see
  `UxCaseStudyFields`/`LogoBrandingFields` in `data/types.ts`, no shared base beyond `ProjectDetailBase`.
- The reference frontend has **no shared TypeScript types at all** (everything typed `any`) — this
  project is defining its own from scratch off `SCHEMA.md`, there's nothing to import. **Done** — all
  4 interfaces + `LiveLink` + `ProjectDetail`'s discriminated union written from scratch.

---

## Phase 8 — Autoplay video performance (hard) — ✅ Done 2026-07-17

- [x] Implement IntersectionObserver-based play/pause so only in-viewport videos actually autoplay
      — confirmed necessity (autoplay is required), performance mitigations are open to change.
      **Done**: new `components/dom/ProjectBody/AutoplayVideo.tsx`, used by both `Media.tsx` (the
      shared video-priority primitive) and `PortraitImageGrid.tsx` (its own inline videos) — every
      video slot in every category body now goes through this single component. **Gotcha found and
      handled**: the reading pane scrolls *internally* (`.pane { overflow-y: auto }`), not the page
      — `IntersectionObserver`'s default root (the top-level viewport) never changes as the pane
      scrolls, so every video would report as permanently "intersecting" without an explicit root.
      Fixed via a new `PaneScrollRootContext` (`PaneScrollRootContext.tsx`), provided by
      `OpenCardOverlay` with a ref to the pane element, consumed by every `AutoplayVideo` regardless
      of nesting depth.
- [x] Consider capping simultaneous active decodes / poster-first-then-attach-source pattern for
      sections with many video slots (teaser galleries, etc.). **Done, via poster-first**: a video
      renders with `preload="none"` and no `<source>` children at all (zero network request) until
      it first scrolls into view (`rootMargin: "200px 0px"` for a small pre-load buffer) — then the
      source is attached once and never removed, so scrolling back into view later is an instant
      resume, not a re-buffer. This alone caps concurrent decodes to whatever's actually visible
      (typically 1–2 videos at any scroll position), so a separate hard-cap mechanism wasn't needed
      — confirmed via live testing (see verification below) rather than assumed.
- [x] Verify autoplay video inside the overlay doesn't fight this app's own WebGL render loop
      (canvas keeps animating underneath/behind the modal) — related to, but distinct from, the
      existing OneDrive/hidden-tab WebGL gotcha already known in this project. **Verified live**
      against a real project with real teaser videos (`The Singleton Microsite`): confirmed via
      direct video-element state inspection (not just visual screenshot) at 3 scroll positions —
      off-screen videos have zero source/network activity, the in-view video plays
      (`paused: false, readyState: 4`), scrolling it out of view pauses it without discarding the
      loaded source, and scrolling back resumes instantly. Zero console/page errors throughout, with
      the WebGL canvas continuously animating behind the modal the whole time — no conflict found.

---

## Phase 9 — Revalidation webhook (hard) — ✅ Code done 2026-07-17, webhook registration pending deployment

- [x] Build `/api/revalidate` (signature verification via `next-sanity/webhook`'s `parseBody()`,
      checked against a secret; `revalidateTag(_type, { expire: 0 })` on match). **Done**
      (`app/api/revalidate/route.ts`, this app's first API route — confirmed `ƒ Dynamic` in the
      build output, as expected for a route handler). **Verified locally** with `@sanity/webhook`'s
      own `encodeSignatureHeader` (constructs a genuinely valid test signature, not just "doesn't
      crash"): correctly-signed request → 200 + `revalidateTag` runs clean; wrong secret, tampered
      payload, and missing signature header all → 401; valid signature with no `_type` → 400.
- [x] Define this app's own tag scheme, mirrored per query the same way `FRONTEND_INTEGRATION.md`
      §2a documents for the reference site. **Already correct, no changes needed** — confirmed
      `lib/getProjects.ts`'s `getProjectListing()` is the only server-side tagged fetch in this app
      (`["project", "category"]`, set back in Phase 5), matching the reference's tag for the
      equivalent query. The client-side `getProjectDetail` fetch doesn't participate in Next's Data
      Cache at all (browser fetch, not server-side `client.fetch` usage), so nothing to tag there.
      **Grew as expected in Phase 10**: `lib/getSiteSettings.ts`'s `getSiteSettings()`/
      `getFeaturedTools()` are tagged `["siteSettings"]`/`["tools"]` respectively — the existing
      `/api/revalidate` handler needed no changes to pick these up, since it already revalidates
      whatever `_type` the webhook payload names.
- [ ] **[USER]** Register a new, separate webhook on the shared Sanity project pointed at this
      app's `/api/revalidate` — this coexists independently alongside the old site's existing
      webhook; confirm no conflict, both simply fire independently per document publish.
      **Deliberately pending deployment** — Sanity's webhook fires from their cloud infrastructure,
      which cannot reach a local machine at all (not a "swap the URL later" situation, a hard
      reachability dead end without a tunnel). Register this once a real Vercel URL exists.
- [x] **[USER]** Provide `SANITY_REVALIDATE_SECRET` for `.env.local` and, later, Vercel. **`.env.local`
      done** (already present, used directly in this phase's local verification). **Vercel still
      pending** — same deployment dependency as the webhook registration above.

**Note for whenever deployment happens**: Phase 5 flagged that `npm run build` shows every route as
fully static-prerendered (`○ Static`), which raised a question of whether `revalidateTag` actually
busts a statically-generated page or only matters for genuinely dynamic rendering. This should
resolve itself correctly on Vercel (their on-demand ISR infrastructure honors `revalidateTag` against
statically-prerendered pages using tagged fetches), but it's a production-platform behavior
`next dev` can't meaningfully prove either way — worth a real end-to-end check (publish a test edit
in the Studio, confirm the deployed home page updates without a redeploy) once both the webhook and
the Vercel secret are actually in place.

---

## Phase 10 — About page integration (hard, deferred) — ✅ Done 2026-07-17

- [x] Map `siteSettings` (`resumeUrl`, `experience`, `clients`, `socialLinks`) and `tools`
      (`isFeatured`) onto this app's existing `data/experience.ts`, brand/"Tables I've Played," and
      `data/tools.ts`-equivalent structures.
- [x] Where Sanity's actual shape differs from this app's current mock shape, **Sanity wins** —
      reshape the app's data model, don't force-fit (confirmed general rule). Applied: renamed
      `ExperienceCardData.dateRange` → `yearRange` to match the real field name verbatim.
- [x] Rebuild the `socialLinks[].platform` → icon lookup as a local static-asset map (not CMS data),
      same pattern as the reference's `socialIconsByPlatform` — `lib/socialIcons.ts`.

**Implementation notes**
- `AboutContent`/`ControlDock` are hoisted into `app/layout.tsx` (not nested under
  `app/about/page.tsx`), same architecture as the project grid — so this phase reused the
  `ProjectsHydrator`/`hydrateProjects` pattern rather than prop-threading: `lib/getSiteSettings.ts`
  fetches server-side in `app/layout.tsx`, `components/dom/SiteSettingsHydrator.tsx` threads it into
  new flat `useTableStore` fields (`experience`, `clients`, `tools`, `resumeUrl`, `socialLinks`).
- Unlike `getProjectListing()` (throws by design), `getSiteSettings()`/`getFeaturedTools()` catch
  their own errors and degrade to empty defaults — `ControlDock` renders on every route including
  Home, so a siteSettings fetch failure can't be allowed to take the whole site down.
- **`clients[].websiteUrl` is deliberately not fetched or consumed.** `BrandCard.tsx`'s whole card is
  already the tap target for its name↔logo reveal toggle, so there's no space for a second click
  target without redesigning that interaction — user's call was to leave it unbuilt and deprecate
  the field in the schema later rather than build UI for it now. `Brand` (`data/types.ts`) has no
  `websiteUrl` field.
- `data/experience.ts`, `data/brands.ts`, `data/tools.ts`, `lib/aboutLinks.ts` deleted (mock retired
  once the real source landed, same precedent as `data/projects.ts` in Phase 5). `data/photos.ts`
  stays — confirmed no `siteSettings` counterpart for the Hero photo spread.

**Gotchas (resolved)**
- `ToolChipData.logoAlt` / client logos both had `null` alt text on every live-checked document (no
  alt authored in the Studio yet) — falls back to `title`/`name` at the mapping layer in
  `lib/getSiteSettings.ts`. `Brand` itself carries no alt field at all: `BrandCard.tsx`'s logo `<img>`
  is decorative (`alt=""`), the client name is already the button's accessible label.
- `socialLinks[].url` vs. `.email` are mutually exclusive per item — `lib/socialIcons.ts`'s
  `socialLinkHref()` branches on `platform === "Email"`.

---

## Phase 11 — Category-based card-back color-coding (hardest, currently blocked)

- [ ] **[USER]** Add new color field(s) to the `category` document schema on the other project
      (nothing today stores a "card back color" per category — `SCHEMA.md` §1 confirms `category`
      only has `title`/`slug`/`icon`/`image`/`description`).
- [ ] Once available, query and wire that color into card-back rendering, replacing the interim
      flat blue.

**Blocked** until the schema change lands — no action possible from this repo until then.

---

## Phase 12 — Routing decision & implementation (open-ended, parked)

- [ ] Decide flat `/[slug]` vs. nested `/[category]/[slug]` (see "Open decisions" table above).
- [ ] If nested: build resolver/redirect behavior for bare `/projects` and `/projects/[category]`
      hits, since this app has no equivalent listing pages today.
- [ ] If flat: rely on the existing catch-all `app/not-found.tsx` for anything else; confirm via
      Phase 2's dataset spot-check that no current cross-category slug collisions exist, and accept
      the risk of a future one.
- [ ] Design the cold-load problem: landing directly on a deep-linked opened card before the deck
      has been dealt has no defined animation today (onboarding gate, `dealComplete` guard in
      `useTableStore.ts`) — this is inherited from the PRD's own Phase 3 deep-linking item, not
      something this Sanity integration is responsible for solving, but it blocks any real routing
      implementation regardless of which slug shape is chosen.

**Gotchas**
- Deep-linking to an opened card via URL was already scoped as PRD Phase 3, independent of the CMS
  integration — this phase can be deferred indefinitely without blocking anything else in this
  checklist.

---

## Cross-cutting gotchas (reference while working any phase above)

- **`category->title`, never `categoryName`** — the latter is a Studio-only sync convenience field
  with no integrity guarantee for a read consumer (`SCHEMA.md` §3a).
- **Slug uniqueness is compound-scoped** (`slug` + `category`), never globally unique — matters for
  Phase 12 regardless of which routing shape wins.
- **Image hotspot has no canvas equivalent** — must be custom-built if ever needed; not assumed by
  default.
- **Video fields are plain file assets, not streaming** — bandwidth/perf cost scales directly with
  how many autoplay simultaneously (Phase 8).
- **No shared TypeScript types exist upstream** — everything in Phase 3/7 is defined fresh in this
  repo.
- **Two independent webhooks will exist on the same Sanity project** after Phase 9 — the old site's
  and this one's — confirm this is fine (it is, webhooks are independent) rather than assuming one
  needs to be modified.
- **CORS only matters the moment any fetch is client-side** — server-only fetching (the initial
  lean for Phase 5) sidesteps it entirely. **Correction (Phase 4)**: this includes canvas-drawing a
  `cdn.sanity.io` image with `crossOrigin="anonymous"` (required to avoid tainting a WebGL texture)
  — confirmed live that the **image CDN enforces its own origin allowlist**, separately from the
  Content API that `FRONTEND_INTEGRATION.md` §5a describes (`403 CORS Origin not allowed` when an
  unlisted `Origin` header is present). So the CORS allowlist entry is needed as soon as real images
  render client-side, not only for a client-side Content-API query — earlier than Phase 5 alone
  would suggest.
- **`CLAUDE.md`'s "swap only touches `data/projects.ts`" invariant is likely to need revision**
  after Phase 5's async refactor — treat that as an expected, tracked deviation, not an oversight.
- **The cms-folder's own layout doc admits an unconfirmed assumption** — it explicitly states its
  Next.js/CSS-Modules-parity assumption is "unconfirmed" from its author's side; this project does
  match (App Router, CSS Modules), so the assumption holds, but it was never a guarantee.
- **Design-system authority order**: this project's Design System doc > this project's PRD >
  cms-folder docs (structural reference only, see intro). Don't let the cms folder's own color/type
  values leak into anything outside the merged-breakpoint, per-project-theming exceptions explicitly
  called out above.

---

## Env & credentials checklist (all **[USER]**-administered)

| Value | Needed by | Where it lives |
|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Phase 1 | `.env.local`, then Vercel at deploy |
| `NEXT_PUBLIC_SANITY_DATASET` | Phase 1 | `.env.local`, then Vercel at deploy |
| `SANITY_REVALIDATE_SECRET` | Phase 9 | `.env.local`, then Vercel at deploy |
| CORS origin allowlist entry | Phase 5 (only if client-side fetch) | manage.sanity.io, project → API tab |
| New webhook registration | Phase 9 | manage.sanity.io, project → API tab |
| New `category` color field(s) | Phase 11 | Sanity Studio schema (other repo) |

Prompt the user at the specific point each of these is actually needed — don't ask for all of them
up front.
