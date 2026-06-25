/**
 * @file API-функции для экспорта данных (Excel и PDF).
 */
import { api } from "@/shared/api";
import type { AxiosRequestConfig } from "axios";

/** Базовые параметры фильтров, общие для всех эндпоинтов экспорта */
export interface ExportFilters {
  gradeMin?: number;
  domain?: string;
  critical?: boolean;
  hasSuccessor?: boolean;
  searchName?: string;
  positionFilter?: string;
}

/**
 * Скачивает Excel-файл с руководителями и преемниками.
 * Эндпоинт: GET /api/employees/export
 */
export async function downloadExcelExport(
  filters: ExportFilters,
  signal?: AbortSignal
): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters.gradeMin !== undefined) params.set("gradeMin", String(filters.gradeMin));
  if (filters.domain) params.set("domains", filters.domain);
  if (filters.critical !== undefined) params.set("critical", String(filters.critical));
  if (filters.hasSuccessor !== undefined) params.set("hasSuccessor", String(filters.hasSuccessor));
  if (filters.searchName) params.set("searchName", filters.searchName);
  if (filters.positionFilter) params.set("positionFilter", filters.positionFilter);

  const config: AxiosRequestConfig = {
    url: "/api/employees/export",
    method: "GET",
    params: params.toString() ? new URLSearchParams(params.toString()) : undefined,
    responseType: "blob",
    signal,
  };

  const response = await api(config);
  return response.data;
}

/**
 * Скачивает PDF-файл со сводной статистикой дашборда.
 * Эндпоинт: GET /api/dashboard/export
 */
export async function downloadPdfExport(
  filters: Omit<ExportFilters, "critical" | "hasSuccessor" | "searchName" | "positionFilter">,
  signal?: AbortSignal
): Promise<Blob> {
  const params = new URLSearchParams();
  if (filters.gradeMin !== undefined) params.set("gradeMin", String(filters.gradeMin));
  if (filters.domain) params.set("domains", filters.domain);

  const config: AxiosRequestConfig = {
    url: "/api/dashboard/export",
    method: "GET",
    params: params.toString() ? new URLSearchParams(params.toString()) : undefined,
    responseType: "blob",
    signal,
  };

  const response = await api(config);
  return response.data;
}
