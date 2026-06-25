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
 * - минимум 8 символов
 * - хотя бы одна латинская буква
 * - хотя бы одна цифра
 * @returns null если пароль валиден, или текст ошибки
 */
export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Пароль должен содержать не менее 8 символов";
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  if (!hasLetter || !hasDigit) return "Пароль должен содержать как буквы, так и цифры";
  return null;
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
    // Игнорируем ошибки при логауте — пользователь всё равно выйдет из системы
    console.warn("Logout API call failed, clearing local state anyway", error);
  }
}

export async function fetchUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>("/api/users");
  return data;
}

export async function registerUser(user: RegisterRequest): Promise<void> {
  const error = validatePassword(user.password || "");
  if (error) {
    throw new Error(error);
  }
  await api.post("/api/users/register", user);
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
