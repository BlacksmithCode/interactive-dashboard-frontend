import { useQuery } from "@tanstack/react-query";
import { fetchLeaders } from "../../../api/dashboardApi";
import type { ManagerListItem } from "../../../types/dashboard";

export function useLeadersQuery(filters: Parameters<typeof fetchLeaders>[0] = {}) {
  return useQuery<ManagerListItem[]>({
    queryKey: ["leaders", filters],
    queryFn: () => fetchLeaders(filters),
  });
}