/** Стандартизированная структура ошибки API */
export interface ApiErrorResponse {
  message: string;
  statusCode: number;
  error?: string;
}

/** Нормализованная ошибка для UI-слоя */
export interface NormalizedError {
  message: string;
  statusCode: number;
  isNetworkError: boolean;
}
