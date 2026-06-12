import { createContext } from "react";
import type { DashboardFilters } from "../../../shared/types/dashboard";

export interface DashboardFiltersState {
  filters: DashboardFilters;
  setGradeMin: (value: number | undefined) => void;
  setDomain: (value: string | undefined) => void;
  /** Минимальный грейд среди всех руководителей (для UI подсказок) */
  minGrade: number | undefined;
  /** Максимальный грейд среди всех руководителей (для UI подсказок) */
  maxGrade: number | undefined;
  /** Отсортированный список уникальных доменов */
  availableDomains: string[];

  // Текстовые фильтры и их debounced (отложенные) версии
  searchName: string;
  setSearchName: (value: string | ((prev: string) => string)) => void;
  debouncedSearchName: string;

  positionFilter: string;
  setPositionFilter: (value: string) => void;
  debouncedPositionFilter: string;

  // Дополнительные фильтры
  criticalFilter: boolean | undefined;
  setCriticalFilter: (value: boolean | undefined) => void;

  successorFilter: boolean | undefined;
  setSuccessorFilter: (value: boolean | undefined) => void;

  resetAllFilters: () => void;
}

export const DashboardFiltersContext = createContext<DashboardFiltersState | null>(null);
