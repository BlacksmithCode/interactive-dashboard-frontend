/**
 * @file Barrel file для API-слоя.
 * Централизованный экспорт API-клиента, аутентификации и функций запросов.
 */
export { api, setOnUnauthorizedHandler, setTokenProvider } from "./apiClient";