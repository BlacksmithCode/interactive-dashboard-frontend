import { useQuery } from "@tanstack/react-query";
import { fetchLeaders, type ManagerListItem } from "@/entities/leader";

/**
 * Хук для получения списка руководителей.
 * staleTime: 5 минут — данные считаются свежими, повторный запрос не выполняется.
 * Для метаданных (вызов с пустыми фильтрами) это исключает повторные запросы при монтировании.
 */
export function useLeadersQuery(filters: Parameters<typeof fetchLeaders>[0] = {}) {
  return useQuery<ManagerListItem[]>({
    queryKey: ["leaders", filters],
    queryFn: () => fetchLeaders(filters),
    staleTime: 5 * 60 * 1000,
  });
}