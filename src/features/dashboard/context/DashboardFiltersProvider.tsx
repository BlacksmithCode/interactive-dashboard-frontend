import { useState, useCallback, type ReactNode } from "react";
import { DashboardFiltersContext, type DashboardFiltersState } from "./DashboardFiltersContext";

export function DashboardFiltersProvider({ children }: { children: ReactNode }) {
  const [gradeMin, setGradeMinRaw] = useState<number | undefined>(undefined);
  const [domain, setDomainRaw] = useState<string | undefined>(undefined);

  const setGradeMin = useCallback((value: number | undefined) => {
    setGradeMinRaw(value);
  }, []);

  const setDomain = useCallback((value: string | undefined) => {
    setDomainRaw(value);
  }, []);

  const state: DashboardFiltersState = {
    filters: {
      gradeMin,
      domain: domain || undefined,
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
