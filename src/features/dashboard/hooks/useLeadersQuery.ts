import { useQuery } from "@tanstack/react-query";
import { fetchLeaders } from "@/entities/leader";
import type { PaginatedResponse, ManagerListItem, ServerPaginationParams } from "@/entities/leader";

interface UseLeadersQueryFilters {
  grade?: number;
  domains?: string[];
  critical?: boolean;
  hasSuccessor?: boolean;
  searchName?: string;
  positionFilter?: string;
}

/** Хук для получения списка руководителей с серверной пагинацией. */
export function useLeadersQuery(
  filters: UseLeadersQueryFilters = {},
  pagination: ServerPaginationParams = {},
) {
  const { page, pageSize, sortField, sortOrder } = pagination;
  
  return useQuery<PaginatedResponse<ManagerListItem>>({
    queryKey: ["leaders", filters, page, pageSize, sortField, sortOrder],
    queryFn: () => fetchLeaders(filters, { page, pageSize, sortField, sortOrder }),
    staleTime: 5 * 60 * 1000,
  });
}