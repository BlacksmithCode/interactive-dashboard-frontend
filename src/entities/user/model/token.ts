/**
 * @file Бизнес-логика работы с токеном авторизации пользователя.
 */

const AUTH_KEY = "jwt_token";

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_KEY, token);
}

export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_KEY);
}

export function getAuthHeader(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(AUTH_KEY);
  return token ? `Bearer ${token}` : null;
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_KEY) !== null;
}