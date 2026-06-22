// Generated from project_export.txt backend DTOs

// com.example.inno.dto.common.PageResponse
export interface PageResponse<T> {
  items: T[];
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
}

// com.example.inno.dto.admin.UserFilterDto
export interface UserFilterDto {
  role?: string;
  domain?: string;
  active?: boolean;
}

// com.example.inno.dto.admin.UserUpdateRoleDto
export interface UserUpdateRoleDto {
  role: string;
}

// com.example.inno.dto.auth.AuthResponseDto
export interface AuthResponseDto {
  token: string;
  username: string;
  role: string;
  fullName: string;
}

// com.example.inno.dto.auth.LoginRequestDto
export interface LoginRequestDto {
  username: string;
  password: string;
}

// com.example.inno.dto.auth.RegisterRequestDto
export interface RegisterRequestDto {
  username: string;
  password: string;
  fullName: string;
  domain: string;
  role: string;
}

// com.example.inno.dto.auth.UserResponseDto
export interface UserResponseDto {
  id: number;
  username: string;
  fullName: string;
  domain?: string; // domain может быть null для ADMIN
  role: string;
  active: boolean;
  createdAt: string; // LocalDateTime
}

// com.example.inno.dto.dashboard.DashboardMetaDto
export interface DashboardMetaDto {
  minGrade?: number;
  maxGrade?: number;
  availableDomains: string[];
}

// com.example.inno.dto.dashboard.DashboardStatsDto
export interface DashboardStatsDto {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

// com.example.inno.dto.dashboard.DomainGistDto
export interface DomainGistDto {
  domain: string;
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
}

// com.example.inno.dto.dashboard.NineBoxCellDto
export interface NineBoxCellDto {
  managers: number;
  successors: number;
  nonSuccessors: number;
}

// com.example.inno.dto.dashboard.NineBoxDto
export interface NineBoxDto {
  totalManagers: number;
  cells: { [key: string]: NineBoxCellDto }; // e.g., "AD": NineBoxCellDto
}

// com.example.inno.dto.employee.EmployeeDetailDto
export interface EmployeeDetailDto {
  fullName: string;
  domain?: string;
  position?: string;
  grade?: number;
  critical?: boolean;
  hasSuccessor: boolean;
  successorsCount: number;
}

// com.example.inno.dto.employee.EmployeeListItemDto
export interface EmployeeListItemDto {
  fullName: string;
  domain?: string;
  position?: string;
  grade?: number;
  critical?: boolean;
  hasSuccessor: boolean;
}

// com.example.inno.dto.employee.TeamMemberDto
export interface TeamMemberDto {
  fullName: string;
  grade?: number;
  assessment360?: string;
  performance?: string;
  potential?: string;
  era?: string;
  developmentProgram?: string;
}

// com.example.inno.dto.successor.SuccessorDetailDto
export interface SuccessorDetailDto {
  fullName: string;
  grade?: number;
  assessment360?: string;
  performance?: string;
  potential?: string;
  era?: string;
  developmentProgram?: string;
  successorStatus?: string;
  readiness?: string;
  isApproved?: boolean;
  approvedBy?: string;
  approvalDate?: string; // LocalDate
}