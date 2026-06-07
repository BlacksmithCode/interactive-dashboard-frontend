import { useState, useCallback, useMemo, type ReactNode } from "react";
import { DashboardFiltersContext, type DashboardFiltersState } from "./DashboardFiltersContext";
import { useManagerMeta } from "../hooks";

export interface DashboardFiltersProviderProps {
  children: ReactNode;
  /** Начальное значение gradeMin (из URL-параметров) */
  initialGradeMin?: number;
  /** Начальное значение domain (из URL-параметров) */
  initialDomain?: string;
}

export function DashboardFiltersProvider({
  children,
  initialGradeMin,
  initialDomain,
}: DashboardFiltersProviderProps) {
  const [gradeMin, setGradeMinRaw] = useState<number | undefined>(initialGradeMin);
  const [domain, setDomainRaw] = useState<string | undefined>(initialDomain);

  // Метаданные из useManagerMeta (единый источник для minGrade, maxGrade, availableDomains)
  const {
    minGrade,
    maxGrade,
    availableDomains: metaDomains,
    isLoading: isMetaLoading,
  } = useManagerMeta();

  // Вычисляем эффективный домен: если нет в списке доступных в целом - сбрасываем на «Все».
  // Но только если метаданные уже загрузились, чтобы не сбросить первоначальный url.
  const effectiveDomain = useMemo(() => {
    if (!domain) return undefined;
    if (isMetaLoading) return domain;
    if (metaDomains.includes(domain)) return domain;
    return undefined;
  }, [domain, metaDomains, isMetaLoading]);

  const setGradeMin = useCallback((value: number | undefined) => {
    setGradeMinRaw(value);
  }, []);

  const setDomain = useCallback((value: string | undefined) => {
    setDomainRaw(value);
  }, []);

  const state: DashboardFiltersState = {
    filters: {
      gradeMin,
      domain: effectiveDomain,
    },
    setGradeMin,
    setDomain,
    // Метаданные для UI
    minGrade,
    maxGrade,
    availableDomains: metaDomains || [],
  };

  return (
    <DashboardFiltersContext.Provider value={state}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}