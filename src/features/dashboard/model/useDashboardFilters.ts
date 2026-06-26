import { useContext } from "react";
import { DashboardFiltersContext, type DashboardFiltersState } from "./DashboardFiltersContext";

/**
 * Хук доступа к фильтрам дашборда.
 * Предоставляет текущие фильтры, сеттеры и метаданные (minGrade, maxGrade, availableDomains).
 */
export function useDashboardFilters(): DashboardFiltersState {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error(
      "useDashboardFilters должен использоваться внутри DashboardFiltersProvider"
    );
  }
  return ctx;
}
