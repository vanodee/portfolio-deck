import { client } from "@/lib/sanity.client";
import { projectListingQuery, projectDetailQuery } from "@/lib/queries";
import { backFor } from "@/lib/cardBackStyle";
import type {
  Project,
  ProjectDetail,
  LiveLink,
  WebAppFields,
  WebsiteFields,
  UxCaseStudyFields,
  LogoBrandingFields,
} from "@/data/types";

const KNOWN_CATEGORIES = new Set<Project["category"]>([
  "Web Apps",
  "Websites",
  "UX Case Studies",
  "Logos & Branding",
]);

interface RawListingProject {
  _id: string;
  title: string;
  category: { title: string; slug: string } | null;
  previewImage: { url: string } | null;
  previewColor: string | null;
  projectColor: string | null;
  projectColorDark: string | null;
  ctaColor: string | null;
}

// Server-callable; deliberately no try/catch — the listing is load-bearing
// (no cards = no functional homepage), so a fetch failure throws and
// surfaces via app/global-error.tsx rather than degrading silently.
export async function getProjectListing(): Promise<Project[]> {
  const raw: RawListingProject[] = await client.fetch(
    projectListingQuery,
    {},
    { next: { tags: ["project", "category"] } },
  );

  return raw
    .filter((r) => {
      const ok = r.category && KNOWN_CATEGORIES.has(r.category.title as Project["category"]);
      if (!ok) {
        console.error(`[sanity] project "${r.title}" has an unrecognized category, skipping`, r.category);
      }
      return ok;
    })
    .map((r, i) => {
      // TODO(isFlagship): no real Sanity field yet — temporarily flags only
      // the first fetched project. Replace once isFlagship is wired up in
      // the other project's Sanity schema.
      const isFlagship = i === 0;
      return {
        id: r._id,
        title: r.title,
        category: r.category!.title as Project["category"],
        image: r.previewImage?.url ?? null,
        frontBg: r.previewColor ?? "#FFFFFF",
        projectColor: r.projectColor ?? "#FFFFFF",
        projectColorDark: r.projectColorDark ?? "#FFFFFF",
        ctaColor: r.ctaColor ?? "#FFFFFF",
        isFlagship,
        back: backFor(isFlagship),
      } as Project;
    });
}

// Shared fields, plus whichever category-specific block the query's
// conditional projection matched — the raw fetch result is a flat merge
// (GROQ's `condition => {...}` splices the matched block's keys directly
// into the parent object), so category-specific fields simply won't exist
// as keys when they don't apply. Typed loosely here on purpose: 4 full raw
// interfaces mirroring WebAppFields/WebsiteFields/UxCaseStudyFields/
// LogoBrandingFields would just duplicate those types field-for-field.
interface RawDetailProject {
  heroSubheading: string | null;
  heroDescription: string | null;
  heroImage: { url: string } | null;
  projectTags: string[] | null;
  quickStats: { title: string; value: string }[] | null;
  tools: { title: string; icon: string | null; color: string }[] | null;
  liveLinks: LiveLink[] | null;
  closingImage: { url: string } | null;
  [categoryField: string]: unknown;
}

// Client-callable — triggered lazily when a card opens (OpenCardOverlay).
// Catches its own errors: a single project's detail failing to load is
// low-stakes (the grid/cards already work), so this degrades to an in-pane
// message rather than throwing to the global error boundary.
export async function getProjectDetail(
  id: string,
  category: Project["category"],
): Promise<ProjectDetail> {
  const raw: RawDetailProject | null = await client.fetch(projectDetailQuery, { id, category });
  const base = {
    heroSubheading: raw?.heroSubheading ?? "",
    heroDescription: raw?.heroDescription ?? "",
    heroImage: raw?.heroImage?.url ?? null,
    projectTags: raw?.projectTags ?? [],
    quickStats: raw?.quickStats ?? [],
    tools: raw?.tools ?? [],
    liveLinks: raw?.liveLinks ?? [],
    closingImage: raw?.closingImage?.url ?? null,
  };

  // raw spreads FIRST — base's already-extracted values (heroImage/
  // closingImage as plain strings, not the raw {url} objects raw itself
  // carries under those same keys) must win, or the category spread
  // silently clobbers them back to the wrong shape.
  switch (category) {
    case "Web Apps":
      return { ...(raw as unknown as WebAppFields), ...base, category };
    case "Websites":
      return { ...(raw as unknown as WebsiteFields), ...base, category };
    case "UX Case Studies":
      return { ...(raw as unknown as UxCaseStudyFields), ...base, category };
    case "Logos & Branding":
      return { ...(raw as unknown as LogoBrandingFields), ...base, category };
  }
}
