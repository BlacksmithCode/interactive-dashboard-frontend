import { api } from "@/shared/api/apiClient";

export interface AuditLog {
  id: number;
  timestamp: string;
  userId: number;
  username: string;
  action: string;
  target: string;
  details: string;
}

export interface AuditLogFilters {
  from?: string;
  to?: string;
  action?: string;
  username?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface AuditLogPageResponse {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogPageResponse> {
  const params = new URLSearchParams();
  
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.action) params.append("action", filters.action);
  if (filters.username) params.append("username", filters.username);
  if (filters.page !== undefined) params.append("page", filters.page.toString());
  if (filters.size !== undefined) params.append("size", filters.size.toString());
  if (filters.sort) params.append("sort", filters.sort);

  const { data } = await api.get<AuditLogPageResponse>("/api/users/logs", { params });
  return data;
}
