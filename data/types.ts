// Mock project schema (PRD §5) — shaped like the eventual Sanity document
// so the Phase 2 CMS swap only touches data/projects.ts.

export interface CardBackStyle {
  traceColor: string;
  borderColor: string;
  bgColor: string;
}

export interface Project {
  id: string;
  title: string;
  category: string;
  date: string;
  /** Thumbnail path or URL; null → procedural placeholder art. */
  image: string | null;
  frontBg: string;
  isFlagship: boolean;
  back: CardBackStyle;
  /** Reading-view body copy (markdown-ish plain paragraphs for the prototype). */
  body: string[];
}

// Mock brand schema (Tables I've Played section) — shaped like the eventual
// CMS document so a future data-source swap only touches data/brands.ts.
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

// Mock experience-card schema (About Experience section) — shaped like the
// eventual CMS document so a future data-source swap only touches
// data/experience.ts. Spread is capped at 4 cards (most recent roles only —
// ExperienceCardSpread.tsx enforces the cap).
export interface ExperienceCardData {
  id: string;
  title: string;
  dateRange: string;
  company: string;
}

// Mock tool-chip schema (About "Chips up my sleeve" section) — shaped like
// the eventual CMS document so a future data-source swap only touches
// data/tools.ts. Distinct from Chip.tsx's own local (unexported) prop-typing
// interface of the same name — this one carries `id` for list-key/data-layer
// purposes; AboutContent.tsx maps individual fields into <Chip> rather than
// spreading the whole object.
export interface ToolChipData {
  id: string;
  name: string;
  logoSrc: string;
  logoAlt: string;
  color: string;
}
