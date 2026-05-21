import { useQuery } from "@tanstack/react-query";
import { api } from "../../../api/apiClient";
import type { ManagerListItem } from "../../../types/dashboard";

/**
 * Хук для получения команды руководителя по его полному имени.
 * Эндпоинт: /api/employees/{fullName}/team
 */
export function useTeamQuery(fullName: string | undefined) {
  return useQuery<ManagerListItem[]>({
    queryKey: ["team", fullName],
    queryFn: async () => {
      if (!fullName) return [];
      const { data } = await api.get<ManagerListItem[]>(
        `/api/employees/${encodeURIComponent(fullName)}/team`
      );
      return data;
    },
    enabled: !!fullName,
  });
}