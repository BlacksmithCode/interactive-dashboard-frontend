import { createContext } from "react";
import type { DashboardFilters } from "../../../types/dashboard";

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
}

export const DashboardFiltersContext = createContext<DashboardFiltersState | null>(null);

