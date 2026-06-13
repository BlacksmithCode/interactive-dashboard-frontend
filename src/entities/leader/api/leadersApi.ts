import { api } from "@/shared/api/apiClient";
import type { ManagerListItem, Successor, ManagerDetail, TeamMemberDto } from "../model/types";

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

export async function fetchManagerDetail(fullName: string): Promise<ManagerDetail> {
  const { data } = await api.get<ManagerDetail>(`/api/employees/${encodeURIComponent(fullName)}`);
  return data;
}

export async function fetchManagerTeam(fullName: string): Promise<TeamMemberDto[]> {
  const { data } = await api.get<TeamMemberDto[]>(`/api/employees/${encodeURIComponent(fullName)}/team`);
  return data;
}
