// Project schema (PRD §5), sourced live from Sanity (lib/getProjects.ts) —
// no mock data file exists anymore as of the Phase 5 CMS integration.

export interface CardBackStyle {
  traceColor: string;
  borderColor: string;
  bgColor: string;
}

// Category-specific field blocks (SCHEMA.md §3c–3f), Phase 7. Flat field
// names matching Sanity's actual document shape verbatim (not regrouped by
// section) — the reference itself types everything `any` with no shared
// types at all; regrouping into nested per-section objects would roughly
// double this file for marginal readability gain. Section grouping happens
// in each category body's render JSX instead.

// §3c — Web Apps (prefix webApp_)
interface WebAppSectionItem {
  itemName: string;
  itemPoints: string[];
  itemImage?: string | null;
  itemVideo?: string | null;
  itemVideoPoster?: string | null;
}
export interface WebAppFields {
  // Teaser
  webApp_teaserImages?: string[];
  webApp_teaserVideos?: string[];
  webApp_teaserVideoPosters?: string[];
  // Product Context
  webApp_productContextHeading?: string;
  webApp_productContext?: string;
  webApp_productContextImage?: string | null;
  webApp_productContextVideo?: string | null;
  webApp_productContextVideoPoster?: string | null;
  // Problems & Goals
  webApp_probGoals?: { probGoalName: string; probGoalList: string[] }[];
  // Discovery Strategy
  webApp_productStratHeading?: string;
  webApp_productStratContent?: string;
  // UX Hypothesis
  webApp_uxHypothesisHeading?: string;
  webApp_uxHypothesis?: string[];
  webApp_uxHypothesisImage?: string | null;
  webApp_uxHypothesisVideo?: string | null;
  webApp_uxHypothesisVideoPoster?: string | null;
  webApp_initialDesignImages?: string[];
  webApp_initialDesignVideos?: string[];
  webApp_initialDesignVideoPosters?: string[];
  // Project Scope
  webApp_prodScopeHeading?: string;
  webApp_prodScope?: string;
  webApp_prodScopeItems?: { itemTitle: string; itemRationale: string }[];
  // Design Section
  webApp_designSectionHeading?: string;
  webApp_designSectionText?: string;
  webApp_designSectionImages?: string[];
  webApp_designSectionVideos?: string[];
  webApp_designSectionVideoPosters?: string[];
  webApp_designSectionItems?: WebAppSectionItem[];
  // Developer Section
  webApp_devSectionHeading?: string;
  webApp_devSectionText?: string;
  webApp_devSectionItems?: WebAppSectionItem[];
  // Finished Product
  webApp_finishedProdHeading?: string;
  webApp_finishedProdText?: string;
  webApp_finishedProdImages?: string[];
  webApp_finishedProdVideos?: string[];
  webApp_finishedProdVideoPosters?: string[];
  // Outcomes
  webApp_outcomesSectionHeading?: string;
  webApp_mainOutcomeHeading?: string;
  webApp_mainOutcomeText?: string;
  webApp_otherOutcomes?: { outcomeTitle: string; outcomeDescription: string }[];
  // Key Learnings
  webApp_keyLearnHeading?: string;
  webApp_keyLearnText?: string;
  webApp_keyLearnList?: string[];
  webApp_keyLearnImage?: string | null;
  webApp_keyLearnVideo?: string | null;
  webApp_keyLearnVideoPoster?: string | null;
  // What Worked
  webApp_whatWorkedHeading?: string;
  webApp_whatWorkedText?: string;
  webApp_whatWorkedList?: string[];
  webApp_whatWorkedImage?: string | null;
  webApp_whatWorkedVideo?: string | null;
  webApp_whatWorkedVideoPoster?: string | null;
}

// §3d — Websites (prefix website_)
interface WebsiteStructureItem {
  structureName: string;
  structurePoints: string[];
  structureImage?: string | null;
  structureVideo?: string | null;
  structureVideoPoster?: string | null;
}
interface WebsiteBuildItem {
  buildItemName: string;
  buildItemPoints: string[];
  buildItemImage?: string | null;
  buildItemVideo?: string | null;
  buildItemVideoPoster?: string | null;
}
export interface WebsiteFields {
  // Teaser
  website_teaserImages?: string[];
  website_teaserVideos?: string[];
  website_teaserVideoPosters?: string[];
  // Business Context
  website_businessContextHeading?: string;
  website_businessContextContent?: string;
  // Problems Identified
  website_problemsIdentifiedHeading?: string;
  website_problemsIdentified?: string[];
  website_problemsIdentifiedImage?: string | null;
  website_problemsIdentifiedVideo?: string | null;
  website_problemsIdentifiedVideoPoster?: string | null;
  // Design Objectives
  website_designObjectivesHeading?: string;
  website_designObjectives?: string[];
  website_designObjectivesImage?: string | null;
  website_designObjectivesVideo?: string | null;
  website_designObjectivesVideoPoster?: string | null;
  // Market Context
  website_marketContextHeading?: string;
  website_marketContext?: string;
  website_targetAudienceHeading?: string;
  website_targetAudience?: { member: string; rationale: string }[];
  // Information Architecture
  website_informationArcHeading?: string;
  website_informationArcText?: string;
  website_informationArcImages?: string[];
  website_informationArcVideos?: string[];
  website_informationArcVideoPosters?: string[];
  // UX Structure & Planning
  website_uxStructureHeading?: string;
  website_uxStructureText?: string;
  website_uxStructureItems?: WebsiteStructureItem[];
  // Visual Design
  website_visualDesignHeading?: string;
  website_visualDesignText?: string;
  website_visualDesignImages?: string[];
  website_visualDesignVideos?: string[];
  website_visualDesignVideoPosters?: string[];
  // Website Build & Implementation
  website_websiteBuildHeading?: string;
  website_websiteBuildText?: string;
  website_websiteBuildItems?: WebsiteBuildItem[];
  website_websiteBuildImages?: string[];
  website_websiteBuildVideos?: string[];
  website_websiteBuildVideoPosters?: string[];
  // Accessibility
  website_accessibilityHeading?: string;
  website_accessibilityText?: string[];
  website_accessibilityImages?: string[];
  website_accessibilityVideos?: string[];
  website_accessibilityVideoPosters?: string[];
  // Pre-Launch
  website_preLaunchHeading?: string;
  website_preLaunchChecks?: string[];
  website_preLaunchImage?: string | null;
  website_preLaunchVideo?: string | null;
  website_preLaunchVideoPoster?: string | null;
  // Outcomes
  website_outcomesSectionHeading?: string;
  website_mainOutcomeHeading?: string;
  website_mainOutcomeText?: string;
  website_otherOutcomes?: { outcomeTitle: string; outcomeDescription: string }[];
  // Key Learnings
  website_keyLearnHeading?: string;
  website_keyLearnText?: string;
  website_keyLearnList?: string[];
  website_keyLearnImage?: string | null;
  website_keyLearnVideo?: string | null;
  website_keyLearnVideoPoster?: string | null;
  // What Worked
  website_whatWorkedHeading?: string;
  website_whatWorkedText?: string;
  website_whatWorkedList?: string[];
  website_whatWorkedImage?: string | null;
  website_whatWorkedVideo?: string | null;
  website_whatWorkedVideoPoster?: string | null;
}

// §3e — UX Case Studies (no prefix — the largest, most granular block).
// Field names overlap in *convention* with Logos & Branding (Heading/Text/
// List/Image/Video/VideoPoster suffixes) but are disjoint at the data level
// — a UX Case Study document has no Branding fields and vice versa. Kept
// fully separate here, no shared interface, per the checklist's own
// instruction.
interface UxCompetitor {
  competitorName: string;
  competitorType: string;
  competitorImage?: string | null;
  competitorVideo?: string | null;
  competitorVideoPoster?: string | null;
  competitorPros: string[];
  competitorCons: string[];
}
export interface UxCaseStudyFields {
  // Platform Display
  platformImages?: string[];
  platformVideos?: string[];
  platformVideoPosters?: string[];
  // Project Rationale
  projectRationaleHeading?: string;
  projectRationale?: string[];
  projectRationaleImage?: string | null;
  projectRationaleVideo?: string | null;
  projectRationaleVideoPoster?: string | null;
  // Research Section Divider
  researchSectionTitle?: string;
  researchSectionImage?: string | null;
  researchSectionVideo?: string | null;
  researchSectionVideoPoster?: string | null;
  // Market Research
  marketResearchHeading?: string;
  marketResearchContent?: string;
  marketResearchVisual?: string | null;
  marketResearchVisualVideo?: string | null;
  marketResearchVisualVideoPoster?: string | null;
  // Competitive Analysis
  competitiveAnalysisHeading?: string;
  competitiveAnalysisIntro?: string;
  competitors?: UxCompetitor[];
  // Opportunities
  opportunitiesHeading?: string;
  opportunitiesList?: string[];
  opportunitiesImage?: string | null;
  opportunitiesVideo?: string | null;
  opportunitiesVideoPoster?: string | null;
  // User Survey
  userSurveyHeading?: string;
  userSurveyIntro?: string;
  surveyCharts?: string[];
  surveyChartsVideo?: string[];
  surveyChartsVideoPoster?: string[];
  // Assumption Validation
  assumptionValidationHeading?: string;
  assumptionValidation?: string[];
  assumptionValidationImage?: string | null;
  assumptionValidationVideo?: string | null;
  assumptionValidationVideoPoster?: string | null;
  // Key Insights
  keyInsightsHeading?: string;
  keyInsights?: string[];
  opportunityText?: string;
  // User Personas
  personasHeading?: string;
  personasIntro?: string;
  personas?: string[];
  personasVideo?: string[];
  personasVideoPoster?: string[];
  // Problem Statement
  problemStatementHeading?: string;
  problemStatement?: string;
  // Design Goals
  designGoalsHeading?: string;
  designGoals?: string[];
  // Ideation Section Divider
  ideationSectionTitle?: string;
  ideationSectionImage?: string | null;
  ideationSectionVideo?: string | null;
  ideationSectionVideoPoster?: string | null;
  // User Flow
  userFlowHeading?: string;
  userFlowDescription?: string;
  userFlowDiagrams?: string[];
  userFlowDiagramsVideo?: string[];
  userFlowDiagramsVideoPoster?: string[];
  // Information Architecture
  informationArchitectureHeading?: string;
  informationArchitectureDescription?: string;
  informationArchitectureImage?: string | null;
  informationArchitectureVideo?: string | null;
  informationArchitectureVideoPoster?: string | null;
  // Wireframes
  wireframesHeading?: string;
  wireframesDescription?: string;
  wireframeImages?: string[];
  wireframeVideos?: string[];
  wireframeVideoPosters?: string[];
  // Visual Design Section Divider
  visualDesignSectionTitle?: string;
  visualDesignSectionImage?: string | null;
  visualDesignSectionVideo?: string | null;
  visualDesignSectionVideoPoster?: string | null;
  // Style Guide / Design System
  styleGuideHeading?: string;
  styleGuideDescription?: string;
  styleGuideImages?: string[];
  styleGuideVideos?: string[];
  styleGuideVideoPosters?: string[];
  // High Fidelity Designs
  highFidelityHeading?: string;
  highFidelityIntro?: string;
  keyScreensList?: string[];
  highFidelityMockups?: string[];
  highFidelityMockupsVideo?: string[];
  highFidelityMockupsVideoPoster?: string[];
  // Interactive Prototype
  prototypeHeading?: string;
  prototypeDescription?: string;
  prototypeImages?: string[];
  prototypeVideos?: string[];
  prototypeVideoPosters?: string[];
  prototypeNotes?: string[];
  // Prototype Validation / Usability Testing
  validationHeading?: string;
  validationDescription?: string;
  validationMethodology?: string[];
  studyResultsHeading?: string;
  studyResults?: string[];
  studyResultsImage?: string | null;
  studyResultsVideo?: string | null;
  studyResultsVideoPoster?: string | null;
  prototypeUpdateHeading?: string;
  prototypeUpdates?: string[];
  prototypeUpdatesImage?: string | null;
  prototypeUpdatesVideo?: string | null;
  prototypeUpdatesVideoPoster?: string | null;
  // Accessibility Considerations
  accessibilityHeading?: string;
  accessibilityConsiderations?: string[];
  accessibilityMockup?: string | null;
  accessibilityMockupVideo?: string | null;
  accessibilityMockupVideoPoster?: string | null;
  // Final Thoughts Section Divider
  finalThoughtsSectionHeading?: string;
  finalThoughtsSectionImage?: string | null;
  finalThoughtsSectionVideo?: string | null;
  finalThoughtsSectionVideoPoster?: string | null;
  // Final Thoughts / Results
  finalResultsHeading?: string;
  finalResultsText?: string;
  expectedOutcomes?: string[];
  outcomesDisclaimer?: string;
  keyLearningsHeading?: string;
  keyLearnings?: string[];
  keyLearningsImage?: string | null;
  keyLearningsVideo?: string | null;
  keyLearningsVideoPoster?: string | null;
  // Future Improvements
  futureImprovementsHeading?: string;
  futureImprovements?: { improvementTitle: string; improvementDescription: string }[];
  // Closing Summary
  closingSummaryHeading?: string;
  closingSummaryText?: string;
}

// §3f — Logos & Branding (no prefix). Second/Third Core Sections mirror
// First Core's shape verbatim, just with secondCore*/thirdCore* prefixes —
// written out explicitly (not a mapped/template-literal type) since three
// known, fixed prefixes are clearer spelled out than genericized.
export interface LogoBrandingFields {
  // Teaser
  teaserImages?: string[];
  teaserVideos?: string[];
  teaserVideoPosters?: string[];
  // Business Context
  businessContextHeading?: string;
  businessContextContent?: string;
  // Problems Identified
  problemsIdentifiedHeading?: string;
  problemsIdentified?: string[];
  problemsIdentifiedImage?: string | null;
  problemsIdentifiedVideo?: string | null;
  problemsIdentifiedVideoPoster?: string | null;
  // Design Objectives
  designObjectivesHeading?: string;
  designObjectives?: string[];
  designObjectivesImage?: string | null;
  designObjectivesVideo?: string | null;
  designObjectivesVideoPoster?: string | null;
  // Design Approach
  designApproachHeading?: string;
  discoveryStrategyHeading?: string;
  discoveryStrategy?: string;
  designApproachMethods?: { approachTitle: string; approachDescription: string }[];
  // First Core Section
  firstCoreSectionHeading?: string;
  firstCoreSectionText?: string;
  firstCoreSectionList?: string[];
  firstCoreLandscapeImages?: string[];
  firstCoreLandscapeVideos?: string[];
  firstCoreLandscapeVideoPosters?: string[];
  firstCorePortraitImages?: string[];
  firstCorePortraitVideos?: string[];
  firstCorePortraitVideoPosters?: string[];
  // Second Core Section
  secondCoreSectionHeading?: string;
  secondCoreSectionText?: string;
  secondCoreSectionList?: string[];
  secondCoreLandscapeImages?: string[];
  secondCoreLandscapeVideos?: string[];
  secondCoreLandscapeVideoPosters?: string[];
  secondCorePortraitImages?: string[];
  secondCorePortraitVideos?: string[];
  secondCorePortraitVideoPosters?: string[];
  // Third Core Section
  thirdCoreSectionHeading?: string;
  thirdCoreSectionText?: string;
  thirdCoreSectionList?: string[];
  thirdCoreLandscapeImages?: string[];
  thirdCoreLandscapeVideos?: string[];
  thirdCoreLandscapeVideoPosters?: string[];
  thirdCorePortraitImages?: string[];
  thirdCorePortraitVideos?: string[];
  thirdCorePortraitVideoPosters?: string[];
  // Outcomes
  outcomesSectionHeading?: string;
  mainOutcomeHeading?: string;
  mainOutcomeText?: string;
  otherOutcomes?: { outcomeTitle: string; outcomeDescription: string }[];
  // Key Learnings
  keyLearnHeading?: string;
  keyLearnText?: string;
  keyLearnList?: string[];
  keyLearnImage?: string | null;
  keyLearnVideo?: string | null;
  keyLearnVideoPoster?: string | null;
  // What Worked
  whatWorkedHeading?: string;
  whatWorkedText?: string;
  whatWorkedList?: string[];
  whatWorkedImage?: string | null;
  whatWorkedVideo?: string | null;
  whatWorkedVideoPoster?: string | null;
}

interface ProjectBase {
  id: string;
  title: string;
  /** Thumbnail path or URL; null → procedural placeholder art. */
  image: string | null;
  frontBg: string;
  /** Reading-pane per-project theming (Phase 6) — fetched eagerly at listing
   * time (like frontBg/previewColor) rather than the lazy detail fetch, so
   * the pane's colors are present the instant it opens, no color-pop. */
  projectColor: string;
  projectColorDark: string;
  ctaColor: string;
  /** TODO(isFlagship): no real Sanity field exists yet — lib/getProjects.ts
   * temporarily flags just the first fetched project. Replace once a real
   * field is wired up in the other project's schema. */
  isFlagship: boolean;
  back: CardBackStyle;
}

// Discriminated union keyed by category, mirroring SCHEMA.md §3c–3f's four
// field blocks (`category->title`'s 4 real values).
export type Project =
  | (ProjectBase & { category: "Web Apps" } & Partial<WebAppFields>)
  | (ProjectBase & { category: "Websites" } & Partial<WebsiteFields>)
  | (ProjectBase & { category: "UX Case Studies" } & Partial<UxCaseStudyFields>)
  | (ProjectBase & { category: "Logos & Branding" } & Partial<LogoBrandingFields>);

export interface LiveLink {
  text: string;
  subText?: string;
  ctaIcon: "desktop" | "mobile" | "responsive";
  url: string;
}

// Reading-pane detail — lazily fetched on card open (lib/getProjects.ts's
// getProjectDetail), not part of the Project union. heroHeading isn't here:
// its fallback-to-title is resolved against the already-available
// listing-level Project.title, not re-fetched. Discriminated union keyed by
// category (mirroring Project) so each category body component can narrow
// to its own field block via detail.category.
interface ProjectDetailBase {
  heroSubheading: string;
  heroDescription: string;
  heroImage: string | null;
  projectTags: string[];
  quickStats: { title: string; value: string }[];
  tools: { title: string; icon: string | null; color: string }[];
  liveLinks: LiveLink[];
  closingImage: string | null;
}

export type ProjectDetail =
  | (ProjectDetailBase & { category: "Web Apps" } & WebAppFields)
  | (ProjectDetailBase & { category: "Websites" } & WebsiteFields)
  | (ProjectDetailBase & { category: "UX Case Studies" } & UxCaseStudyFields)
  | (ProjectDetailBase & { category: "Logos & Branding" } & LogoBrandingFields);

// Client/brand schema (Tables I've Played section) — sourced live from
// siteSettings.clients[] (lib/getSiteSettings.ts). No `websiteUrl`: the
// schema field exists but is intentionally unconsumed here (see Phase 10
// notes in public/cms/INTEGRATION_CHECKLIST.md).
export interface Brand {
  id: string;
  name: string;
  logoSrc: string;
}

// Mock photo-card schema (About Hero section) — shaped like the eventual
// CMS document so a future data-source swap only touches data/photos.ts.
// Spread is capped at 3 cards (PhotoCardSpread.tsx enforces the cap).
export interface PhotoCardData {
  id: string;
  image: string;
  name: string;
  subtitle: string;
}

// Experience-card schema (About "The Run" section) — sourced live from
// siteSettings.experience[] (lib/getSiteSettings.ts). Spread is capped at 4
// cards (most recent roles only — ExperienceCardSpread.tsx enforces the cap).
export interface ExperienceCardData {
  id: string;
  title: string;
  yearRange: string;
  company: string;
}

// siteSettings.socialLinks[] (SCHEMA.md) — platform is free-text, matched
// against lib/socialIcons.ts's known set with a generic fallback for any
// other value. url/email are mutually exclusive in practice: Email links
// carry `email`, every other platform carries `url`.
export interface SocialLink {
  platform: string;
  url?: string | null;
  email?: string | null;
}

// Tool-chip schema (About "Chips up my sleeve" section) — sourced live from
// the `tools` collection, filtered isFeatured==true (lib/getSiteSettings.ts).
// Distinct from Chip.tsx's own local (unexported) prop-typing interface of
// the same name — this one carries `id` for list-key/data-layer purposes;
// AboutContent.tsx maps individual fields into <Chip> rather than spreading
// the whole object.
export interface ToolChipData {
  id: string;
  name: string;
  logoSrc: string;
  logoAlt: string;
  color: string;
}
