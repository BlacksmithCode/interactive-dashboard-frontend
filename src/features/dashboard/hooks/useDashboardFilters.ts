import { useContext } from "react";
import { DashboardFiltersContext } from "../context/DashboardFiltersContext";
import type { DashboardFiltersState } from "../context/DashboardFiltersContext";

/**
 * Хук доступа к фильтрам дашборда.
 * Предоставляет текущие фильтры, сеттеры и метаданные (minGrade, maxGrade, availableDomains).
 */
export function useDashboardFilters(): DashboardFiltersState {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error(
      "useDashboardFilters must be used within a <DashboardFiltersProvider>"
    );
  }
  return ctx;
}
