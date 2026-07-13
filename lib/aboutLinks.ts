// Placeholder contact/profile destinations for the About dock buttons
// (ControlDock.tsx's !onHome branch). Centralized here, not inlined, so
// they're a one-file swap once real values exist. Resume has no real
// destination yet — no PDF exists anywhere in public/ — so it's "#" like
// LinkedIn/X until one is added; switch it to a real /resume.pdf path
// (with a `download` attribute on the button) at that point.
export const ABOUT_LINKS = {
  email: "mailto:hello@example.com",
  linkedin: "#",
  twitter: "#",
  resume: "#",
} as const;
