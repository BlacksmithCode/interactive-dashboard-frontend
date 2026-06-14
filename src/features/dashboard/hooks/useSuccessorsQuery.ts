import { useQuery } from "@tanstack/react-query";
import { fetchManagerSuccessors, type Successor } from "@/entities/leader";

export function useSuccessorsQuery(fullName: string | undefined) {
  return useQuery<Successor[]>({
    queryKey: ["successors", fullName],
    queryFn: () => fetchManagerSuccessors(fullName!),
    enabled: !!fullName,
  });
}