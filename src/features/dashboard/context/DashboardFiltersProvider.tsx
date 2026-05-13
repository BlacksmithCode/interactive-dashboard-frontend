import { useState, useCallback, useMemo, type ReactNode } from "react";
import { DashboardFiltersContext, type DashboardFiltersState } from "./DashboardFiltersContext";
import { useDomainGistQuery } from "../hooks/useDomainGistQuery";

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [gradeMin, setGradeMinRaw] = useState<number | undefined>(undefined);
  const [domain, setDomainRaw] = useState<string | undefined>(undefined);

  const { data: domainGist = [] } = useDomainGistQuery({ gradeMin });

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
  };

  return (
    <DashboardFiltersContext.Provider value={state}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}