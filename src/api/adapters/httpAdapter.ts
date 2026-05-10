import { api } from "../apiClient";
import type { DashboardFilters, StatsResponse, NineBoxResponse } from "../../types/dashboard";

export async function fetchStats(params: DashboardFilters): Promise<StatsResponse> {
  const { data } = await api.get<StatsResponse>("/stats", { params });
  return data;
}

export async function fetchNineBox(params: DashboardFilters): Promise<NineBoxResponse> {
  const { data } = await api.get<NineBoxResponse>("/9box", { params });
  return data;
}

import type { LeaderSummary, LeaderDetails } from "../../types/dashboard";

export async function fetchLeaders(search?: string): Promise<LeaderSummary[]> {
  const { data } = await api.get<LeaderSummary[]>("/leaders", { params: { search } });
  return data;
}

export async function fetchLeaderDetails(id: number): Promise<LeaderDetails> {
  const { data } = await api.get<LeaderDetails>(`/leaders/${id}`);
  return data;
}