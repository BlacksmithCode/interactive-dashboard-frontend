import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";
import type { MockEmployee } from "./generatedEmployees";
import { MOCK_EMPLOYEES } from "./generatedEmployees";
import type {
  DomainGistDto,
  LoginResponse,
  PageResponse,
  Role,
} from "./mockData";
import type { RegisterRequest, UserResponse } from "@/entities/user";
import {
  MOCK_SUCCESSORS,
  MOCK_TEAMS,
  MOCK_USERS,
} from "./mockData";
import {
  setAuthToken,
  removeAuthToken,
} from "@/entities/user/model/token";
import type {
  StatsResponse,
  NineBoxResponse,
  NineBoxKey,
  NineBoxCell,
} from "@/entities/dashboard/model/types";

/** Нормализация ошибки Axios в единый формат */
function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedError {
  if (error.response) {
    return {
      message: error.response.data?.error ?? error.response.data?.message ?? error.message,
      statusCode: error.response.status,
      isNetworkError: false,
    };
  }
  if (error.request) {
    return {
      message: "Сетевая ошибка. Проверьте подключение.",
      statusCode: 0,
      isNetworkError: true,
    };
  }
  return {
    message: error.message,
    statusCode: 0,
    isNetworkError: false,
  };
}

// Базовый URL: в dev-режиме используем относительный путь (через Vite-прокси),
// в production — из переменной окружения.
const baseURL = import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : "";

// ─── Mock-режим ───────────────────────────────────────────────────────────

/** Helper to simulate network delay */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Create a mock adapter that returns predefined data */
function createMockAdapter(
  data: unknown,
  status = 200,
): AxiosRequestConfig["adapter"] {
  return () =>
    delay(300).then(() =>
      Promise.resolve({
        data,
        status,
        statusText: status === 200 ? "OK" : "Error",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      }),
    );
}

// ─── Auto-login (HRD_EVALUATION) ────────────────────────────────────────────

const AUTO_LOGIN_USERNAME = "auto_hrd";
const AUTO_LOGIN_ROLE = "ROLE_HRD_EVALUATION" as Role;
const AUTO_LOGIN_FULL_NAME = "HRD Оценка (авто-вход)";

/**
 * Безопасный моковый JWT-токен (100% ASCII, валидный формат).
 * Избегаем btoa() с кириллицей, которая ломает браузер на старте.
 */
const AUTO_LOGIN_MOCK_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdXRvX2hyZCIsInJvbGUiOiJST0xFX0hSRF9FVkFMVUFUSU9OIiwiZnVsbE5hbWUiOiJIUkQgRXZhbCIsImV4cCI6MTkwMDAwMDAwMCwiaWF0IjoxNzAwMDAwMDAwfQ.dGVzdC1zaWduYXR1cmU";

/**
 * Выполняет авто-вход: сохраняет токен в localStorage и возвращает LoginResponse.
 */
function performAutoLogin(): LoginResponse {
  setAuthToken(AUTO_LOGIN_MOCK_JWT);
  return {
    token: AUTO_LOGIN_MOCK_JWT,
    username: AUTO_LOGIN_USERNAME,
    role: AUTO_LOGIN_ROLE,
    fullName: AUTO_LOGIN_FULL_NAME,
  };
}

/** Проверяет, выполнен ли уже авто-вход */
function isAutoLoggedIn(): boolean {
  return localStorage.getItem("username") === AUTO_LOGIN_USERNAME;
}

// ─── Dynamic analytics helpers ──────────────────────────────────────────────

/**
 * Проверяет, имеет ли сотрудник преемника.
 * В сгенерированном датасете: developmentProgram === "Преемники" означает наличие преемника.
 */
function hasSuccessor(employee: MockEmployee): boolean {
  return employee.developmentProgram === "Преемники";
}

/**
 * Преобразует сырые значения potential и performance в nineBoxKey (A-E × A-E).
 * "Нет оценки" пропускается (возвращает null).
 */
function toNineBoxKey(
  potential: string,
  performance: string
): NineBoxKey | null {
  // potential: A, B, C, "Нет оценки"
  const p = potential === "A" || potential === "B" || potential === "C"
    ? potential
    : null;
  // performance: A, B, C, D, E, "Нет оценки"
  const perf = performance === "A" || performance === "B" || performance === "C"
    || performance === "D" || performance === "E"
    ? performance
    : null;

  if (!p || !perf) return null;
  return `${p}${perf}` as NineBoxKey;
}

/**
 * Фильтрует массив сотрудников по параметрам запроса.
 */
function filterEmployees(
  employees: MockEmployee[],
  params: Record<string, unknown>
): MockEmployee[] {
  let filtered = [...employees];

  // grade — точный грейд или диапазон (gradeMin)
  if (params.grade !== undefined && params.grade !== "") {
    const grade = Number(params.grade);
    if (!isNaN(grade)) {
      filtered = filtered.filter((e) => e.grade === grade);
    }
  }
  if (params.gradeMin !== undefined && params.gradeMin !== "") {
    const gradeMin = Number(params.gradeMin);
    if (!isNaN(gradeMin)) {
      filtered = filtered.filter((e) => e.grade >= gradeMin);
    }
  }

  // domain / domains — департамент
  if (params.domain && typeof params.domain === "string") {
    filtered = filtered.filter((e) => e.domain === params.domain);
  }
  if (params.domains) {
    const domains = Array.isArray(params.domains)
      ? params.domains
      : [params.domains];
    filtered = filtered.filter((e) => domains.includes(e.domain));
  }

  // critical — boolean
  if (params.critical !== undefined && params.critical !== "") {
    const critical = params.critical === true
      || params.critical === "true"
      || params.critical === "True"
      || params.critical === "TRUE";
    filtered = filtered.filter((e) => e.critical === critical);
  }

  // hasSuccessor — boolean
  if (params.hasSuccessor !== undefined && params.hasSuccessor !== "") {
    const hasSucc = params.hasSuccessor === true
      || params.hasSuccessor === "true"
      || params.hasSuccessor === "True"
      || params.hasSuccessor === "TRUE";
    filtered = filtered.filter((e) => hasSuccessor(e) === hasSucc);
  }

  // searchName — поиск по ФИО или должности
  if (params.searchName && typeof params.searchName === "string") {
    const q = params.searchName.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.position.toLowerCase().includes(q)
    );
  }
    
  // positionFilter — фильтр по должности (LIKE)
  if (params.positionFilter && typeof params.positionFilter === "string") {
    const q = params.positionFilter.toLowerCase();
    filtered = filtered.filter((e) =>
      e.position.toLowerCase().includes(q)
    );
  }

  return filtered;
}

/**
 * Сортирует массив сотрудников по заданным параметрам.
 */
function sortEmployees(
  employees: MockEmployee[],
  sortField?: string,
  sortOrder: "asc" | "desc" = "asc"
): MockEmployee[] {
  if (!sortField) return employees;

  return [...employees].sort((a, b) => {
    let valA: string | number;
    let valB: string | number;

    switch (sortField) {
      case "fullName":
        valA = a.fullName;
        valB = b.fullName;
        break;
      case "domain":
        valA = a.domain;
        valB = b.domain;
        break;
      case "position":
        valA = a.position;
        valB = b.position;
        break;
      case "grade":
        valA = a.grade;
        valB = b.grade;
        break;
      case "critical":
        valA = a.critical ? 1 : 0;
        valB = b.critical ? 1 : 0;
        break;
      default:
        valA = String((a as unknown as Record<string, unknown>)[sortField] ?? "");
        valB = String((b as unknown as Record<string, unknown>)[sortField] ?? "");
    }

    if (typeof valA === "string" && typeof valB === "string") {
      return sortOrder === "asc"
        ? valA.localeCompare(valB, "ru")
        : valB.localeCompare(valA, "ru");
    }
    const numA = Number(valA);
    const numB = Number(valB);
    return sortOrder === "asc"
      ? numA - numB
      : numB - numA;
  });
}

/**
 * Пагинирование массива.
 */
function paginate<T>(items: T[], page: number, size: number): T[] {
  const start = page * size;
  return items.slice(start, start + size);
}

/**
 * Рассчитывает динамическую статистику (StatsResponse) из отфильтрованного списка сотрудников.
 */
function calcStats(filtered: MockEmployee[]): StatsResponse {
  const withSuccessors = filtered.filter((e) => hasSuccessor(e));
  const withoutSuccessors = filtered.filter((e) => !hasSuccessor(e));

  const critical = filtered.filter((e) => e.critical);
  const nonCritical = filtered.filter((e) => !e.critical);

  return {
    managersWithSuccessors: withSuccessors.length,
    managersWithoutSuccessors: withoutSuccessors.length,
    criticalRoles: critical.length,
    criticalRolesWithSuccessors: critical.filter((e) => hasSuccessor(e)).length,
    criticalRolesWithoutSuccessors: critical.filter((e) => !hasSuccessor(e)).length,
    nonCriticalRoles: nonCritical.length,
    nonCriticalRolesWithSuccessors: nonCritical.filter((e) => hasSuccessor(e)).length,
    nonCriticalRolesWithoutSuccessors: nonCritical.filter((e) => !hasSuccessor(e)).length,
  };
}

/**
 * Рассчитывает динамическую 9-box матрицу из отфильтрованного списка сотрудников.
 */
function calcNineBox(filtered: MockEmployee[]): NineBoxResponse {
  const cells: Record<string, NineBoxCell> = {};

  for (const emp of filtered) {
    const key = toNineBoxKey(emp.potential, emp.performance);
    if (!key) continue; // "Нет оценки" пропускаем

    if (!cells[key]) {
      cells[key] = { managers: 0, successors: 0, nonSuccessors: 0 };
    }
    cells[key].managers += 1;
    if (hasSuccessor(emp)) {
      cells[key].successors += 1;
    } else {
      cells[key].nonSuccessors += 1;
    }
  }

  return {
    totalManagers: filtered.length,
    cells: cells as Record<NineBoxKey, NineBoxCell>,
  };
}

/**
 * Рассчитывает DomainGist из отфильтрованного списка сотрудников.
 */
function calcDomainGist(filtered: MockEmployee[]): DomainGistDto[] {
  const domainMap = new Map<string, { managersWithSuccessors: number; managersWithoutSuccessors: number }>();

  for (const emp of filtered) {
    if (!domainMap.has(emp.domain)) {
      domainMap.set(emp.domain, { managersWithSuccessors: 0, managersWithoutSuccessors: 0 });
    }
    const stats = domainMap.get(emp.domain)!;
    if (hasSuccessor(emp)) {
      stats.managersWithSuccessors += 1;
    } else {
      stats.managersWithoutSuccessors += 1;
    }
  }

  return Array.from(domainMap.entries()).map(
    ([domain, stats]) => ({ domain, ...stats })
  );
}

// ─── Extract params from request config ─────────────────────────────────────

/**
 * Извлекает параметры запроса из config.params в удобный Record<string, string>.
 * Учитывает URLSearchParams, Record, и строковые значения.
 */
function extractParams(
  config: InternalAxiosRequestConfig
): Record<string, string> {
  const raw = config.params;
  if (!raw) return {};

  if (raw instanceof URLSearchParams) {
    return Object.fromEntries(raw.entries());
  }

  if (typeof raw === "object") {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (value === undefined || value === null) continue;
      result[key] = Array.isArray(value) ? value.join(",") : String(value);
    }
    return result;
  }

  return {};
}

// ─── Mock Interceptor ───────────────────────────────────────────────────────

/**
 * Mock Interceptor: Handles requests when VITE_USE_MOCKS is true.
 * Uses `config.adapter` to bypass network and return mock data directly.
 */
function handleMockConfig(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const url = config.url ?? "";
  const method = config.method?.toLowerCase() ?? "get";
  const params = extractParams(config);

  // ═══════════════════════════════════════════════════════════
  // 1. AUTO-LOGIN (GET /api/users/me или любой первый запрос)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/users/me") && method === "get") {
    if (!isAutoLoggedIn()) {
      performAutoLogin();
    }
    config.adapter = createMockAdapter({
      id: 9999,
      username: AUTO_LOGIN_USERNAME,
      fullName: AUTO_LOGIN_FULL_NAME,
      domain: null,
      role: "HRD_EVALUATION",
      active: true,
      createdAt: new Date().toISOString(),
    });
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 1a. LOGIN — авто-вход под ROLE_HRD_EVALUATION
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/users/login") && method === "post") {
    const loginResponse = performAutoLogin();
    config.adapter = createMockAdapter(loginResponse);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 1b. GET /api/users — список пользователей
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/users") && method === "get" && !url.includes("/register")) {
    const usersResponse: UserResponse[] = MOCK_USERS.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      domain: u.domain ?? "",
      role: u.role.replace("ROLE_", ""),
      active: u.active,
      createdAt: u.createdAt,
    }));
    config.adapter = createMockAdapter(usersResponse);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 1c. POST /api/users/register — регистрация
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/users/register") && method === "post") {
    const { username, fullName, domain, role } = (config.data ?? {}) as RegisterRequest;

    if (MOCK_USERS.some((u) => u.username === username)) {
      config.adapter = createMockAdapter(
        { message: "Пользователь с таким логином уже существует" },
        409,
      );
      return config;
    }

    const newId = Math.max(...MOCK_USERS.map((u) => u.id)) + 1;
    MOCK_USERS.push({
      id: newId,
      username,
      password: "password",
      fullName,
      domain: domain || null,
      role: `ROLE_${role}` as Role,
      active: true,
      createdAt: new Date().toISOString(),
    });

    config.adapter = createMockAdapter({});
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 1d. POST /api/users/logout — выход
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/users/logout") && method === "post") {
    removeAuthToken();
    config.adapter = createMockAdapter({});
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 1e–1g. User management endpoints
  // ═══════════════════════════════════════════════════════════
  if (url.match(/\/api\/users\/\d+\/role/) && method === "put") {
    config.adapter = createMockAdapter({});
    return config;
  }

  if (url.match(/\/api\/users\/\d+\/block/) && method === "put") {
    config.adapter = createMockAdapter({});
    return config;
  }

  if (url.match(/\/api\/users\/\d+/) && method === "delete" && !url.includes("/role") && !url.includes("/block")) {
    config.adapter = createMockAdapter({});
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 2. DASHBOARD STATS (динамический расчёт из MOCK_EMPLOYEES)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/dashboard/stats")) {
    const filtered = filterEmployees(MOCK_EMPLOYEES, params);
    const stats = calcStats(filtered);

    config.adapter = createMockAdapter(stats);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 3. DASHBOARD META
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/dashboard/meta")) {
    // Рассчитываем реальный range грейдов из датасета
    const grades = MOCK_EMPLOYEES.map((e) => e.grade);
    const minGrade = Math.min(...grades);
    const maxGrade = Math.max(...grades);

    // Получаем уникальные домены (с учётом фильтра)
    const filtered = filterEmployees(MOCK_EMPLOYEES, params);
    const availableDomains = [...new Set(filtered.map((e) => e.domain))].sort();

    config.adapter = createMockAdapter({
      minGrade,
      maxGrade,
      availableDomains,
    });
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 4. NINE_BOX (динамический расчёт из MOCK_EMPLOYEES)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/dashboard/9box")) {
    const filtered = filterEmployees(MOCK_EMPLOYEES, params);
    const nineBox = calcNineBox(filtered);

    config.adapter = createMockAdapter(nineBox);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 5. MANAGERS LIST (PAGINATED) — с фильтрацией и сортировкой
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/employees/managers")) {
    const page = Number(params.page) || 0;
    const size = Number(params.pageSize) || 20;

    // Фильтрация
    let filtered = filterEmployees(MOCK_EMPLOYEES, params);

    // Сортировка
    if (params.sortField) {
      filtered = sortEmployees(
        filtered,
        params.sortField,
        (params.sortOrder as "asc" | "desc") || "asc"
      );
    }

    const totalCount = filtered.length;
    const pagedItems = paginate(filtered, page, size);

    // Добавляем hasSuccessor к каждому элементу
    const itemsWithSuccessor = pagedItems.map((emp) => ({
      ...emp,
      hasSuccessor: hasSuccessor(emp),
    }));

    const response: PageResponse<typeof itemsWithSuccessor[number]> = {
      items: itemsWithSuccessor,
      totalCount,
      totalPages: Math.ceil(totalCount / size),
      hasNext: page < Math.ceil(totalCount / size) - 1,
    };

    config.adapter = createMockAdapter(response);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 6. EMPLOYEE DETAIL (by fullName)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/employees/") && !url.includes("/team") && !url.includes("/successors")) {
    const fullName = url.split("/").pop();
    const emp = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);

    if (emp) {
      config.adapter = createMockAdapter({
        ...emp,
        hasSuccessor: hasSuccessor(emp),
      });
    } else {
      config.adapter = createMockAdapter({ message: "Not found" }, 404);
    }
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 7. TEAM
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/team")) {
    const parts = url.split("/");
    const fullName = parts[parts.length - 2];
    const manager = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);

    if (manager && MOCK_TEAMS[manager.id]) {
      config.adapter = createMockAdapter(MOCK_TEAMS[manager.id]);
    } else {
      config.adapter = createMockAdapter([]);
    }
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 8. SUCCESSORS (/api/employees/{fullName}/successors)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/successors")) {
    const parts = url.split("/");
    const fullName = parts[parts.length - 2];
    const manager = MOCK_EMPLOYEES.find(
      (e) => e.fullName === decodeURIComponent(fullName)
    );

    if (manager) {
      const succs = MOCK_SUCCESSORS
        .filter((s) => s.managerId === manager.id)
        .map((s) => {
          const emp = MOCK_EMPLOYEES.find((e) => e.id === s.employeeId);
          return { ...s, ...(emp ?? {}) };
        });
      config.adapter = createMockAdapter(succs);
    } else {
      config.adapter = createMockAdapter([]);
    }
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 9. DASHBOARD GIST (динамический расчёт по доменам)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/dashboard/gist")) {
    const filtered = filterEmployees(MOCK_EMPLOYEES, params);
    const gist = calcDomainGist(filtered);

    config.adapter = createMockAdapter(gist);
    return config;
  }

  return config; // Not a mock endpoint
}

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Обработчик неавторизованного доступа (401) ──────────────────────────
let onUnauthorizedHandler: (() => void) | null = null;

export function setOnUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorizedHandler = handler;
}

// ─── Провайдер токена (Инверсия зависимостей) ─────────────────────────────
let tokenProvider: (() => string | null) | null = null;

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

// ─── Mock Interceptor (всегда зарегистрирован — предотвращает tree-shaking) ──
api.interceptors.request.use((config) => {
  // Runtime check — нельзя tree-shake: на GitHub Pages нет бэкенда
  const isGitHubPages =
    typeof window !== "undefined" &&
    window.location.hostname.includes("github.io");
  const useMocks =
    isGitHubPages ||
    localStorage.getItem("USE_MOCKS") === "true";
  if (!useMocks) return config;
  return handleMockConfig(config);
});

// Перехватчик запросов — добавляем Authorization заголовок
api.interceptors.request.use((config) => {
  if (tokenProvider) {
    const authHeader = tokenProvider();
    if (authHeader) config.headers.set("Authorization", authHeader);
  }
  return config;
});

// Перехватчик ответа — нормализация ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalized = normalizeError(error);

    if (normalized.statusCode === 401) {
      const configUrl = error.config?.url ?? "";
      if (!configUrl.includes("/api/users/login")) {
        onUnauthorizedHandler?.();
      }
    }

    return Promise.reject(normalized);
  }
);
