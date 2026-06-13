import { useQuery } from "@tanstack/react-query";
import { fetchManagerTeam, type TeamMemberDto } from "@/entities/leader";

export function useTeamQuery(fullName: string | undefined) {
  return useQuery<TeamMemberDto[]>({
    queryKey: ["team", fullName],
    queryFn: async () => {
      if (!fullName) return [];
      return fetchManagerTeam(fullName);
    },
    enabled: !!fullName,
  });
}