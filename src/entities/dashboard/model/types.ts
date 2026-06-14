/** Ответ API для эндпоинта stats */
export interface StatsResponse {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

/** Ключ стандартной ячейки 9-box (Потенциал × Результативность) */
export type NineBoxKey =
  | "AA" | "AB" | "AC" | "AD" | "AE"
  | "BA" | "BB" | "BC" | "BD" | "BE"
  | "CA" | "CB" | "CC" | "CD" | "CE";

/** Данные одной ячейки матрицы 9-box */
export interface NineBoxCell {
  managers: number;
  successors: number;
  nonSuccessors: number;
}

/** Ответ API для эндпоинта 9-box */
export interface NineBoxResponse {
  totalManagers: number;
  cells: Record<NineBoxKey, NineBoxCell>;
}

export interface DomainGistDto {
  domain: string;
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
}


/** Фильтры, передаваемые в API-запросы */
export interface DashboardFilters {
  gradeMin?: number;
  domain?: string;
}

/** Ключ объединённой ячейки для отображения 3×3 */
export type MergedKey = "AD_AE" | "AC" | "AA_AB" | "BD_BE" | "BC" | "BA_BB" | "CD_CE" | "CB_CC" | "CA";

/** Метаданные объединённой ячейки 9-box */
export interface MergedCellMeta {
  label: string;
  description: string;
}