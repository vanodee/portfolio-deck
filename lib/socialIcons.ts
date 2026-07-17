import type { SocialLink } from "@/data/types";

// siteSettings.socialLinks[].platform is free-text in the schema, not an
// enum (SCHEMA.md) — matched against this known set, with a generic fallback
// for anything else so an unrecognized platform added later in the Studio
// still renders a button instead of silently dropping. "Twitter" -> label
// "X" intentionally (matches this dock's existing copy, not the platform
// string verbatim).
interface SocialPlatformMeta {
  icon: string;
  label: string;
}

const SOCIAL_PLATFORM_META: Record<string, SocialPlatformMeta> = {
  Email: { icon: "/assets/icons/email.svg", label: "Email" },
  Linkedin: { icon: "/assets/icons/linkedin.svg", label: "LinkedIn" },
  Twitter: { icon: "/assets/icons/twitter.svg", label: "X" },
};

const DEFAULT_SOCIAL_META: SocialPlatformMeta = {
  icon: "/assets/icons/email.svg",
  label: "Link",
};

export function socialPlatformMeta(platform: string): SocialPlatformMeta {
  return SOCIAL_PLATFORM_META[platform] ?? DEFAULT_SOCIAL_META;
}

// Email links use mailto:; every other platform uses its url field —
// mirrors the reference site's platform === 'Email' ? mailto : url branch
// (FRONTEND_INTEGRATION.md).
export function socialLinkHref(link: SocialLink): string {
  if (link.platform === "Email") return link.email ? `mailto:${link.email}` : "#";
  return link.url ?? "#";
}
