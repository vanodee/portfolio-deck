export type LiveLinkCtaIcon = "desktop" | "mobile" | "responsive";

// This repo's asset path (public/assets/icons/), not the reference site's
// bare-root path (/desktopLinkIcon.svg etc.).
export function liveLinkIconSrc(ctaIcon: LiveLinkCtaIcon): string {
  return `/assets/icons/${ctaIcon}LinkIcon.svg`;
}
