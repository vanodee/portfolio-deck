import { client } from "@/lib/sanity.client";
import { siteSettingsQuery, featuredToolsQuery } from "@/lib/queries";
import type { Brand, ExperienceCardData, SocialLink, ToolChipData } from "@/data/types";

interface RawSiteSettings {
  resumeUrl: string | null;
  experience: { _key: string; yearRange: string; title: string; company: string }[] | null;
  clients: { _key: string; name: string; logoUrl: string | null }[] | null;
  socialLinks: SocialLink[] | null;
}

export interface SiteSettingsData {
  resumeUrl: string;
  socialLinks: SocialLink[];
  experience: ExperienceCardData[];
  clients: Brand[];
}

const EMPTY_SITE_SETTINGS: SiteSettingsData = {
  resumeUrl: "#",
  socialLinks: [],
  experience: [],
  clients: [],
};

// ControlDock (every route) and AboutContent both depend on this — unlike
// getProjectListing() (throws by design, no cards = no functional homepage),
// a failure here must not be able to take the whole site down. Degrades to
// empty/placeholder values instead, same catch-own-errors philosophy as
// getProjectDetail.
export async function getSiteSettings(): Promise<SiteSettingsData> {
  try {
    const raw: RawSiteSettings | null = await client.fetch(
      siteSettingsQuery,
      {},
      { next: { tags: ["siteSettings"] } },
    );
    if (!raw) return EMPTY_SITE_SETTINGS;

    return {
      resumeUrl: raw.resumeUrl ?? "#",
      socialLinks: raw.socialLinks ?? [],
      experience: (raw.experience ?? []).map((e) => ({
        id: e._key,
        title: e.title,
        yearRange: e.yearRange,
        company: e.company,
      })),
      // Brand has no logoAlt field — BrandCard.tsx's <img> is decorative
      // (alt=""), the name is already the button's accessible label.
      clients: (raw.clients ?? [])
        .filter((c) => c.logoUrl)
        .map((c) => ({
          id: c._key,
          name: c.name,
          logoSrc: c.logoUrl as string,
        })),
    };
  } catch (err) {
    console.error("[sanity] siteSettings fetch failed", err);
    return EMPTY_SITE_SETTINGS;
  }
}

interface RawTool {
  _id: string;
  title: string;
  logoUrl: string | null;
  logoAlt: string | null;
  color: string | null;
}

export async function getFeaturedTools(): Promise<ToolChipData[]> {
  try {
    const raw: RawTool[] = await client.fetch(
      featuredToolsQuery,
      {},
      { next: { tags: ["tools"] } },
    );
    return raw
      .filter((t) => t.logoUrl)
      .map((t) => ({
        id: t._id,
        name: t.title,
        logoSrc: t.logoUrl as string,
        logoAlt: t.logoAlt ?? t.title,
        color: t.color ?? "#FFFFFF",
      }));
  } catch (err) {
    console.error("[sanity] featured tools fetch failed", err);
    return [];
  }
}
