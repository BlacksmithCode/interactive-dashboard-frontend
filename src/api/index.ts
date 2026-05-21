/**
 * @file Barrel file для API-слоя.
 * Централизованный экспорт API-клиента, аутентификации и функций запросов.
 */
export { api, setOnUnauthorizedHandler } from "./apiClient";
export {
  login as authLogin,
  logout as authLogout,
  getAuthHeader,
  isLoggedIn,
} from "./auth";
export {
  fetchStats,
  fetchNineBox,
  fetchLeaders,
  fetchManagerSuccessors,
  fetchDomainGist,

} from "./dashboardApi";