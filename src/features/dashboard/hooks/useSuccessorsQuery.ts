import { useQuery } from "@tanstack/react-query";
import { fetchLeaderDetails } from "../../../api/dashboardApi";

export function useSuccessorsQuery(leaderId: number | undefined) {
  return useQuery({
    queryKey: ["successors", leaderId],
    queryFn: () => fetchLeaderDetails(leaderId!),
    enabled: leaderId !== undefined,
    select: (data) => data.successors, // выбираем только преемников
  });
}