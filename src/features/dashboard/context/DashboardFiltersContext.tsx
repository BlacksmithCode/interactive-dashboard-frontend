import { createContext } from "react";
import type { DashboardFilters } from "../../../types/dashboard";

export interface DashboardFiltersState {
  filters: DashboardFilters;
  setGradeMin: (value: number | undefined) => void;
  setDomain: (value: string | undefined) => void;
}

export const DashboardFiltersContext = createContext<DashboardFiltersState | null>(null);
