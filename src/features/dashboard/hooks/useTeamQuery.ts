import { useQuery } from "@tanstack/react-query";
import { fetchLeaderDetails } from "../../../api/dashboardApi";

export function useTeamQuery(leaderId: number | undefined) {
  return useQuery({
    queryKey: ["team", leaderId],
    queryFn: () => fetchLeaderDetails(leaderId!),
    enabled: leaderId !== undefined,
    select: (data) => data.team, // выбираем только команду
  });
}