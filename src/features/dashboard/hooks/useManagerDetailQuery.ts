// src/features/dashboard/hooks/useManagerDetailQuery.ts
import { useQuery } from "@tanstack/react-query";
import { fetchManagerDetail, type ManagerDetail } from "@/entities/leader";

export function useManagerDetailQuery(fullName: string | undefined) {
  return useQuery<ManagerDetail>({
    queryKey: ["managerDetail", fullName],
    queryFn: () => {
      if (!fullName) throw new Error("fullName is required");
      return fetchManagerDetail(fullName);
    },
    enabled: !!fullName,
  });
}