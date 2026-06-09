/**
 * @file Хук для получения мета-информации о руководителе.
 *
 * Устраняет дублирование логики получения minGrade / maxGrade / availableDomains
 * между SummaryStats.tsx и LeadersSuccessors.tsx.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMeta } from "../../../shared/api/dashboardApi";

export interface ManagerMeta {
  minGrade: number | undefined;
  maxGrade: number | undefined;
  availableDomains: string[];
  isLoading: boolean;
}

/**
 * Возвращает мета-информацию о руководителях (диапазон грейдов, список доменов).
 */
export function useManagerMeta(): ManagerMeta {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardMeta"],
    queryFn: fetchDashboardMeta,
    staleTime: 5 * 60 * 1000,
  });

  return {
    minGrade: data?.minGrade,
    maxGrade: data?.maxGrade,
    availableDomains: data?.availableDomains || [],
    isLoading,
  };
}