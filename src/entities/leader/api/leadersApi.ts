import { api } from "@/shared/api/apiClient";
import type { ManagerListItem, PaginatedResponse, PaginationParams, Successor, ManagerDetail, TeamMemberDto } from "../model/types";

export async function fetchLeaders(
  filters: {
    grade?: number;
    domains?: string[];
    critical?: boolean;
    hasSuccessor?: boolean;
    searchName?: string;
    positionFilter?: string;
  } = {},
  pagination: PaginationParams = {},
): Promise<PaginatedResponse<ManagerListItem>> {
  const params = new URLSearchParams();
  if (filters.grade !== undefined) params.append("grade", filters.grade.toString());
  if (filters.critical !== undefined) params.append("critical", filters.critical.toString());
  if (filters.hasSuccessor !== undefined) params.append("hasSuccessor", filters.hasSuccessor.toString());
  if (filters.domains && filters.domains.length > 0) {
    filters.domains.forEach(d => params.append("domains", d));
  }
  // Серверный поиск (LIKE-фильтры)
  if (filters.searchName) params.append("searchName", filters.searchName);
  if (filters.positionFilter) params.append("positionFilter", filters.positionFilter);
  // Параметры пагинации и сортировки
  if (pagination.page !== undefined) params.append("page", pagination.page.toString());
  if (pagination.pageSize !== undefined) params.append("pageSize", pagination.pageSize.toString());
  if (pagination.sortField) params.append("sortField", pagination.sortField);
  if (pagination.sortOrder) params.append("sortOrder", pagination.sortOrder);

  const { data } = await api.get<PaginatedResponse<ManagerListItem>>("/api/employees/managers", { params });
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
