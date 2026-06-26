import { useState, useEffect } from "react";
import { fetchAuditLogs, type AuditLog, type AuditLogFilters } from "../api/auditApi";

export function useAuditLogs() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadLogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetchAuditLogs({
          ...filters,
          page,
          size: pageSize,
          sort: "timestamp,desc",
        });
        if (!cancelled) {
          setLogs(response.content);
          setTotalCount(response.totalElements);
        }
      } catch (error) {
        console.error("Не удалось загрузить журнал аудита:", error);
        if (!cancelled) {
          setLogs([]);
          setTotalCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadLogs();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, filters]);

  return {
    logs,
    isLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    setFilters,
    totalCount,
  };
}
