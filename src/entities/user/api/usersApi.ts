import { api } from "@/shared/api/apiClient";

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  fullName?: string;
  active?: boolean;
}

export interface UserResponse {
  id: number;
  username: string;
  fullName: string;
  domain: string;
  role: string;
  active: boolean;
  createdAt: string;
}

export interface RegisterRequest {
  username: string;
  password?: string;
  fullName: string;
  domain: string;
  role: string;
}

/** Валидация пароля по требованиям бэкенда:
 * - минимум 12 символов
 * - хотя бы одна заглавная латинская буква
 * - хотя бы одна строчная латинская буква
 * - хотя бы одна цифра
 * - хотя бы один специальный символ
 * @returns null если пароль валиден, или текст ошибки
 */
export function validatePassword(password: string): string | null {
  if (password.length < 12) return "Пароль должен содержать не менее 12 символов";
  if (!/[a-z]/.test(password)) return "Пароль должен содержать хотя бы одну строчную букву";
  if (!/[A-Z]/.test(password)) return "Пароль должен содержать хотя бы одну заглавную букву";
  if (!/\d/.test(password)) return "Пароль должен содержать хотя бы одну цифру";
  if (!/[!@#$%^&*()\-+={}[\]|\\:;"'<>,.?/~]/.test(password)) return "Пароль должен содержать хотя бы один специальный символ";
  return null;
}

/**
 * Проверяет, является ли сообщение об ошибке от бэкенда сырым regex-сообщением
 * и возвращает человеко-читаемое русское сообщение
 */
export function normalizeErrorMessage(raw: string): string {
  // Сырая regex-ошибка от бэкенда (Java PatternSyntaxException)
  if (raw.includes("Unclosed character class") || raw.includes("PatternSyntaxException") || raw.includes("near index")) {
    return "Пароль не соответствует требованиям безопасности. Длина ≥12, нужны: заглавные, строчные буквы, цифры и спецсимволы";
  }
  // Другие известные бэкенд-ошибки
  if (raw.toLowerCase().includes("username") && raw.toLowerCase().includes("already")) {
    return "Пользователь с таким логином уже существует";
  }
  if (raw.toLowerCase().includes("already") || raw.toLowerCase().includes("exists")) {
    return "Пользователь с таким логином уже существует";
  }
  return raw;
}

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/users/login", { username, password });
  return data;
}

/** Выход из системы с отправкой запроса на бэкенд */
export async function logoutUser(): Promise<void> {
  try {
    await api.post("/api/users/logout");
  } catch (error) {
    console.warn("Logout API call failed, clearing local state anyway", error);
  }
}

export async function fetchUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>("/api/users");
  return data;
}

export async function registerUser(user: RegisterRequest): Promise<void> {
  const validationError = validatePassword(user.password || "");
  if (validationError) {
    throw new Error(validationError);
  }
  try {
    await api.post("/api/users/register", user);
  } catch (err) {
    const normalized = err as { message?: string; statusCode?: number };
    // Фильтруем сырые regex-ошибки от бэкенда
    if (normalized.message) {
      throw new Error(normalizeErrorMessage(normalized.message), { cause: err });
    }
    throw err;
  }
}

export async function updateUserRole(id: number, role: string): Promise<void> {
  await api.put(`/api/users/${id}/role`, { role });
}

export async function toggleUserBlock(id: number): Promise<void> {
  await api.put(`/api/users/${id}/block`);
}

export async function deleteUser(id: number): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
