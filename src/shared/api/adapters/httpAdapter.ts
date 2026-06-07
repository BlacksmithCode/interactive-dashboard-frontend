// src/api/adapters/httpAdapter.ts

import { api } from "../apiClient";
import type { DashboardFilters, StatsResponse, NineBoxResponse,
   ManagerListItem, Successor, DomainGistDto, ManagerDetail, TeamMemberDto  } from "../../types/dashboard";

export interface AuthResponse {
  token: string;
  username: string;
  role: string;
  fullName?: string;
  active?: boolean;
}

export interface GradeRangeResponse {
  minGrade: number;
  maxGrade: number;
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

export async function fetchGradeRange(domains?: string[]): Promise<GradeRangeResponse> {
  const params = new URLSearchParams();
  if (domains && domains.length > 0) {
    domains.forEach(d => params.append("domains", d));
  }
  const { data } = await api.get<GradeRangeResponse>("/api/dashboard/grade-range", { params });
  return data;
}

export async function fetchStats(params: DashboardFilters): Promise<StatsResponse> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domain) searchParams.append("domains", params.domain);
  const { data } = await api.get<StatsResponse>("/api/dashboard/stats", { params: searchParams });
  return data;
}

export async function fetchNineBox(params: DashboardFilters): Promise<NineBoxResponse> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domain) searchParams.append("domains", params.domain);
  const { data } = await api.get<NineBoxResponse>("/api/dashboard/9box", { params: searchParams });
  return data;
}

export async function fetchLeaders(filters: {
  gradeMin?: number;
  domains?: string[];
  critical?: boolean;
  hasSuccessor?: boolean;
} = {}): Promise<ManagerListItem[]> {
  const params = new URLSearchParams();
  if (filters.gradeMin !== undefined) params.append("gradeMin", filters.gradeMin.toString());
  if (filters.critical !== undefined) params.append("critical", filters.critical.toString());
  if (filters.hasSuccessor !== undefined) params.append("hasSuccessor", filters.hasSuccessor.toString());
  if (filters.domains && filters.domains.length > 0) {
    filters.domains.forEach(d => params.append("domains", d));
  }
  const { data } = await api.get<ManagerListItem[]>("/api/employees/managers", { params });
  return data;
}

export async function fetchManagerSuccessors(fullName: string): Promise<Successor[]> {
  const { data } = await api.get<Successor[]>(
    `/api/employees/${encodeURIComponent(fullName)}/successors`
  );
  return data ?? [];
}

export async function fetchDomainGist(params: { gradeMin?: number; domains?: string[] }): Promise<DomainGistDto[]> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domains && params.domains.length > 0) {
    params.domains.forEach(d => searchParams.append("domains", d));
  }
  const { data } = await api.get<DomainGistDto[]>("/api/dashboard/gist", { params: searchParams });
  return data;
}

export async function fetchManagerDetail(fullName: string): Promise<ManagerDetail> {
  const { data } = await api.get<ManagerDetail>(`/api/employees/${encodeURIComponent(fullName)}`);
  return data;
}

export async function fetchManagerTeam(fullName: string): Promise<TeamMemberDto[]> {
  const { data } = await api.get<TeamMemberDto[]>(`/api/employees/${encodeURIComponent(fullName)}/team`);
  return data;
}