import { useState, useCallback, useMemo, useEffect, type ReactNode } from "react";
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

  // Состояния для локальных/текстовых фильтров
  const [searchName, setSearchName] = useState("");
  const [debouncedSearchName, setDebouncedSearchName] = useState("");

  const [positionFilter, setPositionFilter] = useState("");
  const [debouncedPositionFilter, setDebouncedPositionFilter] = useState("");

  const [criticalFilter, setCriticalFilter] = useState<boolean | undefined>(undefined);
  const [successorFilter, setSuccessorFilter] = useState<boolean | undefined>(undefined);

  const {
    minGrade,
    maxGrade,
    availableDomains: metaDomains,
    isLoading: isMetaLoading,
  } = useManagerMeta();

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

  // Debounce для текстовых полей (500ms) для будущей пагинации и оптимизации UI
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchName(searchName);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchName]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPositionFilter(positionFilter);
    }, 500);
    return () => clearTimeout(handler);
  }, [positionFilter]);

  const resetAllFilters = useCallback(() => {
    setGradeMinRaw(undefined);
    setDomainRaw(undefined);
    setSearchName("");
    setPositionFilter("");
    setCriticalFilter(undefined);
    setSuccessorFilter(undefined);
  }, []);

  const state: DashboardFiltersState = {
    filters: {
      gradeMin,
      domain: effectiveDomain,
    },
    setGradeMin,
    setDomain,
    minGrade,
    maxGrade,
    availableDomains: metaDomains || [],
    searchName,
    setSearchName,
    debouncedSearchName,
    positionFilter,
    setPositionFilter,
    debouncedPositionFilter,
    criticalFilter,
    setCriticalFilter,
    successorFilter,
    setSuccessorFilter,
    resetAllFilters,
  };

  return (
    <DashboardFiltersContext.Provider value={state}>
      {children}
    </DashboardFiltersContext.Provider>
  );
}