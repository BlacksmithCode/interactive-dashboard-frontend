import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchLeaders } from "@/entities/leader";
import type { PaginatedResponse, ManagerListItem, PaginationParams } from "@/entities/leader";

interface UseLeadersQueryFilters {
  gradeMin?: number;
  domains?: string[];
  critical?: boolean;
  hasSuccessor?: boolean;
  searchName?: string;
  positionFilter?: string;
}

/**
 * Хук для получения списка руководителей с серверной пагинацией.
 * staleTime: 5 минут — данные считаются свежими, повторный запрос не выполняется.
 * Все параметры (фильтры + пагинация + сортировка) включены в queryKey для автоматического перезапроса.
 */
export function useLeadersQuery(
  filters: UseLeadersQueryFilters = {},
  pagination: PaginationParams = {},
) {
  const { page, pageSize, sortField, sortOrder } = pagination;
  
  return useQuery<PaginatedResponse<ManagerListItem>>({
    queryKey: ["leaders", filters, page, pageSize, sortField, sortOrder],
    queryFn: () => fetchLeaders(filters, { page, pageSize, sortField, sortOrder }),
    staleTime: 5 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}