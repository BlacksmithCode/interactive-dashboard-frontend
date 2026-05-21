/**
 * @file Модуль аутентификации.
 *
 * ВНИМАНИЕ: Текущая реализация использует Basic Auth с хранением
 * учётных данных в localStorage (кодирование Base64 — НЕ шифрование).
 * Это компромиссное решение, пока бэкенд не перейдёт на JWT.
 *
 * При первой возможности запросить у бэкенд-команды переход на JWT
 * (см. requirements.md). После перехода на JWT:
 *   - login() будет сохранять access_token (в памяти или sessionStorage)
 *   - getAuthHeader() будет возвращать "Bearer <token>"
 *   - появится refresh token в httpOnly cookie
 */

const AUTH_KEY = "auth_basic";

/**
 * Сохраняет учётные данные для Basic Auth в localStorage.
 *
 * @warning Использует btoa (Base64) — данные не шифруются, а только кодируются.
 *          Не храните таким образом критически важные пароли.
 */
export function login(username: string, password: string): void {
  if (typeof window === "undefined") return; // SSR guard
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem(AUTH_KEY, credentials);
}

/** Удаляет учётные данные (logout) */
export function logout(): void {
  if (typeof window === "undefined") return; // SSR guard
  localStorage.removeItem(AUTH_KEY);
}

/** Получает сохранённые учётные данные */
export function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null; // SSR guard
  const credentials = localStorage.getItem(AUTH_KEY);
  return credentials ? `Basic ${credentials}` : null;
}

/** Проверяет, есть ли сохранённые учётные данные */
export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false; // SSR guard
  return localStorage.getItem(AUTH_KEY) !== null;
}
