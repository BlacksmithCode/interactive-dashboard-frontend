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