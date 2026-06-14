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

export async function loginUser(username: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/users/login", { username, password });
  return data;
}

export async function fetchUsers(): Promise<UserResponse[]> {
  const { data } = await api.get<UserResponse[]>("/api/users");
  return data;
}

export async function registerUser(user: RegisterRequest): Promise<void> {
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
