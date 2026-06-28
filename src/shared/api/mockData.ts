/**
 * @file Моковые данные для автономной работы без бэкенда.
 * Имитирует ответы Spring Boot API.
 */

// --- Типы для строгости ---
export interface MockUser {
  id: string;
  username: string;
  fullName: string;
  roles: string[];
  domain: string;
}

export interface MockJwtToken {
  token: string;
  expiresIn: number;
  user: MockUser;
}

export interface MockStats {
  totalEmployees: number;
  criticalPositions: number;
  successorsReady: number;
  openVacancies: number;
  benchPercentage: number;
}

export interface MockEmployee {
  id: string;
  fullName: string;
  position: string;
  grade: string;
  domain: string;
  criticalRole: boolean;
  potential: "Low" | "Medium" | "High";
  performance: "Below" | "Meets" | "Exceeds";
}

export interface MockAuditLog {
  id: number;
  timestamp: string;
  username: string;
  action: string;
  target: string;
  details: string;
}

// --- Типы, соответствующие реальным API-ответам ---
export interface MockManagerListItem {
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

export interface MockPaginatedResponse<T> {
  items: T[];
  totalCount: number;
}

export interface MockManagerDetail {
  fullName: string;
  domain: string;
  position: string;
  grade: number;
  critical: boolean;
  hasSuccessor: boolean;
  successorsCount: number;
  readiness: string | null;
}

export interface MockTeamMemberDto {
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

export interface MockSuccessor extends MockTeamMemberDto {
  approvedBy?: string;
  approvalDate?: string;
  successorStatus?: string;
  readiness?: string;
  isApproved?: boolean;
}

export interface MockStatsResponse {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

export type NineBoxKey =
  | "AA" | "AB" | "AC" | "AD" | "AE"
  | "BA" | "BB" | "BC" | "BD" | "BE"
  | "CA" | "CB" | "CC" | "CD" | "CE";

export interface NineBoxCell {
  managers: number;
  successors: number;
  nonSuccessors: number;
}

export interface MockNineBoxResponse {
  totalManagers: number;
  cells: Record<NineBoxKey, NineBoxCell>;
}

export interface MockDomainGistDto {
  domain: string;
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
}

export interface MockGradeRangeResponse {
  minGrade: number;
  maxGrade: number;
}

export interface MockDashboardMetaDto {
  minGrade: number;
  maxGrade: number;
  availableDomains: string[];
}

export interface MockAuditLogPageResponse {
  content: {
    id: number;
    timestamp: string;
    userId: number;
    username: string;
    action: string;
    target: string;
    details: string;
  }[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// --- Авторизация: POST /api/users/login ---
// Возвращает { token, username, role, fullName } — как ожидает AuthProvider
export const mockLoginResponse: { token: string; username: string; role: string; fullName: string } = {
  token:
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTcwMDAwMDAwMH0.mock-signature",
  username: "admin",
  role: "ADMIN",
  fullName: "Варагин М. В.",
};

// --- Статистика: GET /api/dashboard/stats ---
export const mockStatsResponse: MockStatsResponse = {
  managersWithSuccessors: 42,
  managersWithoutSuccessors: 18,
  criticalRoles: 34,
  criticalRolesWithSuccessors: 18,
  criticalRolesWithoutSuccessors: 16,
  nonCriticalRoles: 90,
  nonCriticalRolesWithSuccessors: 40,
  nonCriticalRolesWithoutSuccessors: 50,
};

// --- Руководители (пагинированный список): GET /api/employees/managers ---
export const mockManagersList: MockPaginatedResponse<MockManagerListItem> = {
  items: [
    {
      fullName: "Иванов И. И.",
      domain: "IT",
      position: "Senior Developer",
      grade: 3,
      critical: true,
      hasSuccessor: true,
      potential: "High",
      performance: "Exceeds",
      box: "AA",
      boxInterpretation: "Высокий потенциал + высокая результативность",
    },
    {
      fullName: "Петрова А. С.",
      domain: "HR",
      position: "HR Business Partner",
      grade: 2,
      critical: true,
      hasSuccessor: false,
      potential: "Medium",
      performance: "Meets",
      box: "BB",
      boxInterpretation: "Стабильный специалист",
    },
    {
      fullName: "Сидоров К. М.",
      domain: "IT",
      position: "Team Lead",
      grade: 2,
      critical: false,
      hasSuccessor: true,
      potential: "High",
      performance: "Exceeds",
      box: "AB",
      boxInterpretation: "Высокий потенциал + стабильная результативность",
    },
    {
      fullName: "Козлова Е. В.",
      domain: "IT",
      position: "Junior Developer",
      grade: 1,
      critical: false,
      hasSuccessor: false,
      potential: "Medium",
      performance: "Meets",
      box: "CC",
      boxInterpretation: "Средний потенциал + средняя результативность",
    },
    {
      fullName: "Морозов Д. А.",
      domain: "Finance",
      position: "Finance Manager",
      grade: 1,
      critical: true,
      hasSuccessor: false,
      potential: "Low",
      performance: "Below",
      box: "DD",
      boxInterpretation: "Низкий потенциал + низкая результативность",
    },
    {
      fullName: "Новикова Т. Р.",
      domain: "Analytics",
      position: "Senior Analyst",
      grade: 3,
      critical: false,
      hasSuccessor: true,
      potential: "High",
      performance: "Exceeds",
      box: "AA",
      boxInterpretation: "Высокий потенциал + высокая результативность",
    },
    {
      fullName: "Волков П. Н.",
      domain: "IT",
      position: "DevOps Engineer",
      grade: 2,
      critical: true,
      hasSuccessor: false,
      potential: "Medium",
      performance: "Meets",
      box: "BC",
      boxInterpretation: "Высокий потенциал + ниже средней результативность",
    },
    {
      fullName: "Лебедева О. Г.",
      domain: "Operations",
      position: "Project Manager",
      grade: 2,
      critical: false,
      hasSuccessor: true,
      potential: "High",
      performance: "Exceeds",
      box: "AB",
      boxInterpretation: "Высокий потенциал + стабильная результативность",
    },
  ],
  totalCount: 8,
};

// --- Матрица 9-box: GET /api/dashboard/9box ---
export const mockNineBoxResponse: MockNineBoxResponse = {
  totalManagers: 8,
  cells: {
    AA: { managers: 2, successors: 2, nonSuccessors: 0 },
    AB: { managers: 2, successors: 2, nonSuccessors: 0 },
    AC: { managers: 0, successors: 0, nonSuccessors: 0 },
    AD: { managers: 0, successors: 0, nonSuccessors: 0 },
    AE: { managers: 0, successors: 0, nonSuccessors: 0 },
    BA: { managers: 0, successors: 0, nonSuccessors: 0 },
    BB: { managers: 1, successors: 0, nonSuccessors: 1 },
    BC: { managers: 1, successors: 0, nonSuccessors: 1 },
    BD: { managers: 0, successors: 0, nonSuccessors: 0 },
    BE: { managers: 0, successors: 0, nonSuccessors: 0 },
    CA: { managers: 0, successors: 0, nonSuccessors: 0 },
    CB: { managers: 0, successors: 0, nonSuccessors: 0 },
    CC: { managers: 1, successors: 0, nonSuccessors: 1 },
    CD: { managers: 0, successors: 0, nonSuccessors: 0 },
    CE: { managers: 0, successors: 0, nonSuccessors: 0 },
  },
};

// --- Domain gist: GET /api/dashboard/gist ---
export const mockDomainGist: MockDomainGistDto[] = [
  { domain: "IT", managersWithSuccessors: 3, managersWithoutSuccessors: 2 },
  { domain: "HR", managersWithSuccessors: 0, managersWithoutSuccessors: 1 },
  { domain: "Finance", managersWithSuccessors: 0, managersWithoutSuccessors: 1 },
  { domain: "Analytics", managersWithSuccessors: 1, managersWithoutSuccessors: 0 },
  { domain: "Operations", managersWithSuccessors: 1, managersWithoutSuccessors: 0 },
];

// --- Grade range: GET /api/dashboard/grade-range ---
export const mockGradeRange: MockGradeRangeResponse = {
  minGrade: 1,
  maxGrade: 3,
};

// --- Dashboard meta: GET /api/dashboard/meta ---
export const mockDashboardMeta: MockDashboardMetaDto = {
  minGrade: 1,
  maxGrade: 3,
  availableDomains: ["IT", "HR", "Finance", "Analytics", "Operations"],
};

// --- Детали менеджера: GET /api/employees/{fullName} ---
export const mockManagerDetail: MockManagerDetail = {
  fullName: "Иванов И. И.",
  domain: "IT",
  position: "Senior Developer",
  grade: 3,
  critical: true,
  hasSuccessor: true,
  successorsCount: 2,
  readiness: "Высокая",
};

// --- Команда: GET /api/employees/{fullName}/team ---
export const mockTeam: MockTeamMemberDto[] = [
  {
    fullName: "Кузнецов А. А.",
    grade: 1,
    potential: "Medium",
    performance: "Meets",
  },
  {
    fullName: "Смирнова Е. Д.",
    grade: 2,
    potential: "High",
    performance: "Exceeds",
  },
  {
    fullName: "Попов В. Г.",
    grade: 1,
    potential: "Low",
    performance: "Below",
  },
];

// --- Преемники: GET /api/employees/{fullName}/successors ---
export const mockSuccessors: MockSuccessor[] = [
  {
    fullName: "Сидоров К. М.",
    grade: 2,
    potential: "High",
    performance: "Exceeds",
    successorStatus: "Готов",
    readiness: "Высокая",
    isApproved: true,
    approvedBy: "HRD",
    approvalDate: "2025-06-01",
  },
  {
    fullName: "Новикова Т. Р.",
    grade: 3,
    potential: "High",
    performance: "Exceeds",
    successorStatus: "В процессе",
    readiness: "Средняя",
    isApproved: false,
    approvedBy: undefined,
    approvalDate: undefined,
  },
];

// --- Аудит-лог: GET /api/users/logs ---
export const mockAuditLogPage: MockAuditLogPageResponse = {
  content: [
    {
      id: 1,
      timestamp: "2025-01-15T10:23:00Z",
      userId: 1,
      username: "admin",
      action: "LOGIN_SUCCESS",
      target: "system",
      details: "Авторизация пользователя через SSO",
    },
    {
      id: 2,
      timestamp: "2025-01-15T10:45:12Z",
      userId: 1,
      username: "admin",
      action: "DATA_EXPORT",
      target: "employees_report",
      details: "Экспорт отчета по сотрудникам в Excel",
    },
    {
      id: 3,
      timestamp: "2025-01-15T11:02:30Z",
      userId: 1,
      username: "admin",
      action: "CONFIG_CHANGE",
      target: "nine_box_matrix",
      details: "Изменены границы зон матрицы 9-box",
    },
    {
      id: 4,
      timestamp: "2025-01-15T11:30:00Z",
      userId: 2,
      username: "hrd_evaluator",
      action: "USER_CREATE",
      target: "user:alex.k",
      details: "Создан новый пользователь alex.k с ролью MANAGER",
    },
    {
      id: 5,
      timestamp: "2025-01-15T12:15:45Z",
      userId: 1,
      username: "admin",
      action: "AUDIT_VIEW",
      target: "audit_log",
      details: "Просмотр журнала аудита за период 2025-01",
    },
  ],
  totalElements: 5,
  totalPages: 1,
  number: 0,
  size: 20,
  first: true,
  last: true,
  empty: false,
};

