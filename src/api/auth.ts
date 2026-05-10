const AUTH_KEY = "auth_basic";

/**
 * Сохраняет учётные данные для Basic Auth в localStorage.
 */
export function login(username: string, password: string): void {
  const credentials = btoa(`${username}:${password}`);
  localStorage.setItem(AUTH_KEY, credentials);
}

/** Удаляет учётные данные (logout) */
export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
}

/** Получает сохранённые учётные данные */
export function getAuthHeader(): string | null {
  const credentials = localStorage.getItem(AUTH_KEY);
  return credentials ? `Basic ${credentials}` : null;
}

/** Проверяет, есть ли сохранённые учётные данные */
export function isLoggedIn(): boolean {
  return localStorage.getItem(AUTH_KEY) !== null;
}
