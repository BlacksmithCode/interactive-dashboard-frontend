import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchNineBox, type DashboardFilters } from "@/entities/dashboard";
import { useAuth, ROLES } from "@/entities/user";

/**
 * Хук запроса данных матрицы 9-box.
 * Автоматически перезапрашивает данные при изменении фильтров.
 */
export function useNineBoxQuery(filters: DashboardFilters) {
  const { role } = useAuth();

  return useQuery({
    queryKey: ["nineBox", filters.gradeMin, filters.domain, filters.critical, filters.hasSuccessor, filters.searchName, filters.positionFilter],
    queryFn: () => fetchNineBox({ ...filters }),
    placeholderData: keepPreviousData,  // ← вот это
    enabled: role !== ROLES.MANAGER,
    staleTime: 5 * 60 * 1000,
  });
}
