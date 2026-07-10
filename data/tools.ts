import type { ToolChipData } from "./types";

// Placeholder tools (About "Chips up my sleeve" section). Only one real logo
// asset exists in the repo (public/assets/icons/Typescript.png) — every
// entry below intentionally reuses it as `logoSrc` (confirmed choice: keep
// this pass structure-only, no per-tool logo sourcing), varying `name` /
// `logoAlt` / `color` so the grid still reads as distinct chips.
const DEMO_LOGO = "/assets/icons/Typescript.png";

export const TOOLS: ToolChipData[] = [
  { id: "figma", name: "Figma", logoSrc: DEMO_LOGO, logoAlt: "Figma", color: "#A259FF" },
  { id: "photoshop", name: "Photoshop", logoSrc: DEMO_LOGO, logoAlt: "Photoshop", color: "#31A8FF" },
  { id: "illustrator", name: "Illustrator", logoSrc: DEMO_LOGO, logoAlt: "Illustrator", color: "#FF9A00" },
  { id: "after-effects", name: "After Effects", logoSrc: DEMO_LOGO, logoAlt: "After Effects", color: "#9999FF" },
  { id: "notion", name: "Notion", logoSrc: DEMO_LOGO, logoAlt: "Notion", color: "#4B4B4B" },
  { id: "typescript", name: "TypeScript", logoSrc: DEMO_LOGO, logoAlt: "TypeScript", color: "#3178C6" },
  { id: "javascript", name: "JavaScript", logoSrc: DEMO_LOGO, logoAlt: "JavaScript", color: "#C9A400" },
  { id: "vscode", name: "VS Code", logoSrc: DEMO_LOGO, logoAlt: "VS Code", color: "#007ACC" },
  { id: "sketch", name: "Sketch", logoSrc: DEMO_LOGO, logoAlt: "Sketch", color: "#F7B500" },
  { id: "wordpress", name: "WordPress", logoSrc: DEMO_LOGO, logoAlt: "WordPress", color: "#21759B" },
  { id: "slack", name: "Slack", logoSrc: DEMO_LOGO, logoAlt: "Slack", color: "#4A154B" },
  { id: "framer", name: "Framer", logoSrc: DEMO_LOGO, logoAlt: "Framer", color: "#0055FF" },
  { id: "webflow", name: "Webflow", logoSrc: DEMO_LOGO, logoAlt: "Webflow", color: "#4353FF" },
  { id: "trello", name: "Trello", logoSrc: DEMO_LOGO, logoAlt: "Trello", color: "#0079BF" },
  { id: "miro", name: "Miro", logoSrc: DEMO_LOGO, logoAlt: "Miro", color: "#C9A400" },
  { id: "linear", name: "Linear", logoSrc: DEMO_LOGO, logoAlt: "Linear", color: "#5E6AD2" },
  { id: "whimsical", name: "Whimsical", logoSrc: DEMO_LOGO, logoAlt: "Whimsical", color: "#FF6B6B" },
  { id: "github", name: "GitHub", logoSrc: DEMO_LOGO, logoAlt: "GitHub", color: "#6E5494" },
  { id: "zeplin", name: "Zeplin", logoSrc: DEMO_LOGO, logoAlt: "Zeplin", color: "#E0A526" },
];
