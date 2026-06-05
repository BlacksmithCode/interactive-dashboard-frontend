import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchDomainGist } from "../../../shared/api/dashboardApi";
import type { DomainGistDto } from "../../../shared/types/dashboard";

export function useDomainGistQuery(filters: { gradeMin?: number }) {
  return useQuery<DomainGistDto[]>({
    queryKey: ["domainGist", filters.gradeMin],
    queryFn: () => fetchDomainGist({ gradeMin: filters.gradeMin }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });
}