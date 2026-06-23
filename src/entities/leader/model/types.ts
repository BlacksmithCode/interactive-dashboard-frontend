/** Элемент списка руководителей (с /api/managers) */
export interface ManagerListItem {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
}

/** Пагинированный ответ от сервера */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

/** Параметры сортировки для серверной пагинации */
export type SortField = "fullName" | "grade" | "domain" | "position" | "critical";
export type SortOrder = "asc" | "desc";

/** Параметры пагинации и сортировки */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

/** Преемник (с /api/managers/{fullName}/successors) */
export interface ManagerDetail {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
  successorsCount: number;
  readiness: string | null;
}

export interface Successor {
  fullName: string;
  grade: string;
  assessment360: string;
  performance: string;
  potential: string;
  era: string;
  developmentProgram: string;
  successorStatus: string,
  readiness: string,
  isApproved: boolean;
  approvedBy: string;
  approvalDate: string;
}

export interface TeamMemberDto {
  fullName: string;
  grade?: string;        
  assessment360?: string;
  performance?: string;
  potential?: string;
  era?: string;
  developmentProgram?: string;
}