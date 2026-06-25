/** Стандартизированная структура ошибки API */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
}

/** Нормализованная ошибка для UI-слоя */
export interface NormalizedError {
  message: string;
  statusCode: number;
  isNetworkError: boolean;
}
