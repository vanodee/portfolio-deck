# Sanity Frontend Integration Guide

Companion to `sanity/SCHEMA.md`. That file documents *what the content looks like*; this file
documents *how the reference implementation (this repo's Next.js frontend) actually fetches and
renders it*, so a **new, separate frontend** consuming the same dataset can reuse the working
patterns and avoid the rough edges instead of rediscovering them.

This reflects the state of the code as of this audit — re-derive by reading `lib/`, `app/**/page.tsx`,
and `app/components/ProjectCategoryBodies/` if this repo has moved on since.

---

## 1. Connecting to the dataset

Reference client setup — `lib/sanity.client.ts`:

```ts
import { createClient } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";

export const sanityConfig = {
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: "2025-01-01",
  useCdn: false,
};

export const client = createClient(sanityConfig);
export const builder = imageUrlBuilder(client);
export function urlFor(source: any) {
  return builder.image(source);
}
```

- **Env vars needed:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`. Get the
  actual values from this repo's `.env.local` (gitignored, not committed) or the Sanity project
  dashboard — not documented here since they're config, not schema.
- **`useCdn` is always `false`** (changed as part of `sanity/OPTIMIZATION_CHECKLIST.md` item 8 —
  previously prod-only). This repo now relies on on-demand revalidation (§2a below): a webhook
  busts Next's Data Cache for a tag the instant a document publishes, but Sanity's CDN has its own
  separate TTL that would otherwise still serve the pre-edit version for a short window afterward.
  Reading straight from the live API avoids that double-caching gap. A new frontend not doing
  on-demand revalidation doesn't need this constraint and can go back to CDN-in-prod.
- **Dataset visibility confirmed public**: verified directly via an unauthenticated `curl` against
  `https://<projectId>.api.sanity.io/v<apiVersion>/data/query/<dataset>?query=...` — real data came
  back with no token supplied. No read token is needed for a new frontend's queries; token-gated
  access only matters if it needs to read unpublished drafts (`perspective: 'drafts'`/`'raw'`),
  which none of this repo's read paths do.
- **`urlFor()` is exported but effectively unused** by the reference implementation — every query
  resolves images to plain URLs via GROQ's `asset->url` instead (see §3). If the new frontend
  wants Sanity's on-the-fly image transforms (resizing, format, quality), reach for `urlFor()` /
  `@sanity/image-url` yourself; don't assume the existing queries already do this.
- **`next.config.ts`** allowlists `cdn.sanity.io` under `images.remotePatterns` — required for
  `next/image` (or equivalent) to load Sanity-hosted asset URLs. Mirror this if the new frontend
  also uses Next's Image component.

---

## 2. Query catalog

**`lib/queries.ts` is now the complete query catalog** (fixed as part of
`sanity/OPTIMIZATION_CHECKLIST.md` item 6 — previously 4 pages/components each defined their own
inline `groq` template literal instead of importing a named export, and a `categoriesQuery` export
sat unused with no call site; both are resolved now):

| Query | Purpose |
|---|---|
| `siteSettingsQuery` | The `siteSettings` singleton: resume URL, work experience, client logos, social links. Fetched independently by `app/layout.tsx`, `app/page.tsx`, `app/about/page.tsx`, and `app/contact/page.tsx` — see below, it's not passed through props everywhere. |
| `categoriesWithToolsQuery` | Home page bento grid: categories + distinct tools used across each category's projects |
| `featuredToolsQuery` | About page: tools flagged `isFeatured == true` |
| `allProjectsQuery` | Project detail page: the single project, general fields + the one matching category-specific block (see `SCHEMA.md` §3) |
| `categoryWithProjectsQuery` | Category listing page (`app/projects/[category]/page.tsx`): one category + its projects (title, slug, description, previewColor, previewImage) |
| `categorySlugsQuery` | Category listing page's `generateStaticParams`, and the `/projects` redirect page's "pick the first category" lookup (`app/projects/page.tsx`) — one shared query for both, since ordering by `_createdAt desc` is harmless for the former and required for the latter's stable target |
| `projectAndCategorySlugsQuery` | Project detail page's `generateStaticParams`: all `(category slug, project slug)` pairs, for SSG |
| `categoryNavQuery` | `CategoryNav` component: category title + slug, for the nav |

`categoriesQuery` (all categories, no `tools`) was deleted — confirmed to have zero call sites and
no comment/context indicating an intended use; `categoriesWithToolsQuery` already covers the one
place categories are listed with more than just title/slug.

### 2a. Revalidation (on-demand, via webhook)

Added as part of `sanity/OPTIMIZATION_CHECKLIST.md` item 8. Every `client.fetch(query, params,
{ next: { tags: [...] } })` call site is tagged with the Sanity document `_type` value(s) the query
transitively depends on — including types pulled in only via a GROQ dereference (`->`), not just
the query's primary `_type` filter. `app/api/revalidate/route.ts` is a POST route handler that:
1. Verifies the request's `sanity-webhook-signature` header via `next-sanity/webhook`'s
   `parseBody()` (wraps `@sanity/webhook`, already a transitive dependency of `next-sanity` — no
   extra package needed), checked against `process.env.SANITY_REVALIDATE_SECRET`.
2. Reads the changed document's `_type` from the (signature-verified) payload.
3. Calls `revalidateTag(_type, { expire: 0 })`, purging every fetch tagged with that type.

Tag scheme per query (mirror this exactly in a new frontend, or Next's Data Cache won't invalidate
correctly when a webhook fires):

| Query | Tags |
|---|---|
| `siteSettingsQuery` | `['siteSettings']` |
| `categoriesWithToolsQuery` | `['category', 'project', 'tools']` (reverse-references project → tools) |
| `featuredToolsQuery` | `['tools']` |
| `categorySlugsQuery`, `categoryNavQuery` | `['category']` |
| `projectAndCategorySlugsQuery`, `categoryWithProjectsQuery` | `['project', 'category']` |
| `allProjectsQuery` | `['project', 'category', 'tools']` (dereferences both `category->` and `tools[]->`) |

**`revalidateTag`'s second argument is mandatory as of Next 16** (a "cache profile" — a named
string like `'max'` looked up against configured `cacheLifeProfiles`, or a `{ expire, revalidate,
stale }` object used directly). This repo doesn't configure named cache profiles, so
`{ expire: 0 }` is passed explicitly — reading Next's own `revalidateTag` source confirms this
reproduces the pre-Next-16 "immediate full purge" behavior deterministically, without depending on
any profile lookup table existing.

**External setup this code depends on (not in this repo — see item 8's manual steps):** a Sanity
webhook at manage.sanity.io pointed at `/api/revalidate`, filtered to
`_type in ["project", "category", "tools", "siteSettings"]`, signed with the same secret as
`SANITY_REVALIDATE_SECRET`. Without it, this code is inert and pages behave exactly as before
(full-deploy-only refresh) — the webhook is what actually triggers `revalidateTag`.

**Confirmed working end-to-end in production**: webhook test deliveries return `200`, and a real
Studio publish reflects live on the site with no new Vercel deploy. One domain quirk worth noting:
`stevano.dev` (apex) 307-redirects to `www.stevano.dev` (a Vercel domain setting, unrelated to this
code) — the webhook is configured against the apex URL and still gets `200`s, confirming Sanity's
webhook sender follows redirects on POST requests (this matters since some HTTP clients drop the
body or don't follow redirects at all for non-GET methods).

The full GROQ text for the two most load-bearing ones:

**Category detail + its projects** (`categoryWithProjectsQuery`):
```groq
*[_type == "category" && slug.current == $category][0]{
  title,
  "slug": slug.current,
  description,
  "projects": *[_type == "project" && category->slug.current == $category] | order(_createdAt desc){
    title,
    "slug": slug.current,
    description,
    previewColor,
    "previewImage": previewImage{ ..., "url": asset->url }
  }
}
```

**Project detail**: see `allProjectsQuery` in `lib/queries.ts` directly — it's ~550 lines because
it conditionally projects one of 4 category-specific field blocks based on
`category->title == "..."`. Don't hand-copy it into the new frontend without also copying that
conditional structure; it's the one query in this codebase that's tightly coupled to the schema
(see `CLAUDE.md`'s "Sanity integration — schema/query coupling" note in the source repo).

**Routing parameters:** the compound key throughout is `(category slug, project slug)`, not
project slug alone — `allProjectsQuery` filters on
`slug.current == $project && category->slug.current == $category` together. Project slugs are
**not** guaranteed globally unique across categories; always pass both. The Studio now enforces
uniqueness on exactly this compound key (`project.slug`'s custom `isUnique` in `projectType.ts`
checks `(slug, category)`, not slug alone), so this compound-key assumption is a schema-enforced
invariant, not just a routing convention.

### 2b. `siteSettingsQuery` fetch pattern (not a single shared fetch)

```groq
*[_type == "siteSettings"][0]{
  resumeUrl,
  experience,
  "clients": clients[]{ _key, name, "logoUrl": logo.asset->url, websiteUrl },
  socialLinks
}
```

There's no data-fetching layer that fetches this once and threads it through React context —
each server component that needs a piece of `siteSettings` calls `client.fetch(siteSettingsQuery)`
itself (Next.js/React dedupes identical `fetch()` calls within one request, so this isn't N
separate round trips per page load in practice, but it **is** N separate call sites in the code):

- `app/layout.tsx` fetches it once and passes slices down as props: `<NavBar resumeUrl={...} />`
  and `<Footer socialLinks={...} />` — because `NavBar` is a client component (`'use client'`) and
  can't fetch directly, and `Footer`/`NavBar` aren't given page-level data by Next.js automatically.
- `app/page.tsx` (home) and `app/about/page.tsx` each fetch it again for their own use of
  `resumeUrl`/`experience`/`clients` — pages don't receive data from their layout via props in the
  App Router, so this is the same pattern as fetching `categoriesWithToolsQuery`/`featuredToolsQuery`
  independently per page.
- `app/contact/page.tsx` fetches it again for `socialLinks`, since the Contact page's social-icon
  grid (using the "glass" icon variant, filtering out `platform === "Email"`) is a separate render
  from the Footer's, not a shared component.

**Icons are not part of the Sanity data.** `socialLinks[].platform` (a free-text string, matched
against `"Email"` | `"Linkedin"` | `"Twitter"` today) is looked up against a local static-asset map,
`socialIconsByPlatform`, exported from `app/components/Footer/Footer.tsx` and imported by
`app/contact/page.tsx`:

```ts
export const socialIconsByPlatform: Record<string, { src: string; glassSrc: string }> = {
  Email: { src: "/email_2.svg", glassSrc: "/email_glass.svg" },
  Linkedin: { src: "/linkedin_2.svg", glassSrc: "/linkedin_glass.svg" },
  Twitter: { src: "/twitter_2.svg", glassSrc: "/twitter_glass.svg" },
}
```

A new frontend introducing a `platform` value beyond these 3 needs its own fallback for this
lookup — there's no icon field in the schema to fall back to (a deliberate choice, see
`SCHEMA.md` §4).

**`socialLinks[].url` vs `.email`**: each item has exactly one of these two populated, never both
— see `SCHEMA.md` §4 for why (Sanity's `url` type rejects a plain email address). Consumers must
branch on `platform` to know which field to read, then build the right kind of link:
- `Footer.tsx` builds each anchor's `href` as `` platform === 'Email' ? `mailto:${email}` : url ``.
- `app/contact/page.tsx` still filters `platform !== 'Email'` out of its icon grid (unchanged), but
  separately finds the Email item and passes its plain `email` value (no `mailto:` prefix) as a
  prop to `<CopyEmail email={...} />` — `CopyEmail.tsx` no longer hardcodes an email address
  itself; both the displayed text and the clipboard copy use the prop as-is.

---

## 3. Image & video handling conventions

- **Most** image/video fields are still resolved to a **plain URL string** at query time via
  GROQ's `asset->url` (e.g. video fields, and the ~150 body-content image fields across the 4
  category blocks in `allProjectsQuery`) — hotspot/crop metadata for those fields is fetched by
  the Studio but discarded at query time, and cropped focal points aren't respected for them.
- **5 fields are the exception**, fixed as part of `sanity/OPTIMIZATION_CHECKLIST.md` item 3:
  `project.heroImage`, `project.previewImage`, `project.closingImage`, and `category.image`.
  These are projected as the **full image object plus a `url` alias**, not a flat string:
  ```groq
  "heroImage": heroImage{ ..., "url": asset->url },
  ```
  This dual shape exists because some consumers need a bare string (Open Graph image URLs,
  JSON-LD structured data, a CSS `background-image` template literal) while others want to
  resolve the image through `urlFor()` (from `lib/sanity.client.ts`, wrapping
  `@sanity/image-url`).

  **Important: don't force a fixed `width().height().fit('crop')` at the Sanity layer for images
  rendered into a responsive/CSS-sized container.** An early version of this fix did exactly that
  (baking a specific aspect ratio into the delivered image), which fought with the container's own
  `object-fit: cover` / `background-size: cover` — the two crops compounded, cutting away far more
  of the image than either one alone. The corrected pattern: request the image at a sensible
  `width()` only (no forced `height()`/`fit('crop')`), and let the container's existing
  `object-fit`/`background-size: cover` do the actual responsive crop, while pointing
  `object-position`/`background-position` at the hotspot so that crop still centers on the
  editor's chosen focal point:
  ```ts
  urlFor(projectData.heroImage).width(1920).auto('format').url()
  // + style={{ objectPosition: hotspotPosition(projectData.heroImage) }}
  ```
  `hotspotPosition()` (also exported from `lib/sanity.client.ts`) turns an image's `hotspot.x`/`y`
  (0–1 normalized) into a `"X% Y%"` CSS position string, falling back to `"50% 50%"` when no
  hotspot is set.

  Reference call sites: `app/projects/[category]/[project]/page.tsx` (hero/closing images via
  `next/image`'s `style.objectPosition`, plus `.heroImage.url` for OG/JSON-LD, which need a bare
  string and don't crop), `app/components/ProjectCards/ProjectCards.tsx` (preview image via a raw
  `<img style={{objectPosition}}>`, still not converted to `next/image` — unrelated cleanup), and
  `app/page.tsx` (category card backgrounds — both `backgroundImage` and `backgroundPosition` are
  resolved server-side into CSS values, since that context needs plain strings, not a JSX `src`).
  `category.icon` was **not** migrated — confirmed to have zero query or render consumers
  anywhere in the repo, so there was nothing to fix.
  This pattern was deliberately **not** extended to the ~150 other body-content image fields —
  the checklist frames that as a separate judgment call given the size of that surface area, not
  an automatic follow-on. If the new frontend wants hotspot honored more broadly, project the
  full image object instead of `.asset->url` and use `urlFor()` with `.fit()`/`.crop()` the same
  way, field by field.
- **Alt text is a separate, schema-wide convention from the hotspot/crop one above** (fixed as
  part of `sanity/OPTIMIZATION_CHECKLIST.md` item 4) — every one of the ~116 image-type fields in
  the schema now carries an `alt` sub-field (via the shared `imageWithAlt` type, see `SCHEMA.md`),
  and every one of them is surfaced in `allProjectsQuery`/`categoriesWithToolsQuery`/
  `featuredToolsQuery` as a **sibling field**, not by restructuring the existing flat-string
  projection:
  ```groq
  "webApp_keyLearnImage": webApp_keyLearnImage.asset->url,
  "webApp_keyLearnImageAlt": webApp_keyLearnImage.alt,
  ```
  For array-of-images ("gallery") fields, the alt sibling is a parallel array, indexed the same
  way as the existing images/videos/videoPosters parallel arrays (see the note below):
  ```groq
  "webApp_teaserImages": webApp_teaserImages[].asset->url,
  "webApp_teaserImagesAlt": webApp_teaserImages[].alt,
  ```
  For image fields nested inside an array-of-objects item (e.g. `itemImage` inside
  `webApp_designSectionItems[]{...}`), the alt sibling is added inside that same per-item
  projection (`"itemImageAlt": itemImage.alt`), not as a top-level field.
  The 3 fields already object-shaped from item 3 (`heroImage`/`previewImage`/`closingImage`, plus
  `category.image`) get `alt` added directly inside their existing object instead of a new
  top-level sibling, since they're already positioned to receive it: `heroImage{ ..., "url":
  asset->url, alt }`.

  **Render-side fallback convention**: every render call site uses `fetchedAlt || "<description>"`
  — since none of the ~15 existing projects have real alt text backfilled yet, the fallback keeps
  output unchanged until an editor fills in real text. Several of these fallback strings **fixed
  pre-existing bugs** found during this migration — copy-paste errors where one field's hardcoded
  alt was mistakenly reused on a different field (e.g. wireframe and style-guide images both said
  `"User Flow Diagram"`; several UX Case Study fields all said `"Project Rationale Image"`; a
  `"Survery Chart"` typo; Logos & Branding core-section images said `"Persona"`). If porting this
  pattern to a new frontend, don't copy the *old* hardcoded strings from a pre-migration snapshot
  of this codebase — several of them were wrong.
- Video fields resolve to plain `.mp4`/`.webm` file URLs, always rendered as a native `<video>`
  with `autoPlay muted loop playsInline preload="metadata"` and an explicit `poster` from the
  paired `*VideoPoster` image field (two independent Sanity fields, not derived).
- **Rendering priority pattern**, repeated throughout every `ProjectCategoryBodies/*.tsx`
  component: prefer video over image when both could apply —
  ```tsx
  {item.itemVideo ? (
    <video src={item.itemVideo} poster={item.itemVideoPoster} autoPlay muted loop playsInline preload="metadata">
      <source src={item.itemVideo} type="video/mp4" />
      <source src={item.itemVideo} type="video/webm" />
    </video>
  ) : (
    item.itemImage && <Image src={item.itemImage} height={1080} width={1920} alt="..." />
  )}
  ```
- **`next/image` is used with hardcoded `height={1080} width={1920}`** regardless of the actual
  asset's real dimensions — aspect ratio is enforced/overridden via CSS (Sass modules), not from
  Sanity's image metadata. If the new frontend wants correct intrinsic aspect ratios per image, it
  will need to either project `asset->metadata.dimensions` in GROQ or switch to `fill` layout.
- Array-of-image / array-of-video fields are rendered by mapping with `.map()` and pairing each
  video at index `i` with `videoPosters?.[i]` — **positional pairing, not a shared object** (the
  images/videos/posters are 3 parallel arrays, not one array of `{image, video, poster}` objects,
  at the "section-level" gallery fields — as opposed to the "item"-level object fields like
  `webApp_designSectionItems[]` which *do* bundle image+video+poster together per item). Keep this
  distinction in mind when porting the rendering logic — the two shapes need different mapping
  code.

---

## 4. Category-specific rendering dispatch

The project detail page renders general fields (title, hero, tags, quick stats, tools, live
links) unconditionally, then dispatches to exactly one of 4 body components based on
`projectData.category?.title` (fixed as part of `sanity/OPTIMIZATION_CHECKLIST.md` item 2 —
previously this keyed off `projectData.categoryName`, the Studio-synced convenience field, which
had no integrity guard; see `SCHEMA.md` §3a):

```tsx
{projectData.category?.title === "Web Apps" && <WebAppsBody projectData={projectData} styles={styles} />}
{projectData.category?.title === "Websites" && <WebsitesBody projectData={projectData} styles={styles} />}
{projectData.category?.title === "UX Case Studies" && <UxCaseStudiesBody projectData={projectData} styles={styles} />}
{projectData.category?.title === "Logos & Branding" && <LogosBrandingBody projectData={projectData} styles={styles} />}
```

`allProjectsQuery`'s conditional field-projection blocks were switched the same way, from
`categoryName == "Web Apps" => {...}` to `category->title == "Web Apps" => {...}` (and likewise for
the other 3 categories) — no new projection was needed since `category->{_id, title, "slug":
slug.current}` was already fetched as a general field.

Reference components: `app/components/ProjectCategoryBodies/{WebAppsBody,WebsitesBody,UxCaseStudiesBody,LogosBrandingBody}.tsx`.
A new frontend should build the equivalent of these 4 renderers, one per category, keyed off
`category->title` (dereferenced at query time) — not `categoryName`, which is now documented as a
Studio-UI-only field, not something read consumers should trust.

**Live link CTA icons are a local static-asset dependency, not part of the Sanity data.**
`liveLinks[].ctaIcon` is one of `desktop` | `mobile` | `responsive` (schema-level enum), and the
reference frontend resolves the icon by string-building a path:
`src={`/${liveLink.ctaIcon}LinkIcon.svg`}` — pointing at `public/desktopLinkIcon.svg`,
`public/mobileLinkIcon.svg`, `public/responsiveLinkIcon.svg` in **this** repo. The new frontend
needs its own equivalent static assets (any name/location it wants), plus its own mapping from the
`ctaIcon` enum value to that asset — this isn't fetched from Sanity.

---

## 5. A gotcha *not* to replicate: positional category indexing

The home page (`app/page.tsx`) fetches `categoriesWithToolsQuery` (categories ordered by
`_createdAt desc`) and then accesses `categories[0]`, `categories[1]`, `categories[2]`,
`categories[3]` **assuming** those positions are Web Apps, Websites, UX Case Studies, and
Logos & Branding respectively. This only holds because of the specific creation order of the 4
category documents in *this* dataset — it's fragile (breaks if a 5th category is ever added, or
if creation order differs) and not something the schema guarantees. If the new frontend needs to
render "the 4 categories" in a specific arrangement, filter/match by `slug.current` or `title`
explicitly instead of by array position.

---

## 5a. CORS

Sanity's CORS origin allowlist is managed externally at manage.sanity.io (project → API tab → CORS
Origins), not in this repo. This reference frontend fetches **exclusively server-side** (every
`client.fetch` call happens in a Server Component or Route Handler), which never hits CORS —
browser requests only. That's why this was never configured for this codebase specifically. A new
frontend only needs a CORS origin entry the moment it does any *client-side* (browser) fetch
against the same dataset — e.g. a client-rendered search box, a live-preview widget, anything using
`@sanity/client` or `fetch()` directly from code that runs in the browser. Add the frontend's
deployed origin (and its local dev origin, e.g. `http://localhost:3000`, if it fetches client-side
during development too) before shipping that feature, not preemptively.

---

## 6. Types

**There are no shared TypeScript types for any Sanity document today** — the reference frontend
types fetched data as `any` throughout (`projectData: any`, `categoryData: any`, `tool: any`,
etc. — see `WebAppsBody.tsx`, `ProjectCards.tsx`). There's no exported `Project`/`Category`/`Tool`
interface anywhere in this repo to import. The new frontend should define its own types based on
`sanity/SCHEMA.md`'s field tables (or generate them, e.g. via `sanity typegen` if the new project
adopts it) rather than expect to reuse anything from this codebase.

---

## 7. Scope notes

- This guide describes the **existing reference frontend's** patterns, not requirements the
  schema enforces — the new frontend is free to diverge (e.g. respecting hotspot/crop, using real
  image dimensions, avoiding the positional-indexing gotcha) as long as it queries the same
  underlying document shapes described in `SCHEMA.md`.
- Real content-lake access **was** available and used extensively while working through
  `sanity/OPTIMIZATION_CHECKLIST.md` (e.g. item 2's 15-document drift check, item 5's 5-project
  prose-content check, item 7's 14-project slug/category audit, this document's own live-query
  spot checks) — so field *presence patterns* for the current ~14-project dataset are reasonably
  well understood, not purely theoretical. That said, none of this constitutes a schema guarantee:
  a new frontend should still treat every optional field as possibly absent.
