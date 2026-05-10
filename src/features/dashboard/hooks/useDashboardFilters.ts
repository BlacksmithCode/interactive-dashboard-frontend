import { useContext } from "react";
import { DashboardFiltersContext } from "../context/DashboardFiltersContext";
import type { DashboardFilters } from "../../../types/dashboard";

/**
 * Хук доступа к фильтрам дашборда.
 * Предоставляет текущие фильтры и сеттеры из DashboardFiltersContext.
 */
export function useDashboardFilters(): {
  filters: DashboardFilters;
  setGradeMin: (value: number | undefined) => void;
  setDomain: (value: string | undefined) => void;
} {
  const ctx = useContext(DashboardFiltersContext);
  if (!ctx) {
    throw new Error(
      "useDashboardFilters must be used within a <DashboardFiltersProvider>"
    );
  }
  return ctx;
}
