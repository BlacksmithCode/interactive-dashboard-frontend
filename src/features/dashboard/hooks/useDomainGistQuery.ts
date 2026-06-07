import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchDomainGist } from "../../../shared/api/dashboardApi";
import { useAuth } from "../../../app/providers/useAuth";
import { ROLES } from "../../../shared/ui/roles";
import type { DomainGistDto } from "../../../shared/types/dashboard";

export function useDomainGistQuery(filters: { gradeMin?: number }) {
  const { role } = useAuth();

  return useQuery<DomainGistDto[]>({
    queryKey: ["domainGist", filters.gradeMin],
    queryFn: () => fetchDomainGist({ gradeMin: filters.gradeMin }),
    placeholderData: keepPreviousData,
    enabled: role !== ROLES.MANAGER,
    staleTime: 5 * 60 * 1000,
  });
}