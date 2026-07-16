"use client";

import { usePathname } from "next/navigation";

// Only two real routes exist ("/" and "/about") — anything else is the
// not-found tree (app/not-found.tsx), reached only via a hard/broken link,
// never via in-app navigation. Shared by PlayArea.tsx and ControlDock.tsx so
// both branch on the same definition instead of re-deriving it.
export function useIsNotFoundRoute(): boolean {
  const pathname = usePathname();
  return pathname !== "/" && pathname !== "/about";
}
