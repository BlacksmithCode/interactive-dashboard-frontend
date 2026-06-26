/** Элемент списка руководителей (с /api/managers) */
export interface ManagerListItem {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
  assessment360?: string;
  era?: string;
  developmentProgram?: string;
  careerStatus?: string;
  potential?: string;
  performance?: string;
  box?: string;
  boxInterpretation?: string;
}

/** Пагинированный ответ от сервера */
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

/** Параметры сортировки для серверной пагинации */
export type SortField = 
  | "fullName" 
  | "grade" 
  | "domain" 
  | "position" 
  | "critical"
  | "potential"
  | "performance"
  | "assessment360"
  | "era"
  | "box"
  | "boxInterpretation"
  | "developmentProgram"
  | "careerStatus";
export type SortOrder = "asc" | "desc";

/** Параметры пагинации и сортировки (UI) */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: SortField;
  sortOrder?: SortOrder;
}

/** Параметры пагинации и сортировки для сервера (с snake_case полями) */
export interface ServerPaginationParams {
  page?: number;
  pageSize?: number;
  sortField?: string;
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

export interface TeamMemberDto {
  fullName: string;
  grade?: number;        
  assessment360?: string;
  performance?: string;
  potential?: string;
  era?: string;
  developmentProgram?: string;
  careerStatus?: string;
  box?: string;
  boxInterpretation?: string;
}

export interface Successor extends TeamMemberDto {
  approvedBy?: string;
  approvalDate?: string;
  successorStatus?: string;
  readiness?: string;
  isApproved?: boolean;
}