// src/features/dashboard/hooks/useManagerDetailQuery.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../shared/api/apiClient";
import type { ManagerDetail } from "../../../shared/types/dashboard";

export function useManagerDetailQuery(fullName: string | undefined) {
  return useQuery<ManagerDetail>({
    queryKey: ["managerDetail", fullName],
    queryFn: async () => {
      if (!fullName) throw new Error("fullName is required");
      const { data } = await api.get<ManagerDetail>(
        `/api/employees/${encodeURIComponent(fullName)}`
      );
      return data;
    },
    enabled: !!fullName,
  });
}