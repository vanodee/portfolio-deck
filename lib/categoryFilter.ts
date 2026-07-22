import type { Project } from "@/data/types";

export interface CategoryRow {
  label: string;
  count: number;
  /** null = "All projects"; otherwise a Project["category"] value. */
  value: string | null;
}

// Client-side derivation over already-hydrated project data (no Sanity
// query of its own). "All projects" first, then every distinct category
// present in the data, alphabetical by title — there's no ordering field on
// either `category` or `project` in the schema (SCHEMA.md §5) to sort by
// instead.
export function deriveCategoryRows(projects: Project[]): CategoryRow[] {
  const counts = new Map<string, number>();
  for (const p of projects) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  const categoryRows = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([title, count]) => ({ label: title, count, value: title }));

  return [{ label: "All projects", count: projects.length, value: null }, ...categoryRows];
}
