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
