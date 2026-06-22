import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { fetchDomainGist, type DomainGistDto } from "@/entities/dashboard";
import { useAuth, ROLES } from "@/entities/user";

export function useDomainGistQuery(filters: { gradeMin?: number; domains?: string[]; critical?: boolean; hasSuccessor?: boolean; searchName?: string; positionFilter?: string }) {
  const { role } = useAuth();

  return useQuery<DomainGistDto[]>({
    queryKey: ["domainGist", filters.gradeMin, filters.domains, filters.critical, filters.hasSuccessor, filters.searchName, filters.positionFilter],
    queryFn: () => fetchDomainGist({ gradeMin: filters.gradeMin, domains: filters.domains, critical: filters.critical, hasSuccessor: filters.hasSuccessor, searchName: filters.searchName, positionFilter: filters.positionFilter }),
    placeholderData: keepPreviousData,
    enabled: role !== ROLES.MANAGER,
    staleTime: 5 * 60 * 1000,
  });
}