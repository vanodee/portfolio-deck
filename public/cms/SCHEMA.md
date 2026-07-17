# Sanity Content Model — Reference Documentation

This document describes the Sanity content lake schema used by this portfolio site, for anyone
building a **separate consumer** of the same dataset. It reflects the schema as defined in
`sanity/schemaTypes/` and the shape actually fetched by `lib/queries.ts`.

- **Studio schema location:** `sanity/schemaTypes/`
- **Query reference:** `lib/queries.ts` is the complete query catalog (see
  `FRONTEND_INTEGRATION.md` §2 for the full list with purposes) — every query this app runs is a
  named, exported const there, nothing inline elsewhere.
- **Env vars needed to connect:** `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (see this repo's `.env.local`, not committed)

## Document types

| `_type`       | Purpose                                                              |
|---------------|-----------------------------------------------------------------------|
| `category`    | One of 4 project categories (Web Apps, Websites, UX Case Studies, Logos & Branding) |
| `tools`       | A tool/technology (e.g. Figma, React) referenced by projects         |
| `project`     | A single portfolio case study/project. One flat schema shared by all 4 categories, with category-specific fields shown/hidden conditionally. |
| `siteSettings`| A **singleton** (exactly one document, fixed `_id: 'siteSettings'`) holding site-wide content: resume link, work-experience timeline, client/brand logos, social links. |

There are only these 4 document types — no nested/child document types.

**Every `image`-typed field across every document type and every table below is actually
`imageWithAlt`** (`sanity/schemaTypes/objects/imageWithAlt.ts`), a shared object type wrapping
Sanity's built-in `image` type with one added field: `alt` (string, `Rule.warning()` — flagged in
the Studio but doesn't block publishing). This applies uniformly: single image fields, array-of-
images ("gallery") fields, and image fields nested inside array-of-objects items. The field tables
below still just say "image (hotspot)" for brevity, but every one of them carries this `alt`
sub-field. See `FRONTEND_INTEGRATION.md` §3 for how queries and render code consume it.

---

## 1. `category`

```
title       string  (required) — e.g. "Web Apps", "Websites", "UX Case Studies", "Logos & Branding"
slug        slug    (required, source: title)
icon        image   (hotspot)
image       image   (hotspot)
description text    (3 rows)
```

**Important:** `title` is not just a label — it is used as a literal string match elsewhere
(see "The `categoryName` sync pattern" below). The 4 existing category titles must be treated as
an enum: `"Web Apps"`, `"Websites"`, `"UX Case Studies"`, `"Logos & Branding"`.

---

## 2. `tools`

```
title       string   (required)
icon        image    (hotspot) — tool's icon/logo
color       string   — hex or CSS color name, used for UI display (e.g. tag/chip color)
isFeatured  boolean  (default: false) — flags a tool to show on the About page
```

`project.tools` is an array of references to this type.

---

## 3. `project`

This is the big one. It has **general fields** shared by every project, plus **4 blocks of
category-specific fields** (one block per category) that only apply depending on which category
the project belongs to.

### 3a. The `categoryName` sync pattern (read this first)

- `project.category` is a `reference` to a `category` document.
- `project.categoryName` is a **plain string field, read-only in the Studio UI**, auto-populated
  by a custom input component (`sanity/components/categoryWithSyncInput.tsx`) whenever an editor
  sets/changes `category`. It fetches the referenced category's `title` and writes it verbatim
  into `categoryName` via a direct `client.patch()` — this happens client-side in the Studio, not
  via a GROQ projection or webhook.
- Every category-specific field group's Studio visibility (`hidden: ({parent}) => parent?.categoryName !== 'Web Apps'`, etc.) keys off this **exact string match** against `categoryName` — Studio's
  synchronous `hidden` callback only receives the in-memory form value and can't dereference
  `category` to get its `title`, which is the entire reason `categoryName` exists.
- **`category->title` is the source of truth for read consumers** (both this repo's GROQ
  conditional projections in `allProjectsQuery` and its render-dispatch switch in
  `app/projects/[category]/[project]/page.tsx`) — not `categoryName`. `categoryName` is a
  Studio-UI-only convenience field now, guarded by an async validator (`Rule.custom` on
  `categoryName` in `sanity/schemaTypes/projectType.ts`) that flags drift as a Studio validation
  error if `category->title` and `categoryName` ever disagree (e.g. a document edited via the API,
  or the sync `useEffect`'s silently-swallowed `catch`).

**Implication for another project consuming this dataset:** dereference `category->title` in your
own queries rather than trusting `categoryName` — that's what this reference frontend does as of
the fix for `sanity/OPTIMIZATION_CHECKLIST.md` item 2. Compare against the literal strings
`"Web Apps"`, `"Websites"`, `"UX Case Studies"`, `"Logos & Branding"` either way; only the
left-hand operand (`category->title` vs. `categoryName`) changed, not the literal category names
themselves.

### 3b. General fields (present on every project, regardless of category)

| Field | Type | Notes |
|---|---|---|
| `title` | string (required) | |
| `slug` | slug (required, source: title) | Custom `isUnique` scopes the check to `(slug, category)` — see below |
| `description` | text (3 rows) | |
| `tools` | array of references → `tools` | |
| `category` | reference → `category` (required) | |
| `categoryName` | string (read-only, auto-synced) | See above |
| `previewImage` | image (hotspot) | Used in project grid/listing |
| `previewColor` | string | |
| `projectColor` | string | |
| `projectColorDark` | string | Dark-mode variant of `projectColor` |
| `heroHeading` | string | Falls back to `title` if empty (frontend behavior, not schema-enforced) |
| `heroSubheading` | string | |
| `heroDescription` | text (3 rows) | |
| `heroImage` | image (hotspot) | |
| `projectTags` | array of strings | Methodology/deliverable tags, e.g. "Market Research" |
| `quickStats` | array of objects `{ title, value }` | e.g. `{ title: "Timeline", value: "6 weeks" }` |
| `ctaColor` | string | Hex code for CTA background |
| `liveLinks` | array of objects `{ text, subText, ctaIcon, url }` | `ctaIcon` is an enum: `desktop` \| `mobile` \| `responsive` |
| `closingImage` | image (hotspot) | Final image closing out the case study |

Plus one of the 4 field blocks below, selected by `categoryName`.

---

### 3c. Category block: `"Web Apps"` (prefix `webApp_`)

All fields below are prefixed `webApp_` and only meaningful when `categoryName == "Web Apps"`.

| Section | Fields |
|---|---|
| Teaser | `webApp_teaserImages[]`, `webApp_teaserVideos[]` (file), `webApp_teaserVideoPosters[]` |
| Product Context | `webApp_productContextHeading`, `webApp_productContext` (text), `webApp_productContextImage`, `webApp_productContextVideo`, `webApp_productContextVideoPoster` |
| Problems & Goals | `webApp_probGoals[]` → objects `{ probGoalName, probGoalList[] }` |
| Discovery Strategy | `webApp_productStratHeading`, `webApp_productStratContent` (text) |
| UX Hypothesis | `webApp_uxHypothesisHeading`, `webApp_uxHypothesis[]` (strings), `webApp_uxHypothesisImage`, `webApp_uxHypothesisVideo`, `webApp_uxHypothesisVideoPoster`, `webApp_initialDesignImages[]`, `webApp_initialDesignVideos[]`, `webApp_initialDesignVideoPosters[]` |
| Project Scope | `webApp_prodScopeHeading`, `webApp_prodScope` (text), `webApp_prodScopeItems[]` → objects `{ itemTitle, itemRationale }` |
| Design Section | `webApp_designSectionHeading`, `webApp_designSectionText`, `webApp_designSectionImages[]`, `webApp_designSectionVideos[]`, `webApp_designSectionVideoPosters[]`, `webApp_designSectionItems[]` → objects `{ itemName, itemPoints[], itemImage, itemVideo, itemVideoPoster }` |
| Developer Section | `webApp_devSectionHeading`, `webApp_devSectionText`, `webApp_devSectionItems[]` → objects `{ itemName, itemPoints[], itemImage, itemVideo, itemVideoPoster }` |
| Finished Product | `webApp_finishedProdHeading`, `webApp_finishedProdText`, `webApp_finishedProdImages[]`, `webApp_finishedProdVideos[]`, `webApp_finishedProdVideoPosters[]` |
| Outcomes | `webApp_outcomesSectionHeading`, `webApp_mainOutcomeHeading`, `webApp_mainOutcomeText`, `webApp_otherOutcomes[]` → objects `{ outcomeTitle, outcomeDescription }` |
| Key Learnings | `webApp_keyLearnHeading`, `webApp_keyLearnText`, `webApp_keyLearnList[]`, `webApp_keyLearnImage`, `webApp_keyLearnVideo`, `webApp_keyLearnVideoPoster` |
| What Worked | `webApp_whatWorkedHeading`, `webApp_whatWorkedText`, `webApp_whatWorkedList[]`, `webApp_whatWorkedImage`, `webApp_whatWorkedVideo`, `webApp_whatWorkedVideoPoster` |

---

### 3d. Category block: `"Websites"` (prefix `website_`)

Structurally near-identical to Web Apps, prefixed `website_`, only meaningful when
`categoryName == "Websites"`.

| Section | Fields |
|---|---|
| Teaser | `website_teaserImages[]`, `website_teaserVideos[]`, `website_teaserVideoPosters[]` |
| Business Context | `website_businessContextHeading`, `website_businessContextContent` (text) |
| Problems Identified | `website_problemsIdentifiedHeading`, `website_problemsIdentified[]` (strings), `website_problemsIdentifiedImage`, `website_problemsIdentifiedVideo`, `website_problemsIdentifiedVideoPoster` |
| Design Objectives | `website_designObjectivesHeading`, `website_designObjectives[]` (strings), `website_designObjectivesImage`, `website_designObjectivesVideo`, `website_designObjectivesVideoPoster` |
| Market Context | `website_marketContextHeading`, `website_marketContext` (text), `website_targetAudienceHeading`, `website_targetAudience[]` → objects `{ member, rationale }` |
| Information Architecture | `website_informationArcHeading`, `website_informationArcText`, `website_informationArcImages[]`, `website_informationArcVideos[]`, `website_informationArcVideoPosters[]` |
| UX Structure & Planning | `website_uxStructureHeading`, `website_uxStructureText`, `website_uxStructureItems[]` → objects `{ structureName, structurePoints[], structureImage, structureVideo, structureVideoPoster }` |
| Visual Design | `website_visualDesignHeading`, `website_visualDesignText`, `website_visualDesignImages[]`, `website_visualDesignVideos[]`, `website_visualDesignVideoPosters[]` |
| Website Build & Implementation | `website_websiteBuildHeading`, `website_websiteBuildText`, `website_websiteBuildItems[]` → objects `{ buildItemName, buildItemPoints[], buildItemImage, buildItemVideo, buildItemVideoPoster }`, plus standalone `website_websiteBuildImages[]`, `website_websiteBuildVideos[]`, `website_websiteBuildVideoPosters[]` |
| Accessibility | `website_accessibilityHeading`, `website_accessibilityText[]` (strings), `website_accessibilityImages[]`, `website_accessibilityVideos[]`, `website_accessibilityVideoPosters[]` |
| Pre-Launch | `website_preLaunchHeading`, `website_preLaunchChecks[]` (strings), `website_preLaunchImage`, `website_preLaunchVideo`, `website_preLaunchVideoPoster` |
| Outcomes | `website_outcomesSectionHeading`, `website_mainOutcomeHeading`, `website_mainOutcomeText`, `website_otherOutcomes[]` → objects `{ outcomeTitle, outcomeDescription }` |
| Key Learnings | `website_keyLearnHeading`, `website_keyLearnText`, `website_keyLearnList[]`, `website_keyLearnImage`, `website_keyLearnVideo`, `website_keyLearnVideoPoster` |
| What Worked | `website_whatWorkedHeading`, `website_whatWorkedText`, `website_whatWorkedList[]`, `website_whatWorkedImage`, `website_whatWorkedVideo`, `website_whatWorkedVideoPoster` |

---

### 3e. Category block: `"UX Case Studies"` (no field prefix)

**Note:** unlike the other 3 categories, these field names have **no prefix** — this is the
largest and most granular block (a full research → ideation → visual design → validation
narrative). Only meaningful when `categoryName == "UX Case Studies"`.

| Section | Fields |
|---|---|
| Platform Display | `platformImages[]`, `platformVideos[]`, `platformVideoPosters[]` |
| Project Rationale | `projectRationaleHeading`, `projectRationale[]` (strings), `projectRationaleImage`, `projectRationaleVideo`, `projectRationaleVideoPoster` |
| Research Section Divider | `researchSectionTitle`, `researchSectionImage`, `researchSectionVideo`, `researchSectionVideoPoster` |
| Market Research | `marketResearchHeading`, `marketResearchContent` (text), `marketResearchVisual`, `marketResearchVisualVideo`, `marketResearchVisualVideoPoster` |
| Competitive Analysis | `competitiveAnalysisHeading`, `competitiveAnalysisIntro` (text), `competitors[]` → objects `{ competitorName, competitorType, competitorImage, competitorVideo, competitorVideoPoster, competitorPros[], competitorCons[] }` |
| Opportunities | `opportunitiesHeading`, `opportunitiesList[]` (strings), `opportunitiesImage`, `opportunitiesVideo`, `opportunitiesVideoPoster` |
| User Survey | `userSurveyHeading`, `userSurveyIntro` (text), `surveyCharts[]` (images), `surveyChartsVideo[]` (files — plural array despite singular-sounding name), `surveyChartsVideoPoster[]` (images) |
| Assumption Validation | `assumptionValidationHeading`, `assumptionValidation[]` (strings), `assumptionValidationImage`, `assumptionValidationVideo`, `assumptionValidationVideoPoster` |
| Key Insights | `keyInsightsHeading`, `keyInsights[]` (strings), `opportunityText` (text) |
| User Personas | `personasHeading`, `personasIntro` (text), `personas[]` (images), `personasVideo[]` (files), `personasVideoPoster[]` (images) |
| Problem Statement | `problemStatementHeading`, `problemStatement` (text) |
| Design Goals | `designGoalsHeading`, `designGoals[]` (strings) |
| Ideation Section Divider | `ideationSectionTitle`, `ideationSectionImage`, `ideationSectionVideo`, `ideationSectionVideoPoster` |
| User Flow | `userFlowHeading`, `userFlowDescription` (text), `userFlowDiagrams[]` (images), `userFlowDiagramsVideo[]` (files), `userFlowDiagramsVideoPoster[]` (images) |
| Information Architecture | `informationArchitectureHeading`, `informationArchitectureDescription` (text), `informationArchitectureImage`, `informationArchitectureVideo`, `informationArchitectureVideoPoster` |
| Wireframes | `wireframesHeading`, `wireframesDescription` (text), `wireframeImages[]`, `wireframeVideos[]`, `wireframeVideoPosters[]` |
| Visual Design Section Divider | `visualDesignSectionTitle`, `visualDesignSectionImage`, `visualDesignSectionVideo`, `visualDesignSectionVideoPoster` |
| Style Guide / Design System | `styleGuideHeading`, `styleGuideDescription` (text), `styleGuideImages[]`, `styleGuideVideos[]`, `styleGuideVideoPosters[]` |
| High Fidelity Designs | `highFidelityHeading`, `highFidelityIntro` (text), `keyScreensList[]` (strings), `highFidelityMockups[]` (images), `highFidelityMockupsVideo[]` (files), `highFidelityMockupsVideoPoster[]` (images) |
| Interactive Prototype | `prototypeHeading`, `prototypeDescription` (text), `prototypeImages[]`, `prototypeVideos[]`, `prototypeVideoPosters[]`, `prototypeNotes[]` (strings) |
| Prototype Validation / Usability Testing | `validationHeading`, `validationDescription` (text), `validationMethodology[]` (strings), `studyResultsHeading`, `studyResults[]` (strings), `studyResultsImage`, `studyResultsVideo`, `studyResultsVideoPoster`, `prototypeUpdateHeading`, `prototypeUpdates[]` (strings), `prototypeUpdatesImage`, `prototypeUpdatesVideo`, `prototypeUpdatesVideoPoster` |
| Accessibility Considerations | `accessibilityHeading`, `accessibilityConsiderations[]` (strings), `accessibilityMockup`, `accessibilityMockupVideo`, `accessibilityMockupVideoPoster` |
| Final Thoughts Section Divider | `finalThoughtsSectionHeading`, `finalThoughtsSectionImage`, `finalThoughtsSectionVideo`, `finalThoughtsSectionVideoPoster` |
| Final Thoughts / Results | `finalResultsHeading`, `finalResultsText` (text), `expectedOutcomes[]` (strings), `outcomesDisclaimer` (text, 2 rows), `keyLearningsHeading`, `keyLearnings[]` (strings), `keyLearningsImage`, `keyLearningsVideo`, `keyLearningsVideoPoster` |
| Future Improvements | `futureImprovementsHeading`, `futureImprovements[]` → objects `{ improvementTitle, improvementDescription }` |
| Closing Summary | `closingSummaryHeading`, `closingSummaryText` (text) |

---

### 3f. Category block: `"Logos & Branding"` (no field prefix)

**Note:** also unprefixed. Shares several field *names* with the UX Case Studies block
(`outcomesSectionHeading`, `mainOutcomeHeading`, `keyLearnHeading`, `whatWorkedHeading`, etc.) —
since both are conditionally hidden/projected, there's no runtime collision, but be aware when
flattening this schema into a different data model that identical field names carry different
meaning depending on `categoryName`. Only meaningful when `categoryName == "Logos & Branding"`.

| Section | Fields |
|---|---|
| Teaser | `teaserImages[]`, `teaserVideos[]`, `teaserVideoPosters[]` |
| Business Context | `businessContextHeading`, `businessContextContent` (text) |
| Problems Identified | `problemsIdentifiedHeading`, `problemsIdentified[]` (strings), `problemsIdentifiedImage`, `problemsIdentifiedVideo`, `problemsIdentifiedVideoPoster` |
| Design Objectives | `designObjectivesHeading`, `designObjectives[]` (strings), `designObjectivesImage`, `designObjectivesVideo`, `designObjectivesVideoPoster` |
| Design Approach | `designApproachHeading`, `discoveryStrategyHeading`, `discoveryStrategy` (text), `designApproachMethods[]` → objects `{ approachTitle, approachDescription }` |
| First Core Section | `firstCoreSectionHeading`, `firstCoreSectionText`, `firstCoreSectionList[]` (strings), `firstCoreLandscapeImages[]`, `firstCoreLandscapeVideos[]`, `firstCoreLandscapeVideoPosters[]`, `firstCorePortraitImages[]`, `firstCorePortraitVideos[]`, `firstCorePortraitVideoPosters[]` |
| Second Core Section | same shape as First Core, prefixed `secondCore*` |
| Third Core Section | same shape as First Core, prefixed `thirdCore*` |
| Outcomes | `outcomesSectionHeading`, `mainOutcomeHeading`, `mainOutcomeText`, `otherOutcomes[]` → objects `{ outcomeTitle, outcomeDescription }` |
| Key Learnings | `keyLearnHeading`, `keyLearnText`, `keyLearnList[]`, `keyLearnImage`, `keyLearnVideo`, `keyLearnVideoPoster` |
| What Worked | `whatWorkedHeading`, `whatWorkedText`, `whatWorkedList[]`, `whatWorkedImage`, `whatWorkedVideo`, `whatWorkedVideoPoster` |

The First/Second/Third Core sections exist because logo & branding case studies are typically
structured around 2–3 core deliverables (e.g. primary mark, secondary mark, brand applications),
each with its own landscape + portrait image/video sets.

---

## 4. `siteSettings`

A singleton document — the Studio desk (`sanity/structure.ts`) locks editors to a single
instance (`_id: 'siteSettings'`, no "duplicate"/"delete" actions, filtered out of the normal
create-new-document menu) since this content is site-wide, not a list of interchangeable records.

```
resumeUrl     url
experience    array of objects  { yearRange: string, title: string, company: string }
clients       array of objects  { name: string, logo: image (hotspot, required), websiteUrl?: url }
socialLinks   array of objects  { platform: string, url?: url, email?: email }
```

Notes for a consumer:
- `experience` order is editorial (array order in the Studio), not sorted by `yearRange` —
  render in array order, don't re-sort.
- `clients[].logo` is a real Sanity image asset (unlike the raster PNGs this repo used to hardcode
  in `/public/brandLogos/`) — resolve via `asset->url` same as any other image field.
- **Card Table Portfolio-specific:** this consumer does not fetch or render `clients[].websiteUrl`
  — its client card (`BrandCard.tsx`) is already a tap target for a name↔logo reveal toggle, with no
  slot for a second click-through action. Decided (2026-07-17) to leave the field unconsumed rather
  than redesign that interaction; the field is a candidate for deprecation from the schema.
- `socialLinks[].platform` is a free-text string (not an enum), matched against a small set of
  known values (`"Email"`, `"Linkedin"`, `"Twitter"`) by the frontend to map each to its own icon
  (`app/components/Footer/Footer.tsx`'s `socialIconsByPlatform`).
- `socialLinks[].url` vs `.email` is a **mutually-exclusive pair, not two independent fields**:
  each array item has exactly one populated, chosen by its own `platform` value. In the Studio,
  the `url` field is hidden and unvalidated when `platform === 'Email'`; the `email` field
  (Sanity's built-in `type: 'email'`, native format validation) is hidden and unvalidated
  otherwise. A consumer should read whichever of the two is present based on `platform`, not
  assume `url` is always populated. This exists because `type: 'url'` rejects a plain email
  address (no scheme) — see `FRONTEND_INTEGRATION.md`'s socialLinks section for the frontend's
  `mailto:` handling this enables.
- This is the first (and only) singleton in the schema — there's no generic
  "isSingleton" flag on the schema type itself; singleton-ness is enforced entirely in
  `sanity/structure.ts` and `sanity/sanity.config.ts` (`document.actions`, `schema.templates`),
  not in `siteSettingsType.ts`.

---

## 5. Cross-cutting patterns to know before building a consumer

**Image fields** (`type: 'image'`) always have `options: { hotspot: true }` — Sanity stores a
crop/hotspot region alongside the asset reference. If you fetch raw documents (not through GROQ
projections like this repo's `lib/queries.ts` does with `field.asset->url`), you'll get the full
Sanity image object (`{ _type: 'image', asset: { _ref, _type }, hotspot?, crop? }`), not a URL —
you must resolve `asset->url` yourself and decide whether to respect hotspot/crop.

**Video fields** (`type: 'file'`, `options: { accept: 'video/mp4,video/webm' }`) are plain file
assets, not Sanity's `mux.video` type — no built-in streaming/transcoding, just a direct
`asset->url` for an mp4/webm blob. Nearly every video field is paired with a `*VideoPoster` image
field for a fallback poster frame — these are two independent fields, not derived from the video.

**Array-of-object "item" patterns** repeat across several sections (e.g. `itemName` +
`itemPoints[]` + `itemImage` + `itemVideo` + `itemVideoPoster` in `webApp_designSectionItems`/
`webApp_devSectionItems`; `structureName`/`structurePoints[]`/... in `website_uxStructureItems`;
`buildItemName`/`buildItemPoints[]`/... in `website_websiteBuildItems`). As of
`sanity/OPTIMIZATION_CHECKLIST.md` item 5, `*Points` is now consistently `array of string`
everywhere this pattern appears (previously `webApp_devSectionItems.itemPoints` and
`website_websiteBuildItems.buildItemPoints` were `text` blocks — that drift is fixed; existing
content was migrated by wrapping each paragraph as a single-item array, so don't be surprised to
see 1-item arrays on older projects until an editor breaks them into real multi-item lists).
UX Case Studies' `competitors[]` and Logo Branding's `designApproachMethods[]` are NOT the same
pattern — they're genuine variants (a pros/cons split; a simpler title+description pair with no
image/video at all) and were intentionally left as-is.

**Shared field-group factories**: `webAppFields.ts`, `websiteFields.ts`, and
`logoBrandingFields.ts` build their teaser/outcomes/key-learnings/what-worked sections and the
item sub-object shape from shared factory functions in `sanity/schemaTypes/shared/fieldGroups.ts`
(`makeTeaserFields`, `makeOutcomesFields`, `makeKeyLearningsFields`, `makeWhatWorkedFields`,
`makeItemFields`) instead of hand-duplicated field arrays. `uxCaseStudyFields.ts` does not use
these factories — it has no equivalent sections for 3 of the 4 (outcomes, key-learnings, what-
worked; its own `keyLearnings`/`finalThoughts`/`closingSummary` structure is genuinely different),
and its `platformImages`/`platformVideos`/`platformVideoPosters` teaser-shaped triplet is a
different concept with different labels, so it's still hand-written. This only changes how the
schema is *authored*; every generated field name is identical to what existed before (verified
programmatically field-by-field before this shipped) — the query/render contract described in
this document is unaffected except for the two `itemPoints`-drift fields noted above.

**No `orderRank`/manual ordering field** on `project` — the homepage query
(`categoriesWithToolsQuery`) sorts categories by `_createdAt desc`; there's no explicit
project-level ordering field in the schema.

**Slugs are scoped per document, not globally unique across type** — `project.slug` and
`category.slug` are independent; the site's routing combines both (`/[category]/[project]`), and
`allProjectsQuery` filters on `slug.current == $project && category->slug.current == $category`
together as a compound key. `project.slug`'s custom `isUnique` (in `projectType.ts`) enforces this
compound key directly: it only rejects a slug if another project *in the same category* already
has it, and explicitly allows the same slug to be reused across different categories (matching what
the routing already treats as fine). If `category` isn't set yet on a new draft, the check is
skipped (`return true`) — there's nothing to scope against, and `category`'s own `Rule.required()`
blocks publishing regardless.
