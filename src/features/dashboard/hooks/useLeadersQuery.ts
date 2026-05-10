import { useQuery } from "@tanstack/react-query";
import { fetchLeaders } from "../../../api/dashboardApi";

export function useLeadersQuery(search?: string) {
  return useQuery({
    queryKey: ["leaders", search],
    queryFn: () => fetchLeaders(search),
    enabled: true, // всегда включён, можно добавить минимальную длину
  });
}