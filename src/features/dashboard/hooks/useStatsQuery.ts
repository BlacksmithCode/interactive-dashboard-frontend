import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchStats } from "../../../api/dashboardApi";
import type { DashboardFilters } from "../../../types/dashboard";

/**
 * Хук запроса сводной статистики (KPI).
 * Автоматически перезапрашивает данные при изменении фильтров.
 */
export function useStatsQuery(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["stats", filters.gradeMin, filters.domain],
    queryFn: () => fetchStats({ ...filters }),
    placeholderData: keepPreviousData,  // ← вот это
  });
}
