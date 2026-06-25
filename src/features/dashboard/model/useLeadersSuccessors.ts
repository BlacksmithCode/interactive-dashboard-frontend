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

  // Аккумулятор уникальных имён и должностей для autocomplete
  // Храним связи: имя -> должность, должность -> множество имён
  const allNamesRef = useRef<Set<string>>(new Set());
  const allPositionsRef = useRef<Set<string>>(new Set());
  const nameToPositionRef = useRef<Map<string, string>>(new Map());
  const positionToNamesRef = useRef<Map<string, Set<string>>>(new Map());
  // Счетчик для триггера ре-рендера при изменении accumulator
  const [, forceUpdate] = useState(0);

  // Сбрасываем аккумуляторы при изменении фильтров (кроме текста)
  useEffect(() => {
    allNamesRef.current.clear();
    allPositionsRef.current.clear();
    nameToPositionRef.current.clear();
    positionToNamesRef.current.clear();
    forceUpdate(0);
  }, [filters.gradeMin, filters.domain, criticalFilter, successorFilter]);

  const paginationParams = useMemo(() => ({ page, pageSize, sortField, sortOrder }), [page, pageSize, sortField, sortOrder]);

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

  // Возвращаем элементы как обычно
  const leaders = useMemo(() => paginatedData?.items ?? [], [paginatedData?.items]);
  // totalCount для DataGrid — 0 до загрузки (чтобы не было Infinity в UI), реальное значение после
  // DataGrid разрешает переключение страниц даже с rowCount=0 в режиме server
  const totalCount = useMemo(() => paginatedData?.totalCount ?? 0, [paginatedData?.totalCount]);

  // Аккумулируем уникальные значения из каждой загруженной страницы
  useEffect(() => {
    if (leaders && leaders.length > 0) {
      let changed = false;
      leaders.forEach(leader => {
        // Аккумулируем имена и должности
        if (leader.fullName && !allNamesRef.current.has(leader.fullName)) {
          allNamesRef.current.add(leader.fullName);
          changed = true;
        }
        if (leader.position && !allPositionsRef.current.has(leader.position)) {
          allPositionsRef.current.add(leader.position);
          changed = true;
        }
        // Связываем имя с должностью
        if (leader.fullName && leader.position) {
          if (!nameToPositionRef.current.has(leader.fullName)) {
            nameToPositionRef.current.set(leader.fullName, leader.position);
            changed = true;
          }
          // Связываем должность с именами
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

  // Фильтруем аккумулированные варианты по текущему вводу (для autocomplete)
  // С учетом каскадной фильтрации: ФИО фильтруются по должности, должность по ФИО
  const filteredNameOptions = useMemo(() => {
    const allNamesArray = Array.from(allNamesRef.current);
    let filtered = allNamesArray;
    
    // Если выбрана должность - фильтруем имена по этой должности
    if (filters.domain) {
      // domain здесь не помогает, нужен positionFilter
    }
    if (debouncedPositionFilter) {
      filtered = filtered.filter(name => {
        const pos = nameToPositionRef.current.get(name);
        return pos && pos.toLowerCase().includes(debouncedPositionFilter.toLowerCase());
      });
    }
    
    // Фильтр по тексту поиска
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
    
    // Если есть поиск по ФИО - фильтруем должности по этим именам
    if (debouncedSearchName) {
      const matchingNames = Array.from(allNamesRef.current).filter((name: string) =>
        name.toLowerCase().includes(debouncedSearchName.toLowerCase())
      );
      const matchingPositions = new Set(
        matchingNames.map(name => nameToPositionRef.current.get(name)).filter(Boolean) as string[]
      );
      filtered = filtered.filter(pos => matchingPositions.has(pos));
    }
    
    // Фильтр по тексту должности
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