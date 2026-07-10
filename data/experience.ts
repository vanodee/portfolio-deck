import type { ExperienceCardData } from "./types";

// Placeholder roles (Experience section), most recent first — capped at 4
// (older history lives on the resume, not this spread). First entry reuses
// the Figma mock copy verbatim; the rest are invented placeholders.
export const EXPERIENCE: ExperienceCardData[] = [
  {
    id: "exp-1",
    title: "Sr. Product Designer",
    dateRange: "2025 - Present",
    company: "Pretzl (via Peanut Technologies)",
  },
  {
    id: "exp-2",
    title: "Product Designer",
    dateRange: "2023 - 2025",
    company: "Nordvale",
  },
  {
    id: "exp-3",
    title: "UX Designer",
    dateRange: "2021 - 2023",
    company: "Kestrel & Finch Studio",
  },
  {
    id: "exp-4",
    title: "Junior Designer",
    dateRange: "2019 - 2021",
    company: "Iron Quill",
  },
];
