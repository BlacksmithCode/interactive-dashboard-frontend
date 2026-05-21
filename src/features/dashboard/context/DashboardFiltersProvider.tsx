import { useState, useCallback, useMemo, type ReactNode } from "react";
import { DashboardFiltersContext, type DashboardFiltersState } from "./DashboardFiltersContext";
import { useDomainGistQuery, useManagerMeta } from "../hooks";

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

  const { data: domainGist = [] } = useDomainGistQuery({ gradeMin });

  // Метаданные из useManagerMeta (единый источник для minGrade, maxGrade, availableDomains)
  const {
    minGrade,
    maxGrade,
  } = useManagerMeta();

  // Домены из domainGist (зависят от выбранного gradeMin)
  const availableDomains = useMemo(
    () => [...new Set(domainGist.map((d) => d.domain))].sort(),
    [domainGist]
  );

  // Вычисляем эффективный домен: если нет в списке доступных — сбрасываем на «Все»
  const effectiveDomain = useMemo(
    () => (domain && availableDomains.includes(domain) ? domain : undefined),
    [domain, availableDomains]
  );

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
    availableDomains,
  };

  return (
    <DashboardFiltersContext.Provider value={state}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}