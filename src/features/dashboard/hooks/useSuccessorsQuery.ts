import { useQuery } from "@tanstack/react-query";
import { fetchManagerSuccessors } from "../../../shared/api/dashboardApi";
import type { Successor } from "../../../shared/types/dashboard";

export function useSuccessorsQuery(fullName: string | undefined) {
  return useQuery<Successor[]>({
    queryKey: ["successors", fullName],
    queryFn: () => fetchManagerSuccessors(fullName!),
    enabled: !!fullName,
  });
}