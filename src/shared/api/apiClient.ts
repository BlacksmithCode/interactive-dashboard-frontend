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
  MergedKey,
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

/** Маппинг индивидуального ключа 9box → текст интерпретации */
const INDIVIDUAL_BOX_LABEL: Record<string, string> = {
  "AA": "Звезда", "AB": "Звезда",
  "AC": "Профессионал",
  "AD": "Низкоэффективный", "AE": "Низкоэффективный",
  "BA": "Эксперт", "BB": "Эксперт",
  "BC": "Профессионал",
  "BD": "Низкоэффективный", "BE": "Низкоэффективный",
  "CA": "Эксперт",
  "CB": "Профессионал", "CC": "Профессионал",
  "CD": "Зона риска", "CE": "Зона риска",
};

/** Вспомогательная функция: добавляет box + boxInterpretation к сотруднику */
function enrichWithBox<T extends MockEmployee>(emp: T): T & { box: string; boxInterpretation: string } {
  const boxKey = toNineBoxKey(emp.potential, emp.performance);
  const boxStr = boxKey || "";
  return {
    ...emp,
    box: boxStr,
    boxInterpretation: boxStr ? INDIVIDUAL_BOX_LABEL[boxStr] || "" : "",
  };
}


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
 * Правила объединения: MergedKey → массив исходных ключей NineBox
 * (дубликат MERGE_RULES из useMergedCells для мок-функций)
 */
const MERGE_RULES_9BOX: Record<MergedKey, readonly string[]> = {
  AD_AE: ["AD", "AE"],
  AC:    ["AC"],
  AA_AB: ["AA", "AB"],
  BD_BE: ["BD", "BE"],
  BC:    ["BC"],
  BA_BB: ["BA", "BB"],
  CD_CE: ["CD", "CE"],
  CB_CC: ["CB", "CC"],
  CA:    ["CA"],
};

/**
 * Рассчитывает динамическую 9-box матрицу из отфильтрованного списка сотрудников.
 * Сначала собирает индивидуальные ячейки (AA, AB, AC...), затем объединяет их
 * в merged-формат, который ожидает фронтенд (AA_AB, AD_AE...).
 */
function calcNineBox(filtered: MockEmployee[]): NineBoxResponse {
  const raw: Record<string, NineBoxCell> = {};

  // Шаг 1: считаем по индивидуальным ячейкам
  for (const emp of filtered) {
    const key = toNineBoxKey(emp.potential, emp.performance);
    if (!key) continue; // "Нет оценки" пропускаем

    if (!raw[key]) {
      raw[key] = { managers: 0, successors: 0, nonSuccessors: 0 };
    }
    raw[key].managers += 1;
    if (hasSuccessor(emp)) {
      raw[key].successors += 1;
    } else {
      raw[key].nonSuccessors += 1;
    }
  }

  // Шаг 2: объединяем в merged-формат, как это делает бэкенд
  const merged: Record<string, NineBoxCell> = {};
  for (const [mergedKey, individualKeys] of Object.entries(MERGE_RULES_9BOX)) {
    let managers = 0;
    let successors = 0;
    let nonSuccessors = 0;
    for (const ik of individualKeys) {
      const cell = raw[ik];
      if (cell) {
        managers += cell.managers;
        successors += cell.successors;
        nonSuccessors += cell.nonSuccessors;
      }
    }
    merged[mergedKey] = { managers, successors, nonSuccessors };
  }

  return {
    totalManagers: filtered.length,
    cells: merged as Record<NineBoxKey, NineBoxCell>,
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
 * Mock Interceptor: Handles requests on GitHub Pages or when explicitly enabled.
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
  // 2. DASHBOARD STATS
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
    const grades = MOCK_EMPLOYEES.map((e) => e.grade);
    const minGrade = Math.min(...grades);
    const maxGrade = Math.max(...grades);

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
  // 4. NINE_BOX
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/dashboard/9box")) {
    const filtered = filterEmployees(MOCK_EMPLOYEES, params);
    const nineBox = calcNineBox(filtered);

    config.adapter = createMockAdapter(nineBox);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 5. MANAGERS LIST (PAGINATED) — с фильтрацией, сортировкой, box
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/employees/managers")) {
    const page = Number(params.page) || 0;
    const size = Number(params.pageSize) || 20;

    let filtered = filterEmployees(MOCK_EMPLOYEES, params);

    if (params.sortField) {
      filtered = sortEmployees(
        filtered,
        params.sortField,
        (params.sortOrder as "asc" | "desc") || "asc"
      );
    }

    const totalCount = filtered.length;
    const pagedItems = paginate(filtered, page, size);

    const itemsWithMeta = pagedItems.map((emp) => ({
      ...emp,
      hasSuccessor: hasSuccessor(emp),
      ...enrichWithBox(emp),
    }));

    const response: PageResponse<typeof itemsWithMeta[number]> = {
      items: itemsWithMeta,
      totalCount,
      totalPages: Math.ceil(totalCount / size),
      hasNext: page < Math.ceil(totalCount / size) - 1,
    };

    config.adapter = createMockAdapter(response);
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 6. EMPLOYEE DETAIL (by fullName) — с box + successorsCount
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/api/employees/") && !url.includes("/team") && !url.includes("/successors") && !url.includes("/managers") && !url.includes("/export")) {
    const fullName = decodeURIComponent(url.split("/").pop() || "");
    const emp = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);

    if (emp) {
      config.adapter = createMockAdapter({
        ...emp,
        hasSuccessor: hasSuccessor(emp),
        successorsCount: MOCK_EMPLOYEES.filter(
          (e) => e.managerId === emp.id && e.developmentProgram === "Преемники"
        ).length,
        readiness: null,
        ...enrichWithBox(emp),
      });
    } else {
      config.adapter = createMockAdapter({ message: "Not found" }, 404);
    }
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 7. TEAM (по managerId из MOCK_EMPLOYEES)
  // ═══════════════════════════════════════════════════════════
  if (url.includes("/team")) {
    const parts = url.split("/");
    const fullName = decodeURIComponent(parts[parts.length - 2]);
    const manager = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);

    if (manager) {
      const team = MOCK_EMPLOYEES
        .filter((e) => e.managerId === manager.id)
        .map((e) => enrichWithBox(e));
      config.adapter = createMockAdapter(team);
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
    const fullName = decodeURIComponent(parts[parts.length - 2]);
    const manager = MOCK_EMPLOYEES.find(
      (e) => e.fullName === fullName
    );

    if (manager) {
      const successors = MOCK_EMPLOYEES
        .filter((e) => e.managerId === manager.id && e.developmentProgram === "Преемники")
        .map((e) => ({
          ...enrichWithBox(e),
          successorStatus: "Ready now",
          readiness: "6-12 months",
          isApproved: true,
          approvalDate: "2024-01-15",
        }));
      config.adapter = createMockAdapter(successors);
    } else {
      config.adapter = createMockAdapter([]);
    }
    return config;
  }

  // ═══════════════════════════════════════════════════════════
  // 9. DASHBOARD GIST
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
let tokenProvider: (() => string | null) = () => {
  const token = localStorage.getItem("jwt_token");
  return token ? `Bearer ${token}` : null;
};

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
