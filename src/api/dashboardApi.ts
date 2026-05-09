import axios from "axios";

const api = axios.create({
  baseURL: "/api/dashboard",
});

// Типы для ответа stats
export interface StatsResponse {
  managersWithSuccessors: number;
  managersWithoutSuccessors: number;
  criticalRoles: number;
  criticalRolesWithSuccessors: number;
  criticalRolesWithoutSuccessors: number;
  nonCriticalRoles: number;
  nonCriticalRolesWithSuccessors: number;
  nonCriticalRolesWithoutSuccessors: number;
}

// Типы для 9box
export interface NineBoxCell {
  managers: number;
  successors: number;
  nonSuccessors: number;
}

export interface NineBoxResponse {
  totalManagers: number;
  cells: Record<string, NineBoxCell>;
}

// Функции запросов
export async function fetchStats(params: {
  gradeMin?: number;
  domain?: string;
}) {
  const { data } = await api.get<StatsResponse>("/stats", { params });
  return data;
}

export async function fetchNineBox(params: {
  gradeMin?: number;
  domain?: string;
}) {
  const { data } = await api.get<NineBoxResponse>("/9box", { params });
  return data;
}