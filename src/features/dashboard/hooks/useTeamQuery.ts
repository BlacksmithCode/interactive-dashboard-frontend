import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/apiClient";
import type { TeamMemberDto } from "../../../types/dashboard";

export function useTeamQuery(fullName: string | undefined) {
  return useQuery<TeamMemberDto[]>({
    queryKey: ["team", fullName],
    queryFn: async () => {
      if (!fullName) return [];
      const { data } = await api.get<TeamMemberDto[]>(
        `/api/employees/${encodeURIComponent(fullName)}/team`
      );
      return data;
    },
    enabled: !!fullName,
  });
}