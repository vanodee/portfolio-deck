"use client";

import { useEffect } from "react";
import type { Project } from "@/data/types";
import { useTableStore } from "@/store/useTableStore";

// Threads the root layout's server-fetched listing into the store once.
// Renders nothing — a pure hydration side effect. hydrateProjects itself is
// guarded (no-op once cardOrder is populated), so a Strict Mode double-fire
// of this effect is harmless.
export default function ProjectsHydrator({ projects }: { projects: Project[] }) {
  const hydrateProjects = useTableStore((s) => s.hydrateProjects);

  useEffect(() => {
    hydrateProjects(projects);
  }, [projects, hydrateProjects]);

  return null;
}
