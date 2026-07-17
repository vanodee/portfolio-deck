"use client";

import { useEffect } from "react";
import type { SiteSettingsData } from "@/lib/getSiteSettings";
import type { ToolChipData } from "@/data/types";
import { useTableStore } from "@/store/useTableStore";

// Threads the root layout's server-fetched siteSettings/tools data into the
// store once — same pattern as ProjectsHydrator, needed for the same reason:
// AboutContent/ControlDock are hoisted at the layout level, not nested under
// app/about/page.tsx, so props can't reach them via normal route-tree
// threading. Renders nothing. hydrateSiteSettings itself is guarded (no-op
// once already hydrated), so a Strict Mode double-fire is harmless.
export default function SiteSettingsHydrator({
  siteSettings,
  tools,
}: {
  siteSettings: SiteSettingsData;
  tools: ToolChipData[];
}) {
  const hydrateSiteSettings = useTableStore((s) => s.hydrateSiteSettings);

  useEffect(() => {
    hydrateSiteSettings({ ...siteSettings, tools });
  }, [siteSettings, tools, hydrateSiteSettings]);

  return null;
}
