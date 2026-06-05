import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";
import { getAuthHeader } from "./auth";

/** Нормализация ошибки Axios в единый формат */
function normalizeError(error: AxiosError<ApiErrorResponse>): NormalizedError {
  if (error.response) {
    return {
      message: error.response.data?.message ?? error.message,
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

// Перехватчик запросов — добавляем Basic Auth заголовок
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const authHeader = getAuthHeader();
  if (authHeader) {
    config.headers.set("Authorization", authHeader);
  }
  return config;
});

// Перехватчик ответа — нормализация ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalized = normalizeError(error);

    // Централизованная обработка 401 через внешний callback
    if (normalized.statusCode === 401) {
      onUnauthorizedHandler?.();
    }

    return Promise.reject(normalized);
  }
);
