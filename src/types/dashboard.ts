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

// ---------- Дашборд 2: руководители и преемники ----------

/** Краткая информация о руководителе (для списка поиска) */
export interface LeaderSummary {
  id: number;
  fullName: string;
  position: string;
  grade: number;
  domain: string;
}

/** Информация о подчинённом / члене команды */
export interface TeamMember {
  fullName: string;
  position: string;
  potential: string;          // "A" | "B" | "C"
  potentialValue: number;     // числовое значение потенциала
  performance: string;        // "A" | "B" | "C" | "D" | "E"
  performanceValue: number;   // числовое значение результативности
  box: string;                // например "AB"
  boxInterpretation: string;  // "Звезда", "Профессионал" и т.д.
  evaluationYear: number;     // год последней оценки
}

/** Информация о преемнике (аналогична подчинённому + кто заявил) */
export interface Successor extends TeamMember {
  declaredBy: string;          // ФИО руководителя, который заявил
  declarationDate: string;     // дата назначения
}

/** Полная информация о руководителе (детали + команда + преемники) */
export interface LeaderDetails {
  leader: LeaderSummary;
  team: TeamMember[];
  successors: Successor[];
}