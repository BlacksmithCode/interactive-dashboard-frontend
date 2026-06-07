import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchDomainGist } from "../../../shared/api/dashboardApi";
import { useAuth } from "../../../app/providers/useAuth";
import { ROLES } from "../../../shared/ui/roles";
import type { DomainGistDto } from "../../../shared/types/dashboard";

export function useDomainGistQuery(filters: { gradeMin?: number; domain?: string }) {
  const { role } = useAuth();

  return useQuery<DomainGistDto[]>({
    queryKey: ["domainGist", filters.gradeMin, filters.domain],
    queryFn: () => fetchDomainGist({ gradeMin: filters.gradeMin, domains: filters.domain ? [filters.domain] : undefined }),
    placeholderData: keepPreviousData,
    enabled: role !== ROLES.MANAGER,
    staleTime: 5 * 60 * 1000,
  });
}