import { useMemo } from "react";
import { deriveCategoryRows, type CategoryRow } from "@/lib/categoryFilter";
import { useTableStore } from "@/store/useTableStore";

interface UseCategoryFilterResult {
  rows: CategoryRow[];
  activeCategory: string | null;
  categoryMenuOpen: boolean;
  /** Count for the currently active row (total, when no filter is set). */
  count: number;
  toggleCategoryMenu: () => void;
  closeCategoryMenu: () => void;
  /** Selecting the already-active row is a no-op selection that still
   * dismisses the menu. */
  handleSelect: (value: string | null) => void;
}

// Single source of truth for both CategoryFilterButton and
// CategoryFilterMenu, so the derived row list and active-row count never
// drift out of sync between the two. `projects` only ever changes identity
// once (hydrateProjects), so this useMemo effectively runs once per session.
export function useCategoryFilter(): UseCategoryFilterResult {
  const projects = useTableStore((s) => s.projects);
  const activeCategory = useTableStore((s) => s.activeCategory);
  const categoryMenuOpen = useTableStore((s) => s.categoryMenuOpen);
  const setActiveCategory = useTableStore((s) => s.setActiveCategory);
  const toggleCategoryMenu = useTableStore((s) => s.toggleCategoryMenu);
  const closeCategoryMenu = useTableStore((s) => s.closeCategoryMenu);

  const rows = useMemo(() => deriveCategoryRows(projects), [projects]);
  const activeRow = rows.find((r) => r.value === activeCategory) ?? rows[0];

  const handleSelect = (value: string | null) => {
    if (value !== activeCategory) setActiveCategory(value);
    closeCategoryMenu();
  };

  return {
    rows,
    activeCategory,
    categoryMenuOpen,
    count: activeRow?.count ?? projects.length,
    toggleCategoryMenu,
    closeCategoryMenu,
    handleSelect,
  };
}
