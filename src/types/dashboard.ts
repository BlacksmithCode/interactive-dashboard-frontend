// Типы для дашборда преемников
// Централизованный модуль типов предметной области

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

/** Элемент списка руководителей (с /api/managers) */
export interface ManagerListItem {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
}

/** Преемник (с /api/managers/{fullName}/successors) */
export interface Successor {
  fullName: string;
  queue: number;
  readiness: string;
  successorStatus: string;
  declarant: string;
  assessment360: string;
  performance: string;
  potential: string;
  era: string;
  developmentProgram: string;
  comments: string;
  careerStage: string;
  isApproved: boolean;
  approvedBy: string;
  approvalDate: string;
}