import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";
import type { MockEmployee } from "./generatedEmployees";
import { MOCK_EMPLOYEES } from "./generatedEmployees";
import type {
  DashboardStats,
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
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

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

/**
 * Mock Interceptor: Handles requests when VITE_USE_MOCKS is true.
 * Uses `config.adapter` to bypass network and return mock data directly.
 */
function handleMockConfig(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const url = config.url ?? "";
  const method = config.method?.toLowerCase() ?? "get";

  // 1. LOGIN
  if (url.includes("/api/users/login") && method === "post") {
    const { username, password } = (config.data ?? {}) as { username?: string; password?: string };
    const user = MOCK_USERS.find((u) => u.username === username && u.password === password);
    
    if (user) {
      const loginResponse: LoginResponse = {
        token: `mock_jwt_${Date.now()}`,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      };
      config.adapter = createMockAdapter(loginResponse);
    } else {
      config.adapter = createMockAdapter(
        { message: "Invalid credentials" },
        401,
      );
    }
    return config;
  }

  // 1b. GET /api/users — список пользователей
  if (url.includes("/api/users") && method === "get" && !url.includes("/register")) {
    const usersResponse: UserResponse[] = MOCK_USERS.map((u) => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      domain: u.domain ?? "",
      role: u.role.replace("ROLE_", ""), // Возвращаем без префикса ROLE_
      active: u.active,
      createdAt: u.createdAt,
    }));
    config.adapter = createMockAdapter(usersResponse);
    return config;
  }

  // 1c. POST /api/users/register — регистрация
  if (url.includes("/api/users/register") && method === "post") {
    const { username, password, fullName, domain, role } = (config.data ?? {}) as RegisterRequest;
    
    // Проверка на дубликат
    if (MOCK_USERS.some((u) => u.username === username)) {
      config.adapter = createMockAdapter(
        { message: "Пользователь с таким логином уже существует" },
        409,
      );
      return config;
    }
    
    // Создаём нового пользователя
    const newId = Math.max(...MOCK_USERS.map((u) => u.id)) + 1;
    MOCK_USERS.push({
      id: newId,
      username,
      password: password ?? "password",
      fullName,
      domain: domain || null,
      role: `ROLE_${role}` as Role,
      active: true,
      createdAt: new Date().toISOString(),
    });
    
    config.adapter = createMockAdapter({});
    return config;
  }

  // 1d. POST /api/users/logout — выход
  if (url.includes("/api/users/logout") && method === "post") {
    config.adapter = createMockAdapter({});
    return config;
  }

  // 1e. PUT /api/users/{id}/role — обновление роли
  if (url.match(/\/api\/users\/\d+\/role/) && method === "put") {
    config.adapter = createMockAdapter({});
    return config;
  }

  // 1f. PUT /api/users/{id}/block — блок/разблок пользователя
  if (url.match(/\/api\/users\/\d+\/block/) && method === "put") {
    config.adapter = createMockAdapter({});
    return config;
  }

  // 1g. DELETE /api/users/{id} — удаление пользователя
  if (url.match(/\/api\/users\/\d+/) && method === "delete" && !url.includes("/role") && !url.includes("/block")) {
    config.adapter = createMockAdapter({});
    return config;
  }

  // 2. DASHBOARD STATS
  if (url.includes("/api/dashboard/stats")) {
    config.adapter = createMockAdapter({
      managersWithSuccessors: 2,
      managersWithoutSuccessors: 3,
      criticalRoles: 4,
      criticalRolesWithSuccessors: 2,
      criticalRolesWithoutSuccessors: 2,
      nonCriticalRoles: 1,
      nonCriticalRolesWithSuccessors: 0,
      nonCriticalRolesWithoutSuccessors: 1,
    } satisfies DashboardStats);
    return config;
  }

  // 3. DASHBOARD META
  if (url.includes("/api/dashboard/meta")) {
    config.adapter = createMockAdapter({
      minGrade: 5,
      maxGrade: 8,
      availableDomains: ["IT", "HR", "Finance", "Sales"],
    });
    return config;
  }

  // 4. NINE_BOX
  if (url.includes("/api/dashboard/9box")) {
    config.adapter = createMockAdapter({
      totalManagers: 5,
      cells: {
        HH: { managers: 2, successors: 1, nonSuccessors: 1 },
        HM: { managers: 1, successors: 0, nonSuccessors: 1 },
        MH: { managers: 1, successors: 1, nonSuccessors: 0 },
        ML: { managers: 1, successors: 0, nonSuccessors: 1 },
        LL: { managers: 0, successors: 0, nonSuccessors: 0 },
      },
    });
    return config;
  }

  // 5. MANAGERS LIST (PAGINATED)
  if (url.includes("/api/employees/managers")) {
    const params = (config.params ?? {}) as Record<string, unknown>;
    let filtered = [...MOCK_EMPLOYEES];
  
    if (params.grade) {
      filtered = filtered.filter((e) => e.grade === Number(params.grade));
    }

    const page = Number(params.page) || 0;
    const size = Number(params.pageSize) || 20;
    const totalCount = filtered.length;
    const pagedItems = filtered.slice(page * size, (page + 1) * size);

    const response: PageResponse<MockEmployee> = {
      items: pagedItems,
      totalCount,
      totalPages: Math.ceil(totalCount / size),
      hasNext: page < Math.ceil(totalCount / size) - 1,
    };
    
    config.adapter = createMockAdapter(response);
    return config;
  }

  // 6. EMPLOYEE DETAIL (by fullName)
  if (url.includes("/api/employees/") && !url.includes("/team") && !url.includes("/successors")) {
    const fullName = url.split("/").pop();
    const emp = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);
    
    if (emp) {
      config.adapter = createMockAdapter(emp);
    } else {
      config.adapter = createMockAdapter({ message: "Not found" }, 404);
    }
    return config;
  }

  // 7. TEAM
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

  // 8. SUCCESSORS (/api/employees/{fullName}/successors)
  if (url.includes("/successors")) {
    const parts = url.split("/");
    const fullName = parts[parts.length - 2];
    const manager = MOCK_EMPLOYEES.find((e) => e.fullName === decodeURIComponent(fullName));
    
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

  
  // 9. DASHBOARD GIST
  if (url.includes("/api/dashboard/gist")) {
    // Парсим params: может быть URLSearchParams, Record или объект
    let rawParams: Record<string, string | string[]> = {};
    const paramsObj = config.params;
    if (paramsObj instanceof URLSearchParams) {
      rawParams = Object.fromEntries(paramsObj.entries());
    } else if (paramsObj && typeof paramsObj === "object") {
      rawParams = paramsObj as Record<string, string | string[]>;
    }
    
    // Базовые данные gist — генерируем из MOCK_EMPLOYEES
    const domainStats = new Map<string, { managersWithSuccessors: number; managersWithoutSuccessors: number }>();
    for (const emp of MOCK_EMPLOYEES) {
      if (!domainStats.has(emp.domain)) {
        domainStats.set(emp.domain, { managersWithSuccessors: 0, managersWithoutSuccessors: 0 });
      }
      const stats = domainStats.get(emp.domain)!;
      const hasSuccessor = MOCK_SUCCESSORS.some((s) => s.managerId === emp.id);
      if (hasSuccessor) {
        stats.managersWithSuccessors++;
      } else {
        stats.managersWithoutSuccessors++;
      }
    }
    
    let mockGist: DomainGistDto[] = Array.from(domainStats.entries()).map(
      ([domain, stats]) => ({ domain, ...stats }),
    );
    
    // Фильтрация по gradeMin
    if (rawParams.gradeMin) {
      const gradeMin = Number(rawParams.gradeMin);
      if (gradeMin > 6) {
        mockGist = mockGist.map((g) => ({
          ...g,
          managersWithSuccessors: Math.max(0, g.managersWithSuccessors - 1),
          managersWithoutSuccessors: Math.max(0, g.managersWithoutSuccessors - 1),
        }));
      }
    }
    
    // Фильтрация по доменам
    if (rawParams.domains) {
      const domains = Array.isArray(rawParams.domains) ? rawParams.domains : [rawParams.domains];
      mockGist = mockGist.filter((g) => domains.includes(g.domain));
    }
    
    config.adapter = createMockAdapter(mockGist);
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

// ─── Mock Interceptor ─────────────────────────────────────────────────────
if (USE_MOCKS) {
  api.interceptors.request.use((config) => {
    return handleMockConfig(config);
  });
}

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
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalized = normalizeError(error);

    if (normalized.statusCode === 401) {
      if (error.config && !error.config.url?.includes("/api/users/login")) {
        onUnauthorizedHandler?.();
      }
    }

    return Promise.reject(normalized);
  }
);
