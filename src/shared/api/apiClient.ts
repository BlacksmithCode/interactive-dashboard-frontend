import axios from "axios";
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";
import type {
  DashboardStats,
  Employee,
  LoginResponse,
  PageResponse,
} from "./mockData";
import {
  MOCK_EMPLOYEES,
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

  // 4. NINE BOX
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

    const response: PageResponse<Employee> = {
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

  // 8. SUCCESSORS
  if (url.includes("/successors")) {
    const parts = url.split("/");
    const fullName = parts[parts.length - 2];
    const manager = MOCK_EMPLOYEES.find((e) => e.fullName === fullName);
    
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
