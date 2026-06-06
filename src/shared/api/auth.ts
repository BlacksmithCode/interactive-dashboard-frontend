/**
 * @file Модуль аутентификации.
 */

const AUTH_KEY = "jwt_token";

/**
 * Сохраняет JWT токен в localStorage.
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return; // SSR guard
  localStorage.setItem(AUTH_KEY, token);
}

/** Удаляет учётные данные (logout) */
export function logout(): void {
  if (typeof window === "undefined") return; // SSR guard
  localStorage.removeItem(AUTH_KEY);
}

/** Получает сохранённые учётные данные */
export function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null; // SSR guard
  const token = localStorage.getItem(AUTH_KEY);
  return token ? `Bearer ${token}` : null;
}

/** Проверяет, есть ли сохранённые учётные данные */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false; // SSR guard
  return localStorage.getItem(AUTH_KEY) !== null;
}
