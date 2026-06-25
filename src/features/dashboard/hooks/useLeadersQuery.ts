import { useQuery } from "@tanstack/react-query";
import { fetchLeaders } from "@/entities/leader";
import type { PaginatedResponse, ManagerListItem, PaginationParams } from "@/entities/leader";

interface UseLeadersQueryFilters {
  grade?: number;
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
 * 
 * ВАЖНО: placeholderData отключён для корректной работы серверной пагинации DataGrid.
 * keepPreviousData вызывал конфликт между старыми данными и новым paginationModel.
 * 
 * Параметр grade (ранее gradeMin) теперь передаёт точное значение грейда для фильтрации.
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
    // placeholderData: keepPreviousData — ОТКЛЮЧЕНО для корректной пагинации
  });
}