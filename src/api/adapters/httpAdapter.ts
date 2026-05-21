// src/api/adapters/httpAdapter.ts

import { api } from "../apiClient";
import type { DashboardFilters, StatsResponse, NineBoxResponse,
   ManagerListItem, Successor, DomainGistDto, ManagerDetail, TeamMemberDto  } from "../../types/dashboard";

export async function fetchStats(params: DashboardFilters): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>("/api/dashboard/stats", { params });
  return data;
}

export async function fetchNineBox(params: DashboardFilters): Promise<NineBoxResponse> {
  const { data } = await api.get<NineBoxResponse>("/api/dashboard/9box", { params });
  return data;
}

export async function fetchLeaders(filters: {
  gradeMin?: number;
  domain?: string;
  critical?: boolean;
  hasSuccessor?: boolean;
} = {}): Promise<ManagerListItem[]> {
  const { data } = await api.get<ManagerListItem[]>("/api/employees/managers", { params: filters });
  return data;
}

export async function fetchManagerSuccessors(fullName: string): Promise<Successor[]> {
  const { data } = await api.get<Successor[]>(
    `/api/employees/${encodeURIComponent(fullName)}/successors`
  );
  return data ?? [];
}

export async function fetchDomainGist(params: { gradeMin?: number }): Promise<DomainGistDto[]> {
  const { data } = await api.get<DomainGistDto[]>("/api/dashboard/gist", { params });
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