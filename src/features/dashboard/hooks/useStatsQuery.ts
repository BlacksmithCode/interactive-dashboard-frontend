import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchStats, type DashboardFilters } from "@/entities/dashboard";
import { useAuth, ROLES } from "@/entities/user";

/**
 * Хук запроса сводной статистики (KPI).
 * Автоматически перезапрашивает данные при изменении фильтров.
 */
export function useStatsQuery(filters: DashboardFilters) {
  const { role } = useAuth();

  return useQuery({
    queryKey: ["stats", filters.gradeMin, filters.domain],
    queryFn: () => fetchStats({ ...filters }),
    placeholderData: keepPreviousData,  // ← вот это
    enabled: role !== ROLES.MANAGER,
    staleTime: 5 * 60 * 1000,
  });
}
