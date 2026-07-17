# Project Detail Page — Layout & CSS Replication Guide

Companion to `sanity/SCHEMA.md` (content model) and `sanity/FRONTEND_INTEGRATION.md` (data
fetching/rendering rules). Those two documents tell you *what the data looks like* and *how to
fetch and dispatch it*; this document tells you *what to build with it* — the exact DOM structure,
CSS, and per-category section order of the **project detail page** in this reference frontend, so
a separate consumer project can reproduce it pixel-for-pixel before diverging later.

**Scope: project detail pages only** — the shared hero/overview/closing shell plus the 4
category-specific body layouts (Web Apps, Websites, UX Case Studies, Logos & Branding). The
category listing grid (`/projects/[category]`), home page, nav, and footer are deliberately **out
of scope** — this doc says nothing about them; that's not an oversight, ask if you need them too.

**Assumption stated explicitly (unconfirmed):** this guide assumes the consuming project is also
Next.js (App Router) using CSS Modules (`*.module.css`), since it already shares this repo's
"editorial style project page container" and Outfit font setup. If that's wrong, the data-shape and
CSS sections still apply, but the JSX/`next/image` specifics in §8 won't map directly.

All CSS below is **plain CSS** — every Sass `@include`/`$variable`/`&` nesting from the reference
`*.module.scss` files has been resolved to literal values, safe to paste into a `.module.css` file
as-is. Class names are kept identical to this repo's (including the `--modifier` suffixes, e.g.
`customSection--dark`) for zero-ambiguity parity — in a CSS Modules JS/TSX file, access those via
bracket notation (`styles["customSection--dark"]`) same as this repo does, since `--` isn't valid
in dot-property access.

---

## 1. Design tokens

### Breakpoints

The reference `respond($bp)` mixin is **desktop-down** (`max-width`), not mobile-first — get this
inverted and every responsive rule fires at the wrong end.

| Name | Value |
|---|---|
| `mobileSm` | 320px |
| `mobileMd` | 450px |
| `mobile` | 590px |
| `tablet` | 768px |
| `laptop` | 1024px |
| `desktop` | 1280px |
| `large` | 1400px |

Every responsive rule in this doc is written as `@media (max-width: <px>) { ... }` using these
values directly — define them as literal numbers or `:root` custom properties, either works fine
in CSS Modules (no Sass map/mixin needed).

### Type scale

| Token | Value |
|---|---|
| `$fs-3xl` | 3.052rem |
| `$fs-2xl` | 2.441rem |
| `$fs-xl` | 1.953rem |
| `$fs-lg` | 1.563rem |
| `$fs-md` | 1.25rem |
| `$fs-base` | 1rem |
| `$fs-sm` | 0.8rem |
| `$fs-xs` | 0.64rem |

Font weights: `$fw-regular = 400`, `$fw-semibold = 600`. Every heading/text rule below states its
resolved `font-size`/`font-weight` directly (the `font()` mixin just bundles
`font-family: var(--font-outfit); line-height: 1.5` by default alongside these — same in every
translated block).

### Colors used on project pages

| Token | Hex |
|---|---|
| `$grey-80` | `#CCCCCC` |
| `$grey-60` | `#999999` |
| `$grey-40` | `#666666` |
| `$grey-20` | `#333333` |
| `$white` | `#fff` |

Plus the **per-project dynamic** custom properties — see §5, these are the important ones, not the
static palette above (the static greys only show up in a few incidental places: tag pill
background, live-link divider borders, quick-stat label color).

---

## 2. Outfit font (parity checklist, not new instruction)

Since both projects already have this installed, just confirm it matches:

```ts
// next/font/google
const outfit = Outfit({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-outfit" });
// applied: <body className={outfit.variable}>
```

Every font rule in this doc resolves to `font-family: var(--font-outfit);` — confirm your project
exposes the same CSS custom property name, or swap it for whatever yours uses.

---

## 3. Ancestor / global CSS this layout depends on

The project page container is **not full-viewport** — it renders inside a capped content column.
If your shared editorial container doesn't already provide equivalents of these, the page will be
the wrong width or missing its dark backdrop:

```css
body {
  background: #141414;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 100dvw;
  min-height: 100dvh;
  color: #333333;
  line-height: 1.5;
  font-family: var(--font-outfit);
  font-size: 1rem; /* $fs-base */
  -webkit-font-smoothing: antialiased;
}

main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  max-width: 1000px;   /* the actual content-column cap the project page renders inside */
  margin-top: 6rem;
  padding: 0 1rem;
}

*, *::before, *::after { box-sizing: border-box; }
* { margin: 0; padding: 0; }

img, picture, video, canvas, svg { display: block; max-width: 100%; }

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-outfit);
  font-weight: 600;
  font-size: 1rem; /* overridden per-element everywhere below */
  text-wrap: balance;
}
p { text-wrap: pretty; }
```

Since the second project claims to already share this container, treat this section as a
**verification checklist** rather than something to add fresh — a mismatch here (e.g. no 1000px
cap, or a light body background) is the most likely source of "close but not exact" results.

---

## 4. `<main>` wrapping the page

`app/projects/[category]/[project]/page.tsx` renders directly inside the site's `<main>` (no extra
wrapper) — the project page's root element is the first thing inside that 1000px column.

---

## 5. Per-project dynamic theming (the single most important mechanism to replicate)

The root container reads 4 Sanity fields off the current project and writes them as inline CSS
custom properties, which the rest of the page's CSS (including every category body) references via
`var(...)`:

```tsx
<div
  className={styles.projectPageContainer}
  data-bgcolor={projectData.previewColor}
  style={{
    "--projectBgColor": projectData.previewColor,
    "--projectColor": projectData.projectColor,
    "--projectColorDark": projectData.projectColorDark,
    "--projectCtaColor": projectData.ctaColor,
  }}
>
```

Plus one more, set per-tool-chip inside the overview section (not on the root):

```tsx
<div style={{ "--toolColor": tool.color }}>
```

All 4 root-level fields are documented in `SCHEMA.md` §3b (`previewColor`, `projectColor`,
`projectColorDark`, `ctaColor`) — use those exact field names in your own query, and set these same
4 custom-property names on your equivalent root element. Nothing else in this doc's CSS will look
right without this step, since backgrounds, category-title pills, quick-stat borders, tool-icon
borders, dark-section backgrounds, and CTA button colors all resolve through these variables rather
than hardcoded colors.

---

## 6. Shared shell (hero + overview + closing — rendered directly by the page, not a category body)

```css
.projectPageContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  border-radius: 1rem;
  background-color: var(--projectBgColor);
  overflow: hidden;
}

/* HERO ============================================ */
.heroText {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  padding: 3rem 2rem;
  gap: 1rem;
}
.heroText h2 {
  font-size: 2.441rem; /* $fs-2xl */
  font-weight: 600;
  line-height: 1.2;
  font-family: var(--font-outfit);
  width: 70%;
  max-width: 600px;
}
@media (max-width: 768px) {
  .heroText { padding: 2rem 2rem; }
  .heroText h2 { font-size: 1.953rem; width: 100%; } /* max-width:1200 in the source SCSS has no unit and is dropped by browsers as invalid — don't bother porting it, it has no visible effect */
}
@media (max-width: 590px) {
  .heroText { padding: 2rem 1rem; }
  .heroText h2 { font-size: 1.563rem; width: 100%; }
  .heroText p { font-size: 0.8rem; }
}

.categoryTitle {
  background-color: var(--projectColor);
  padding: 0.3rem 0.5rem;
  border-radius: 0.35rem;
  color: #fff;
  font-size: 0.75rem;
}
/* Rendered as: <h1><span class="categoryTitle">{category.title}</span>{" - " + title}</h1>
   <h2>{heroSubheading}</h2> <p>{heroDescription}</p> */

.heroImageContainer { width: 100%; max-height: 500px; overflow: hidden; }
.heroImage { object-fit: cover; width: 100%; height: 100%; }
@media (max-width: 768px) { .heroImage { height: auto; } }
/* Hero image src: urlFor(heroImage).width(1920).auto('format').url(), with
   style={{ objectPosition: hotspotPosition(heroImage) }} — see FRONTEND_INTEGRATION.md §3.
   The closing image at the bottom of the page reuses this exact same .heroImageContainer/.heroImage
   pair with `closingImage` instead of `heroImage`. */

/* PROJECT OVERVIEW ================================ */
.customSection {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  padding: 3rem 2rem;
  gap: 3rem;
}
.customSection--dark {
  background-color: var(--projectColorDark);
  color: #fff;
}
@media (max-width: 768px) { .customSection { padding: 2rem 2rem; gap: 2rem; } }
@media (max-width: 590px) {
  .customSection { padding: 2rem 1rem; }
  .customSection p, .customSection li { font-size: 0.8rem; }
}
/* .customSection / .customSection--dark is the rhythm device used throughout every category body
   — apply BOTH classes together to get the dark variant (`class="customSection customSection--dark"`),
   don't treat --dark as a full replacement. */

.tagsRow { display: flex; flex-direction: row; align-items: flex-start; justify-content: flex-start; flex-wrap: wrap; gap: 0.75rem; }
.tagItem {
  display: flex; align-items: center; justify-content: center;
  padding: 0.25rem 0.75rem;
  background-color: #CCCCCC;
  border-radius: 0.25rem;
}
@media (max-width: 590px) { .tagItem { font-size: 0.8rem; } }

.quickStats {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 1rem;
  row-gap: 2rem;
}
@media (max-width: 590px) { .quickStats { grid-template-columns: repeat(2, 1fr); } }
.quickStatItem {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
  border-left: 3px solid var(--projectColor);
  padding-left: 0.5rem;
}
.quickStatItem span:first-child { color: #666666; }
.quickStatItem span:last-child { font-weight: 600; }
@media (max-width: 590px) { .quickStatItem { font-size: 0.8rem; } }

.toolsRow {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: center;
  width: 100%;
  border-left: 3px solid var(--projectColor);
  padding-left: 0.5rem;
}
.toolsRow span:first-child { color: #666666; }
.toolSet { display: flex; flex-direction: row; align-items: flex-start; justify-content: flex-start; flex-wrap: wrap; gap: 0.5rem; }
.toolItem {
  display: flex; align-items: center; justify-content: center;
  background-color: var(--toolColor);
  gap: 0.35rem;
  border-radius: 0.35rem;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0.5rem 0 0;
  font-weight: 600;
}
.toolItem img { height: 1.75rem; margin-right: 0.25rem; }
@media (max-width: 590px) { .toolItem { font-size: 0.8rem; } }
/* Overview section render order: tagsRow (if projectTags present) -> quickStats -> toolsRow.
   Tool icon: plain <img src={tool.iconUrl}>, not next/image (source is a Sanity asset URL). */
```

**Dead class, don't bother porting:** `.platformImageContainer`/`.platformImage` exist in the
reference `projectPage.module.scss` but have zero render call sites anywhere (verified via
grep) — UX Case Studies' "Platform Display" section uses `.soloImageContainer`/`.dividerImage`
instead (see §9). Leftover from an earlier iteration.

---

## 7. Shared pattern-class vocabulary (used across all 4 category bodies)

```css
/* SECTION DIVIDER — UX Case Studies chapter dividers only, see §9 */
.dividerImageContainer {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  position: relative;
  width: 100%;
  max-height: 350px;
  overflow: hidden;
}
.dividerImageContainer::before {
  content: '';
  position: absolute; inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.dividerImageContainer h2 {
  font-size: 2.441rem; font-weight: 600; line-height: 1.5; font-family: var(--font-outfit);
  position: absolute; z-index: 10; margin: 0;
  color: #fff; text-align: center;
}
@media (max-width: 768px) {
  .dividerImageContainer { max-height: 300px; }
  .dividerImageContainer h2 { font-size: 1.953rem; }
}
@media (max-width: 590px) {
  .dividerImageContainer { max-height: 200px; }
  .dividerImageContainer h2 { font-size: 1.563rem; }
}
.dividerImage { object-fit: cover; width: 100%; height: auto; }
/* NOTE: .dividerImage is reused (confusingly) as the generic media class inside EVERY
   soloImageContainer/rowImageContainer across all 4 category bodies, not just inside
   dividerImageContainer — see the rest of this section. It's just "the img/video that fills its
   parent," the name only literally matches its original use case. */

/* TEXT + IMAGE ROW — the core alternating layout primitive */
.textImageRow { display: flex; flex-direction: row; align-items: center; justify-content: center; width: 100%; }
.textImageRow--reverse { flex-direction: row-reverse; }
@media (max-width: 768px) { .textImageRow { flex-direction: column-reverse; } }
/* --reverse still applies row-reverse as its own rule; at <=768px both collapse to
   column-reverse either way since the column-reverse rule has no --reverse variant needed. */

.textContainer {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start;
  width: 50%;
  gap: 0.5rem;
  padding: 2rem;
}
.textContainer h3 { font-size: 1.25rem; font-weight: 600; font-family: var(--font-outfit); line-height: 1.5; }
@media (max-width: 768px) { .textContainer { width: 100%; padding: 2rem 1rem; } }

.soloTextContainer {
  display: flex; flex-direction: column; align-items: flex-start; justify-content: flex-start;
  width: 50%;
  gap: 0.5rem;
}
.soloTextContainer h3 { font-size: 1.563rem; } /* $fs-lg */
@media (max-width: 768px) {
  .soloTextContainer { width: 100%; }
  .soloTextContainer h3 { font-size: 1.25rem; } /* $fs-md */
}

.bulletList { padding-left: 1.5rem; }

.rowImageContainer { width: 50%; max-height: 400px; border-radius: 0.5rem; overflow: hidden; }
@media (max-width: 768px) { .rowImageContainer { width: 100%; } }

.soloImageContainer { width: 100%; height: auto; border-radius: 0.5rem; overflow: hidden; }

/* INFO CARDS */
.infoCardContainer { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.infoCardContainer--2 { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 768px) { .infoCardContainer, .infoCardContainer--2 { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 590px) { .infoCardContainer, .infoCardContainer--2 { grid-template-columns: repeat(1, 1fr); } }
.infoCard {
  display: flex; flex-direction: column; align-items: center; justify-content: flex-start;
  gap: 1rem;
  color: var(--projectColorDark);
  text-align: center;
  background-color: #fff;
  padding: 3rem 1.5rem;
  border-radius: 0.5rem;
}
.infoCard h4 { font-size: 1.25rem; }
.infoCard li { text-align: left; }
.soloInfoCard {
  /* same as .infoCard, plus: */
  align-items: flex-start;
  text-align: left;
}
/* .soloInfoCard is `@extend .infoCard` in the source SCSS — in plain CSS, either apply both
   classes together (class="infoCard soloInfoCard") or duplicate .infoCard's declarations onto
   .soloInfoCard and add the two overrides above. Reference render code does the former:
   `<div className={styles.soloInfoCard}>` alone in JSX, so if you don't duplicate the base
   declarations you MUST also add styles.infoCard to the className. */

.portraitImageContainer { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
@media (max-width: 768px) { .portraitImageContainer { gap: 1rem; } }
.portraitImage { object-fit: contain; height: auto; border-radius: 0.5rem; }

/* LIVE LINKS (CTA buttons) */
.liveLinkContainer {
  display: flex; align-items: center; justify-content: center;
  width: 100%;
  gap: 1rem;
  padding: 2rem 0;
  border-top: 1px solid #999999;
  border-bottom: 1px solid #999999;
}
@media (max-width: 1024px) { .liveLinkContainer { flex-direction: column; gap: 1.5rem; padding: 2rem 1rem; } }
@media (max-width: 590px) { .liveLinkContainer { padding: 2rem 0.5rem; } }
.liveLink {
  display: flex; align-items: center; justify-content: center;
  transition: all 0.3s ease-in-out;
  min-width: 290px;
  text-decoration: none;
  background-color: var(--projectCtaColor);
  color: white;
  font-weight: 600;
  padding: 1rem 0;
  gap: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.45);
}
.liveLink:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0px 10px 20px 0px rgba(0, 0, 0, 0.25);
  filter: brightness(1.2);
}
@media (hover: none) {
  .liveLink:hover { transform: translateY(0) scale(1); box-shadow: 0px 4px 10px 0px rgba(0, 0, 0, 0.45); filter: brightness(1); }
}
@media (max-width: 450px) { .liveLink { width: 100%; min-width: auto; } }
.liveLinkIcon { }
@media (max-width: 320px) { .liveLinkIcon { display: none; } }
.liveLinkText p:last-child { font-weight: 400; }
/* Rendered as an <a href={liveLink.url} target="_blank" rel="noopener noreferrer"> wrapping a
   40px icon (see §10 for the icon asset dependency) and a .liveLinkText div with
   <p>{text}</p> and, if subText is present, <p>[{subText}]</p>. */
```

---

## 8. Media rendering recipe

Cross-reference `FRONTEND_INTEGRATION.md` §3 for the full data-shape rationale (flat URL strings,
the 5-field hotspot exception, alt-text sibling convention). The literal markup pattern repeated
throughout every category body — video takes priority over image when both could apply for the
same slot:

```tsx
{field.someVideo ? (
  <video
    className={styles.dividerImage}
    src={field.someVideo}
    poster={field.someVideoPoster}
    autoPlay muted loop playsInline preload="metadata"
  >
    <source src={field.someVideo} type="video/mp4" />
    <source src={field.someVideo} type="video/webm" />
    Your browser does not support the video tag.
  </video>
) : (
  field.someImage && (
    <Image
      className={styles.dividerImage}
      src={field.someImage}
      height={1080}
      width={1920}
      alt={field.someImageAlt || "<category/field-specific fallback string>"}
    />
  )
)}
```

- `next/image` always uses hardcoded `height={1080} width={1920}` regardless of real asset
  dimensions — aspect ratio is enforced by the container's CSS (`object-fit`/`max-height`), not by
  Sanity metadata.
- Array-of-image / array-of-video "gallery" fields map with `.map()`, each item independently
  wrapped in its own `.soloImageContainer`, and videos pair with `videoPosters?.[index]`
  positionally (3 parallel arrays, not one array of objects) — except "item"-shaped fields
  (`webApp_designSectionItems`, `website_uxStructureItems`, `competitors`, etc.) which already
  bundle image+video+poster per object.
- Portrait media (Logos & Branding core sections only) uses `height={1920} width={1080}` (swapped)
  and `.portraitImage` instead of `.dividerImage`, grouped inside `.portraitImageContainer`.
- Hero/closing images are the one exception to flat-URL rendering — they go through
  `urlFor(image).width(1920).auto('format').url()` + `style={{ objectPosition: hotspotPosition(image) }}`,
  see §6.

---

## 9. Per-category section-order maps

Field names below are unqualified — see `SCHEMA.md` §3c–§3f for the full type/shape of each
(this table only tells you order, pattern, and light/dark; it doesn't restate field types).
`customSection` = light, `customSection customSection--dark` = dark. Every category's body starts
immediately after the shared Project Overview section (§6) and ends immediately before the closing
image (§6).

### Web Apps

| # | Section | Pattern | Light/Dark | Fields |
|---|---|---|---|---|
| 1 | Teaser + live links + product context | `soloImageContainer`×N (teaser) → `liveLinkContainer` → `textImageRow` | Light | `webApp_teaserImages/Videos/VideoPosters`, `liveLinks`, `webApp_productContextHeading/Context/Image/Video/VideoPoster` |
| 2 | Problems & Goals | `infoCardContainer--2` (2-col), one `infoCard` per item w/ `bulletList` | **Dark** | `webApp_probGoals[]` → `{probGoalName, probGoalList[]}` |
| 3 | Discovery strategy + UX hypothesis + initial design media | `soloTextContainer` → `textImageRow--reverse` → `soloImageContainer`×N | Light | `webApp_productStratHeading/Content`, `webApp_uxHypothesisHeading/[]/Image/Video/VideoPoster`, `webApp_initialDesignImages/Videos/VideoPosters` |
| 4 | Project Scope | `soloTextContainer` → `infoCardContainer` (3-col) | **Dark** | `webApp_prodScopeHeading/Scope`, `webApp_prodScopeItems[]` → `{itemTitle, itemRationale}` |
| 5 | Design Section | `soloTextContainer` → `soloImageContainer`×N → alternating `textImageRow`/`textImageRow--reverse` (reverse when `index % 2 === 0`) | Light | `webApp_designSectionHeading/Text/Images/Videos/VideoPosters`, `webApp_designSectionItems[]` → `{itemName, itemPoints[], itemImage/Video/VideoPoster}` |
| 6 | Developer Section | same shape as Design Section | **Dark** | `webApp_devSectionHeading/Text`, `webApp_devSectionItems[]` (same item shape) |
| 7 | Finished Product + live links | `soloTextContainer` → `soloImageContainer`×N → `liveLinkContainer` | Light | `webApp_finishedProdHeading/Text/Images/Videos/VideoPosters`, `liveLinks` |
| 8 | Outcomes | `soloTextContainer`×2 → `infoCardContainer` (3-col) | **Dark** | `webApp_outcomesSectionHeading`, `webApp_mainOutcomeText/Heading`, `webApp_otherOutcomes[]` → `{outcomeTitle, outcomeDescription}` |
| 9 | Key Learnings + What Worked | `textImageRow--reverse` then `textImageRow` (normal, not reversed) | Light | `webApp_keyLearnHeading/Text/List/Image/Video/VideoPoster`, `webApp_whatWorkedHeading/Text/List/Image/Video/VideoPoster` |

### Websites

Structurally near-identical rhythm to Web Apps, `website_` prefix throughout.

| # | Section | Pattern | Light/Dark | Fields |
|---|---|---|---|---|
| 1 | Teaser + live links + business context + problems + design objectives | `soloImageContainer`×N → `liveLinkContainer` → `soloTextContainer` → `textImageRow--reverse` → `textImageRow` | Light | `website_teaserImages/Videos/VideoPosters`, `liveLinks`, `website_businessContextHeading/Content`, `website_problemsIdentifiedHeading/[]/Image/Video/VideoPoster`, `website_designObjectivesHeading/[]/Image/Video/VideoPoster` |
| 2 | Market Context + target audience | `soloTextContainer`×2 → `infoCardContainer` (3-col) | **Dark** | `website_marketContextHeading/Context`, `website_targetAudienceHeading`, `website_targetAudience[]` → `{member, rationale}` |
| 3 | Information Architecture | `soloTextContainer` → `soloImageContainer`×N | Light | `website_informationArcHeading/Text/Images/Videos/VideoPosters` |
| 4 | UX Structure & Planning | `soloTextContainer` → alternating `textImageRow`/`--reverse` (reverse when `index % 2 === 0`) | **Dark** | `website_uxStructureHeading/Text`, `website_uxStructureItems[]` → `{structureName, structurePoints[], structureImage/Video/VideoPoster}` |
| 5 | Visual Design | `soloTextContainer` → `soloImageContainer`×N | Light | `website_visualDesignHeading/Text/Images/Videos/VideoPosters` |
| 6 | Website Build & Implementation | `soloTextContainer` → alternating `textImageRow`/`--reverse` → `soloImageContainer`×N (extra media) | **Dark** | `website_websiteBuildHeading/Text`, `website_websiteBuildItems[]` → `{buildItemName, buildItemPoints[], buildItemImage/Video/VideoPoster}`, `website_websiteBuildImages/Videos/VideoPosters` |
| 7 | Accessibility + pre-launch + live links | `soloTextContainer`+`bulletList` → `soloImageContainer`×N → `textImageRow--reverse` → `liveLinkContainer` | Light | `website_accessibilityHeading/Text[]/Images/Videos/VideoPosters`, `website_preLaunchHeading/Checks/Image/Video/VideoPoster`, `liveLinks` |
| 8 | Outcomes | `soloTextContainer`×2 → `infoCardContainer` (3-col) | **Dark** | `website_outcomesSectionHeading`, `website_mainOutcomeText/Heading`, `website_otherOutcomes[]` |
| 9 | Key Learnings + What Worked | `textImageRow--reverse` then `textImageRow` | Light | `website_keyLearnHeading/Text/List/Image/Video/VideoPoster`, `website_whatWorkedHeading/Text/List/Image/Video/VideoPoster` |

### UX Case Studies

The longest/most section-rich category — unprefixed field names, and the only category using
`dividerImageContainer` chapter dividers (4 total, placed at fixed narrative transition points,
rendered as direct siblings of `<section>` elements, not nested inside one).

| # | Section | Pattern | Light/Dark | Fields |
|---|---|---|---|---|
| 1 | Platform media + live links + project rationale | `soloImageContainer` (platform) → `liveLinkContainer` → `textImageRow--reverse` | Light | `platformImages/Videos/VideoPosters`, `liveLinks`, `projectRationaleHeading/Rationale/Image/Video/VideoPoster` |
| — | **DIVIDER: Research** | `dividerImageContainer` | overlay | `researchSectionTitle/Image/Video/VideoPoster` |
| 2 | Market Research | `textImageRow` (normal) | Light | `marketResearchHeading/Content/Visual/VisualVideo/VisualVideoPoster` |
| 3 | Competitive Analysis + Opportunities | alternating `textImageRow`/`--reverse` per competitor (reverse when `index % 2 === 0`) → `textImageRow` (opportunities) | **Dark** | `competitiveAnalysisHeading/Intro`, `competitors[]` → `{competitorName, competitorType, competitorImage/Video/VideoPoster, competitorPros[], competitorCons[]}`, `opportunitiesHeading/List/Image/Video/VideoPoster` |
| 4 | User Survey + Assumption Validation | `soloTextContainer` → `soloImageContainer`×N (survey charts) → `textImageRow--reverse` | Light | `userSurveyHeading/Intro`, `surveyCharts[]/surveyChartsVideo[]/surveyChartsVideoPoster[]`, `assumptionValidationHeading/[]/Image/Video/VideoPoster` |
| 5 | Key Insights + Opportunity | `soloTextContainer` → `infoCardContainer` (3-col, card `h4` = index+1, numbered not titled) → `soloInfoCard` | **Dark** | `keyInsightsHeading`, `keyInsights[]`, `opportunityText` |
| 6 | User Personas | `soloTextContainer` → `soloImageContainer`×N | Light | `personasHeading/Intro`, `personas[]/personasVideo[]/personasVideoPoster[]` |
| 7 | Problem Statement + Design Goals | `soloTextContainer`×2 → `infoCardContainer` (3-col, numbered cards) | **Dark** | `problemStatementHeading/Statement`, `designGoalsHeading`, `designGoals[]` |
| — | **DIVIDER: Ideation** | `dividerImageContainer` | overlay | `ideationSectionTitle/Image/Video/VideoPoster` |
| 8 | User Flow | `soloTextContainer` → `soloImageContainer`×N | Light | `userFlowHeading/Description`, `userFlowDiagrams[]/userFlowDiagramsVideo[]/userFlowDiagramsVideoPoster[]` |
| 9 | Information Architecture | `soloTextContainer` → `soloImageContainer` (single) | **Dark** | `informationArchitectureHeading/Description/Image/Video/VideoPoster` |
| 10 | Wireframes | `soloTextContainer` → `soloImageContainer`×N | Light | `wireframesHeading/Description`, `wireframeImages/Videos/VideoPosters` |
| — | **DIVIDER: Visual Design** | `dividerImageContainer` | overlay | `visualDesignSectionTitle/Image/Video/VideoPoster` |
| 11 | Style Guide | `soloTextContainer` → `soloImageContainer`×N | Light | `styleGuideHeading/Description`, `styleGuideImages/Videos/VideoPosters` |
| 12 | High Fidelity Designs | `soloTextContainer`+`bulletList` (key screens) → `soloImageContainer`×N | **Dark** | `highFidelityHeading/Intro`, `keyScreensList[]`, `highFidelityMockups[]/highFidelityMockupsVideo[]/highFidelityMockupsVideoPoster[]` |
| 13 | Prototype + notes + live links + validation + study results + prototype updates | `soloTextContainer` → `soloImageContainer`×N → `soloTextContainer`+`bulletList` (notes) → `liveLinkContainer` → `soloTextContainer`+`bulletList` (validation) → `textImageRow--reverse` (study results) → `textImageRow` (updates) | Light | `prototypeHeading/Description/Images/Videos/VideoPosters/Notes[]`, `liveLinks`, `validationHeading/Description/Methodology[]`, `studyResultsHeading/[]/Image/Video/VideoPoster`, `prototypeUpdateHeading/Updates[]/Image/Video/VideoPoster` |
| 14 | Accessibility Considerations | `soloTextContainer`+`bulletList` → `soloImageContainer` | **Dark** | `accessibilityHeading`, `accessibilityConsiderations[]`, `accessibilityMockup/Video/VideoPoster` |
| — | **DIVIDER: Final Thoughts** | `dividerImageContainer` | overlay | `finalThoughtsSectionHeading/Image/Video/VideoPoster` |
| 15 | Final Results + Key Learnings | `soloTextContainer`+`bulletList` (expected outcomes) → `textImageRow--reverse` | Light | `finalResultsHeading/Text`, `expectedOutcomes[]`, `keyLearningsHeading/Learnings[]/Image/Video/VideoPoster` |
| 16 | Future Improvements | `soloTextContainer` → `infoCardContainer` (3-col) | **Dark** | `futureImprovementsHeading`, `futureImprovements[]` → `{improvementTitle, improvementDescription}` |
| 17 | Closing Summary | `soloTextContainer` | Light | `closingSummaryHeading/Text` |

### Logos & Branding

Unprefixed field names (shares some field *names* with UX Case Studies — different meaning, no
runtime collision, see `SCHEMA.md` §3f). Structured around 2–3 "Core Sections," each pairing a
full-width landscape media block with a 3-col portrait grid.

| # | Section | Pattern | Light/Dark | Fields |
|---|---|---|---|---|
| 1 | Teaser + business context + problems + design objectives | `soloImageContainer`×N → `soloTextContainer` → `textImageRow--reverse` → `textImageRow` | Light | `teaserImages/Videos/VideoPosters`, `businessContextHeading/Content`, `problemsIdentifiedHeading/[]/Image/Video/VideoPoster`, `designObjectivesHeading/[]/Image/Video/VideoPoster` |
| 2 | Design Approach | `soloTextContainer` → `soloInfoCard` (discovery strategy) → `infoCardContainer` (3-col, methods) | **Dark** | `designApproachHeading`, `discoveryStrategyHeading/Strategy`, `designApproachMethods[]` → `{approachTitle, approachDescription}` |
| 3 | First Core Section | `soloTextContainer`+`bulletList` → `soloImageContainer`×N (landscape) → `portraitImageContainer` (3-col, images then videos separately, each only rendered if its array is present) | Light | `firstCoreSectionHeading/Text/List[]`, `firstCoreLandscapeImages/Videos/VideoPosters`, `firstCorePortraitImages/Videos/VideoPosters` |
| 4 | Second Core Section | same shape as First Core | **Dark** | `secondCore*` (same field suffixes) |
| 5 | Third Core Section | same shape as First Core | Light | `thirdCore*` (same field suffixes) |
| 6 | Outcomes | `soloTextContainer` → `soloInfoCard` (main outcome) → `infoCardContainer` (3-col) | **Dark** | `outcomesSectionHeading`, `mainOutcomeHeading/Text`, `otherOutcomes[]` |
| 7 | Key Learnings + What Worked | `textImageRow--reverse` then `textImageRow` | Light | `keyLearnHeading/Text/List/Image/Video/VideoPoster`, `whatWorkedHeading/Text/List/Image/Video/VideoPoster` |

**Note on First/Second/Third Core Sections' empty `infoCardContainer`:** the reference
`LogosBrandingBody.tsx` has a stray `<div className={styles.infoCardContainer}></div>` (always
empty, no `.map()` inside) between the landscape media and the portrait grid in the *First* Core
Section only — renders as nothing visually (an empty grid container with no children). Not worth
porting; flagged here only so a line-by-line diff against the reference component doesn't look like
a missed section.

---

## 10. Static asset dependency: live-link CTA icons

`liveLinks[].ctaIcon` is a Sanity enum (`desktop` | `mobile` | `responsive`) — the icon itself is
**not** Sanity data. The reference frontend resolves it by string-building a path into its own
`/public`:

```tsx
<Image src={`/${liveLink.ctaIcon}LinkIcon.svg`} height={50} width={50} alt="Live Link Icon" />
```

pointing at `public/desktopLinkIcon.svg`, `public/mobileLinkIcon.svg`, `public/responsiveLinkIcon.svg`
in *this* repo. The second project needs its own 3 equivalent SVGs (any filenames/location) plus
its own `ctaIcon` → asset mapping — copy the icon files over or design new ones, but the enum
values driving the lookup come from Sanity either way.

---

## 11. Explicitly out of scope

Not covered by this doc — don't assume silence means "not needed," ask if you need these too:

- Category listing grid (`app/projects/[category]/page.tsx`, `ProjectCards` component)
- Home page, nav, footer, about/contact pages
- `siteSettings` document (resume link, work experience, client logos, social links) — not
  consumed by the project detail query at all, see `SCHEMA.md` §4 and `FRONTEND_INTEGRATION.md` §2b
