// src/features/dashboard/model/useLeadersSuccessors.ts

import { useState, useMemo } from "react";
import { useDashboardFilters } from "./useDashboardFilters";
import {
  useLeadersQuery,
  useTeamQuery,
  useSuccessorsQuery,
  useManagerDetailQuery,
} from "../hooks";
import { useAuth, ROLES } from "@/entities/user";
import type { ManagerListItem, SortField, SortOrder } from "@/entities/leader";

export const FIELD_MAP: Record<string, SortField> = {
  fullName: "fullName",
  grade: "grade",
  domain: "domain",
  position: "position",
  critical: "critical",
};

export function useLeadersSuccessors() {
  const { role } = useAuth();
  const {
    filters,
    availableDomains,
    debouncedSearchName,
    debouncedPositionFilter,
    criticalFilter,
    successorFilter,
  } = useDashboardFilters();

  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortField, setSortField] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder | undefined>(undefined);

  const paginationParams = useMemo(() => ({ page, pageSize, sortField, sortOrder }), [page, pageSize, sortField, sortOrder]);

  const {
    data: paginatedData,
    isLoading: leadersLoading,
    isError: leadersError,
    refetch: refetchLeaders,
  } = useLeadersQuery(
    {
      gradeMin: filters.gradeMin,
      domains: filters.domain ? [filters.domain] : undefined,
      critical: criticalFilter,
      hasSuccessor: successorFilter,
      searchName: debouncedSearchName || undefined,
      positionFilter: debouncedPositionFilter || undefined,
    },
    paginationParams,
  );

  // Возвращаем элементы как обычно, без очистки массива!
  const leaders = useMemo(() => paginatedData?.items ?? [], [paginatedData?.items]);
  const totalCount = useMemo(() => paginatedData?.totalCount ?? 0, [paginatedData?.totalCount]);

  const filteredNameOptions = useMemo(() => [], []);
  const filteredPositionOptions = useMemo(() => [], []);
  const filteredDomainOptions = useMemo(() => {
    return availableDomains ? [...availableDomains].sort() : [];
  }, [availableDomains]);
  
  const availableCriticalOptions = ["Да", "Нет"];
  const availableSuccessorOptions = ["Да", "Нет"];

  const handleSelectLeader = (leader: ManagerListItem) => {
    setSelectedLeader((prev) => (prev?.fullName === leader.fullName ? null : leader));
  };

  const handleResetSelection = () => setSelectedLeader(null);

  const { data: managerDetail, isLoading: detailLoading, isError: detailError } = useManagerDetailQuery(selectedLeader?.fullName);
  const { data: team = [], isLoading: teamLoading, isError: teamError, refetch: refetchTeam } = useTeamQuery(selectedLeader?.fullName);
  const { data: successors = [], isLoading: successorsLoading, isError: succError, refetch: refetchSucc } = useSuccessorsQuery(selectedLeader?.fullName);

  const isManagerOnly = role === ROLES.MANAGER;

  return {
    leaders,
    totalCount,
    leadersLoading,
    leadersError,
    refetchLeaders,
    page,
    setPage,
    pageSize,
    setPageSize,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    selectedLeader,
    handleSelectLeader,
    handleResetSelection,
    isListExpanded,
    setIsListExpanded,
    availableDomains,
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,
    availableCriticalOptions,
    availableSuccessorOptions,
    managerDetail,
    detailLoading,
    detailError,
    team,
    teamLoading,
    teamError,
    refetchTeam,
    successors,
    successorsLoading,
    succError,
    refetchSucc,
    isManagerOnly,
  };
}