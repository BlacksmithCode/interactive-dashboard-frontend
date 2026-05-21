/**
 * @file Хук для получения мета-информации о руководителях.
 *
 * Устраняет дублирование логики вычисления minGrade / maxGrade / availableDomains
 * между SummaryStats.tsx и LeadersSuccessors.tsx.
 *
 * В будущем, если бэкенд предоставит эндпоинт /api/dashboard/meta,
 * этот хук будет переписан на его использование (см. requirements.md).
 */
import { useMemo } from "react";
import { useLeadersQuery } from "./useLeadersQuery";

export interface ManagerMeta {
  /** Минимальный грейд среди всех руководителей */
  minGrade: number | undefined;
  /** Максимальный грейд среди всех руководителей */
  maxGrade: number | undefined;
  /** Уникальные упорядоченные домены */
  availableDomains: string[];
  /** Все руководители (сырые данные) */
  allManagers: ReturnType<typeof useLeadersQuery>["data"];
  /** Признак загрузки */
  isLoading: boolean;
}

/**
 * Возвращает мета-информацию о руководителях (диапазон грейдов, список доменов).
 * Результат мемоизирован — пересчитывается только при изменении данных.
 */
export function useManagerMeta(): ManagerMeta {
  const { data: allManagers, isLoading } = useLeadersQuery({});

  const minGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.min(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  const maxGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.max(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  const availableDomains = useMemo(() => {
    if (!allManagers) return [];
    return [...new Set(allManagers.map((m) => m.domain))].sort();
  }, [allManagers]);

  return {
    minGrade,
    maxGrade,
    availableDomains,
    allManagers,
    isLoading,
  };
}