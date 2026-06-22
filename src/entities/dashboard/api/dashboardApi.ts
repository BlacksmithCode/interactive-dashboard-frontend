import { api } from "@/shared/api/apiClient";
import type { DashboardFilters, StatsResponse, NineBoxResponse, DomainGistDto } from "../model/types";

export interface DashboardMetaDto {
  minGrade: number;
  maxGrade: number;
  availableDomains: string[];
}

export interface GradeRangeResponse {
  minGrade: number;
  maxGrade: number;
}

export async function fetchGradeRange(domains?: string[]): Promise<GradeRangeResponse> {
  const params = new URLSearchParams();
  if (domains && domains.length > 0) {
    domains.forEach(d => params.append("domains", d));
  }
  const { data } = await api.get<GradeRangeResponse>("/api/dashboard/grade-range", { params });
  return data;
}

export async function fetchDashboardMeta(params?: DashboardFilters): Promise<DashboardMetaDto> {
  const searchParams = new URLSearchParams();
  if (params?.domain) searchParams.append("domains", params.domain);
  if (params?.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params?.critical !== undefined) searchParams.append("critical", params.critical.toString());
  if (params?.hasSuccessor !== undefined) searchParams.append("hasSuccessor", params.hasSuccessor.toString());
  if (params?.searchName) searchParams.append("searchName", params.searchName);
  if (params?.positionFilter) searchParams.append("positionFilter", params.positionFilter);
  const { data } = await api.get<DashboardMetaDto>("/api/dashboard/meta", { params: searchParams });
  return data;
}

export async function fetchStats(params: DashboardFilters): Promise<StatsResponse> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domain) searchParams.append("domains", params.domain);
  if (params.critical !== undefined) searchParams.append("critical", params.critical.toString());
  if (params.hasSuccessor !== undefined) searchParams.append("hasSuccessor", params.hasSuccessor.toString());
  if (params.searchName) searchParams.append("searchName", params.searchName);
  if (params.positionFilter) searchParams.append("positionFilter", params.positionFilter);
  const { data } = await api.get<StatsResponse>("/api/dashboard/stats", { params: searchParams });
  return data;
}

export async function fetchNineBox(params: DashboardFilters): Promise<NineBoxResponse> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domain) searchParams.append("domains", params.domain);
  if (params.critical !== undefined) searchParams.append("critical", params.critical.toString());
  if (params.hasSuccessor !== undefined) searchParams.append("hasSuccessor", params.hasSuccessor.toString());
  if (params.searchName) searchParams.append("searchName", params.searchName);
  if (params.positionFilter) searchParams.append("positionFilter", params.positionFilter);
  const { data } = await api.get<NineBoxResponse>("/api/dashboard/9box", { params: searchParams });
  return data;
}

export async function fetchDomainGist(params: { gradeMin?: number; domains?: string[]; critical?: boolean; hasSuccessor?: boolean; searchName?: string; positionFilter?: string }): Promise<DomainGistDto[]> {
  const searchParams = new URLSearchParams();
  if (params.gradeMin !== undefined) searchParams.append("gradeMin", params.gradeMin.toString());
  if (params.domains && params.domains.length > 0) {
    params.domains.forEach(d => searchParams.append("domains", d));
  }
  if (params.critical !== undefined) searchParams.append("critical", params.critical.toString());
  if (params.hasSuccessor !== undefined) searchParams.append("hasSuccessor", params.hasSuccessor.toString());
  if (params.searchName) searchParams.append("searchName", params.searchName);
  if (params.positionFilter) searchParams.append("positionFilter", params.positionFilter);
  const { data } = await api.get<DomainGistDto[]>("/api/dashboard/gist", { params: searchParams });
  return data;
}
