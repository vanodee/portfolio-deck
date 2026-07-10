import type { PhotoCardData } from "./types";

// Placeholder photos (Hero section) — only two real placeholder images were
// provided (public/assets/photo1.png, photo2.png), so this seeds 2 entries
// rather than padding to the 3-card cap with a duplicate. PhotoCardSpread.tsx
// still enforces the cap for whenever a 3rd real photo is added.
export const PHOTOS: PhotoCardData[] = [
  {
    id: "photo-1",
    image: "/assets/photo1.png",
    name: "Stevano Peters",
    subtitle: "THE DESIGNER • DEALER'S CHOICE",
  },
  {
    id: "photo-2",
    image: "/assets/photo2.png",
    name: "Stevano Peters",
    subtitle: "THE BUILDER • AI-FLUENT",
  },
];
