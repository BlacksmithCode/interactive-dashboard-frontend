// src/features/dashboard/model/useLeadersSuccessors.ts
/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */

import { useState, useMemo, useRef, useEffect } from "react";
import { useDashboardFilters } from "./useDashboardFilters";
import {
  useLeadersQuery,
  useTeamQuery,
  useSuccessorsQuery,
  useManagerDetailQuery,
} from "../hooks";
import { useAuth, ROLES } from "@/entities/user";
import type { ManagerListItem, SortField, SortOrder, ServerPaginationParams } from "@/entities/leader";

export const FIELD_MAP: Record<string, string> = {
  fullName: "full_name",
  grade: "grade",
  domain: "domain",
  position: "position",
  critical: "critical",
  potential: "potential",
  performance: "performance",
  assessment360: "assessment_360",
  era: "era",
  box: "potential",
  boxInterpretation: "performance",
  developmentProgram: "development_program",
  careerStatus: "career_status",
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

  const allNamesRef = useRef<Set<string>>(new Set());
  const allPositionsRef = useRef<Set<string>>(new Set());
  const nameToPositionRef = useRef<Map<string, string>>(new Map());
  const positionToNamesRef = useRef<Map<string, Set<string>>>(new Map());
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    allNamesRef.current.clear();
    allPositionsRef.current.clear();
    nameToPositionRef.current.clear();
    positionToNamesRef.current.clear();
    forceUpdate(0);
  }, [filters.gradeMin, filters.domain, criticalFilter, successorFilter]);

  const paginationParams = useMemo<ServerPaginationParams>(() => {
    const mappedSortField = sortField ? (FIELD_MAP[sortField] ?? undefined) : undefined;
    return {
      page,
      pageSize,
      sortField: mappedSortField,
      sortOrder,
    };
  }, [page, pageSize, sortField, sortOrder]);

  const leadersQuery = useLeadersQuery(
    {
      grade: filters.gradeMin,
      domains: filters.domain ? [filters.domain] : undefined,
      critical: criticalFilter,
      hasSuccessor: successorFilter,
      searchName: debouncedSearchName || undefined,
      positionFilter: debouncedPositionFilter || undefined,
    },
    paginationParams,
  );

  const {
    data: paginatedData,
    isLoading: leadersLoading,
    isFetching: leadersFetching,
    isError: leadersError,
    refetch: refetchLeaders,
  } = leadersQuery;

  const leaders = useMemo(() => paginatedData?.items ?? [], [paginatedData?.items]);
  const totalCount = useMemo(() => paginatedData?.totalCount ?? 0, [paginatedData?.totalCount]);

  useEffect(() => {
    if (leaders && leaders.length > 0) {
      let changed = false;
      leaders.forEach(leader => {
        if (leader.fullName && !allNamesRef.current.has(leader.fullName)) {
          allNamesRef.current.add(leader.fullName);
          changed = true;
        }
        if (leader.position && !allPositionsRef.current.has(leader.position)) {
          allPositionsRef.current.add(leader.position);
          changed = true;
        }
        if (leader.fullName && leader.position) {
          if (!nameToPositionRef.current.has(leader.fullName)) {
            nameToPositionRef.current.set(leader.fullName, leader.position);
            changed = true;
          }
          if (!positionToNamesRef.current.has(leader.position)) {
            positionToNamesRef.current.set(leader.position, new Set());
          }
          const namesSet = positionToNamesRef.current.get(leader.position)!;
          if (!namesSet.has(leader.fullName)) {
            namesSet.add(leader.fullName);
            changed = true;
          }
        }
      });
      if (changed) {
        forceUpdate(n => n + 1);
      }
    }
  }, [leaders]);

  const filteredNameOptions = useMemo(() => {
    const allNamesArray = Array.from(allNamesRef.current);
    let filtered = allNamesArray;
    
    if (filters.domain) {
      // domain здесь не помогает, нужен positionFilter
    }
    if (debouncedPositionFilter) {
      filtered = filtered.filter(name => {
        const pos = nameToPositionRef.current.get(name);
        return pos && pos.toLowerCase().includes(debouncedPositionFilter.toLowerCase());
      });
    }
    
    if (debouncedSearchName) {
      filtered = filtered.filter(name =>
        name.toLowerCase().includes(debouncedSearchName.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.localeCompare(b)).slice(0, 100);
  }, [debouncedSearchName, debouncedPositionFilter, filters.domain]);

  const filteredPositionOptions = useMemo(() => {
    const allPositionsArray = Array.from(allPositionsRef.current);
    let filtered = allPositionsArray;
    
    if (debouncedSearchName) {
      const matchingNames = Array.from(allNamesRef.current).filter((name: string) =>
        name.toLowerCase().includes(debouncedSearchName.toLowerCase())
      );
      const matchingPositions = new Set(
        matchingNames.map(name => nameToPositionRef.current.get(name)).filter(Boolean) as string[]
      );
      filtered = filtered.filter(pos => matchingPositions.has(pos));
    }
    
    if (debouncedPositionFilter) {
      filtered = filtered.filter(pos =>
        pos.toLowerCase().includes(debouncedPositionFilter.toLowerCase())
      );
    }
    
    return filtered.sort((a, b) => a.localeCompare(b)).slice(0, 100);
  }, [debouncedSearchName, debouncedPositionFilter]);

  const filteredDomainOptions = useMemo(() => {
    return availableDomains ? [...availableDomains].sort() : [];
  }, [availableDomains]);
  
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
    leadersFetching,
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
    debouncedSearchName,
    debouncedPositionFilter,
    filteredNameOptions,
    filteredPositionOptions,
    filteredDomainOptions,
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
