/**
 * @file Хук для получения мета-информации о руководителе.
 *
 * Устраняет дублирование логики получения minGrade / maxGrade / availableDomains
 * между SummaryStats.tsx и LeadersSuccessors.tsx.
 */
import { useQuery } from "@tanstack/react-query";
import { fetchDashboardMeta, type DashboardFilters } from "@/entities/dashboard";

export interface ManagerMeta {
  minGrade: number | undefined;
  maxGrade: number | undefined;
  availableDomains: string[];
  isLoading: boolean;
}

/**
 * Возвращает мета-информацию о руководителях (диапазон грейдов, список доменов).
 * Учитывает все активные фильтры.
 */
export function useManagerMeta(filters?: DashboardFilters): ManagerMeta {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardMeta", filters],
    queryFn: () => fetchDashboardMeta(filters),
    staleTime: 5 * 60 * 1000,
  });

  return {
    minGrade: data?.minGrade,
    maxGrade: data?.maxGrade,
    availableDomains: data?.availableDomains || [],
    isLoading,
  };
}