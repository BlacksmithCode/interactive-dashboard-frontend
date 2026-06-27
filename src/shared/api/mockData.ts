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

// --- Авторизация ---
export const mockLoginResponse: MockJwtToken = {
  token:
    "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJpLnZhcmEubXYiLCJyb2xlcyI6WyJBRE1JTiJdLCJpYXQiOjE3MDAwMDAwMDB9.mock-signature",
  expiresIn: 3600,
  user: {
    id: "usr-001",
    username: "i.vara.mv",
    fullName: "Варагин М. В.",
    roles: ["ADMIN"],
    domain: "IT",
  },
};

// --- Статистика HR ---
export const mockStats: MockStats = {
  totalEmployees: 1247,
  criticalPositions: 34,
  successorsReady: 18,
  openVacancies: 12,
  benchPercentage: 5.3,
};

// --- Сотрудники ---
export const mockEmployees: MockEmployee[] = [
  {
    id: "emp-001",
    fullName: "Иванов И. И.",
    position: "Senior Developer",
    grade: "A3",
    domain: "IT",
    criticalRole: true,
    potential: "High",
    performance: "Exceeds",
  },
  {
    id: "emp-002",
    fullName: "Петрова А. С.",
    position: "HR Business Partner",
    grade: "B2",
    domain: "HR",
    criticalRole: true,
    potential: "Medium",
    performance: "Meets",
  },
  {
    id: "emp-003",
    fullName: "Сидоров К. М.",
    position: "Team Lead",
    grade: "A2",
    domain: "IT",
    criticalRole: false,
    potential: "High",
    performance: "Exceeds",
  },
  {
    id: "emp-004",
    fullName: "Козлова Е. В.",
    position: "Junior Developer",
    grade: "C1",
    domain: "IT",
    criticalRole: false,
    potential: "Medium",
    performance: "Meets",
  },
  {
    id: "emp-005",
    fullName: "Морозов Д. А.",
    position: "Finance Manager",
    grade: "B1",
    domain: "Finance",
    criticalRole: true,
    potential: "Low",
    performance: "Below",
  },
  {
    id: "emp-006",
    fullName: "Новикова Т. Р.",
    position: "Senior Analyst",
    grade: "B3",
    domain: "Analytics",
    criticalRole: false,
    potential: "High",
    performance: "Exceeds",
  },
  {
    id: "emp-007",
    fullName: "Волков П. Н.",
    position: "DevOps Engineer",
    grade: "A1",
    domain: "IT",
    criticalRole: true,
    potential: "Medium",
    performance: "Meets",
  },
  {
    id: "emp-008",
    fullName: "Лебедева О. Г.",
    position: "Project Manager",
    grade: "B2",
    domain: "Operations",
    criticalRole: false,
    potential: "High",
    performance: "Exceeds",
  },
];

// --- Аудит-лог ---
export const mockAuditLogs: MockAuditLog[] = [
  {
    id: 1,
    timestamp: "2025-01-15T10:23:00Z",
    username: "i.vara.mv",
    action: "LOGIN_SUCCESS",
    target: "system",
    details: "Авторизация пользователя через SSO",
  },
  {
    id: 2,
    timestamp: "2025-01-15T10:45:12Z",
    username: "i.vara.mv",
    action: "DATA_EXPORT",
    target: "employees_report",
    details: "Экспорт отчета по сотрудникам в Excel",
  },
  {
    id: 3,
    timestamp: "2025-01-15T11:02:30Z",
    username: "i.vara.mv",
    action: "CONFIG_CHANGE",
    target: "nine_box_matrix",
    details: "Изменены границы зон матрицы 9-box",
  },
  {
    id: 4,
    timestamp: "2025-01-15T11:30:00Z",
    username: "admin",
    action: "USER_CREATE",
    target: "user:alex.k",
    details: "Создан новый пользователь alex.k с ролью MANAGER",
  },
  {
    id: 5,
    timestamp: "2025-01-15T12:15:45Z",
    username: "i.vara.mv",
    action: "AUDIT_VIEW",
    target: "audit_log",
    details: "Просмотр журнала аудита за период 2025-01",
  },
];
