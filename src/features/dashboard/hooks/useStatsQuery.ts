import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../../../api/dashboardApi";
import type { DashboardFilters } from "../../../types/dashboard";

/**
 * Хук запроса сводной статистики (KPI).
 * Автоматически перезапрашивает данные при изменении фильтров.
 */
export function useStatsQuery(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["stats", filters.gradeMin, filters.domain],
    queryFn: () =>
      fetchStats({
        gradeMin: filters.gradeMin === undefined ? undefined : filters.gradeMin,
        domain: filters.domain || undefined,
      }),
  });
}
