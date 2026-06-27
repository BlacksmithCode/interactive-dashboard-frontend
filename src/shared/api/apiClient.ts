import axios from "axios";
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";
import {
  mockLoginResponse,
  mockStats,
  mockEmployees,
  mockAuditLogs,
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
// Если VITE_USE_MOCKS=true, перехватчик подменяет запросы фейковыми данными.
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

/** Маппинг URL-путей на моковые данные + случайная задержка 300–400мс */
const mockEndpointMap: Record<string, unknown> = {
  "/api/auth/login": mockLoginResponse,
  "/api/stats": mockStats,
  "/api/employees": mockEmployees,
  "/api/audit-log": mockAuditLogs,
};

function getMockDelay(): number {
  return Math.floor(Math.random() * 101) + 300; // 300–400ms
}

/**
 * Возвращает adapter, который подменяет реальный запрос моковыми данными.
 * Использует config.adapter, чтобы не ломать существующую цепочку axios.
 */
function createMockAdapter(mockData: unknown, delay: number) {
  return (): Promise<AxiosResponse> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: mockData,
          status: 200,
          statusText: "OK",
          headers: {} as never,
          config: { headers: {} as never },
        });
      }, delay);
    });
}

/** Проверка, является ли URL одним из моковых эндпоинтов */
function isMockEndpoint(url: string): boolean {
  return Object.keys(mockEndpointMap).some(
    (endpoint) => url.includes(endpoint)
  );
}

/** Получить моковые данные для URL */
function getMockData(url: string): unknown | null {
  for (const [endpoint, data] of Object.entries(mockEndpointMap)) {
    if (url.includes(endpoint)) return data;
  }
  return null;
}

export const api = axios.create({
  baseURL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Обработчик неавторизованного доступа (401) ──────────────────────────
// Позволяет внешнему коду (AuthProvider) подписаться на события 401,
// не создавая жёсткой связки apiClient с роутингом или React-контекстом.
let onUnauthorizedHandler: (() => void) | null = null;

/** Установить callback для обработки 401 (вызывается из AuthProvider) */
export function setOnUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorizedHandler = handler;
}

// ─── Провайдер токена (Инверсия зависимостей) ─────────────────────────────
let tokenProvider: (() => string | null) | null = null;

export function setTokenProvider(provider: () => string | null) {
  tokenProvider = provider;
}

// ─── Mock Interceptor ─────────────────────────────────────────────────────
// Если VITE_USE_MOCKS=true, перехватывает запросы к моковым эндпоинтам
// и возвращает фейковые данные через adapter, не выполняя сетевой запрос.
if (USE_MOCKS) {
  api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const url = config.url ?? "";
    if (isMockEndpoint(url)) {
      const mockData = getMockData(url);
      if (mockData) {
        config.adapter = createMockAdapter(mockData, getMockDelay());
      }
    }
    return config;
  });
}

// Перехватчик запросов — добавляем Basic Auth заголовок
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
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

    // Убрали реакцию на 403, так как 403 — это нормальный ответ при проверке ролей (RBAC).
    // Иначе менеджера будет выкидывать из аккаунта при любой попытке доступа к чужой аналитике.
    if (normalized.statusCode === 401) {
      // Не вызываем логаут, если ошибка пришла именно с формы входа
      if (error.config && !error.config.url?.includes("/api/users/login")) {
        onUnauthorizedHandler?.();
      }
    }

    return Promise.reject(normalized);
  }
);
