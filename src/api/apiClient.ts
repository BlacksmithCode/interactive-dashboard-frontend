import axios from "axios";
import type { AxiosError } from "axios";
import type { ApiErrorResponse, NormalizedError } from "../types/errors";

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

export const api = axios.create({
  baseURL: "/api/dashboard",
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Перехватчик ответа — нормализация ошибок
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const normalized = normalizeError(error);

    // Централизованная обработка 401
    if (normalized.statusCode === 401) {
      window.location.href = "/login";
    }

    return Promise.reject(normalized);
  }
);
