import { useQuery } from "@tanstack/react-query";
import { fetchManagerSuccessors } from "../../../api/dashboardApi";
import type { Successor } from "../../../types/dashboard";

export function useSuccessorsQuery(fullName: string | undefined) {
  return useQuery<Successor[]>({
    queryKey: ["successors", fullName],
    queryFn: () => fetchManagerSuccessors(fullName!),
    enabled: !!fullName,
  });
}