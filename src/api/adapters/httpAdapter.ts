// src/api/adapters/httpAdapter.ts

import { api } from "../apiClient";
import type { DashboardFilters, StatsResponse, NineBoxResponse, ManagerListItem, Successor } from "../../types/dashboard";

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
  const { data } = await api.get<ManagerListItem[]>("/api/managers", { params: filters });
  return data;
}

export async function fetchManagerSuccessors(fullName: string): Promise<Successor[]> {
  const { data } = await api.get<Successor[]>(
    `/api/managers/${encodeURIComponent(fullName)}/successors`
  );
  return data ?? [];
}