import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNineBox } from "../../../shared/api/dashboardApi";
import type { DashboardFilters } from "../../../shared/types/dashboard";

/**
 * Хук запроса данных матрицы 9-box.
 * Автоматически перезапрашивает данные при изменении фильтров.
 */
export function useNineBoxQuery(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["nineBox", filters.gradeMin, filters.domain],
    queryFn: () => fetchNineBox({ ...filters }),
    placeholderData: keepPreviousData,  // ← вот это
    staleTime: 5 * 60 * 1000,
  });
}
