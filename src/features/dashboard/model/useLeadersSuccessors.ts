import { useState, useMemo, useEffect } from "react";
import { useDashboardFilters } from "./useDashboardFilters";
import {
  useLeadersQuery,
  useTeamQuery,
  useSuccessorsQuery,
  useManagerDetailQuery,
} from "../hooks";
import { useAuth, ROLES } from "@/entities/user";
import type { ManagerListItem } from "@/entities/leader";

// Хелпер для форматирования должностей
const capitalizeFirstLetter = (str: string) => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export function useLeadersSuccessors() {
  const { role } = useAuth();
  const {
    filters,
    availableDomains,
    searchName,
    debouncedSearchName,
    positionFilter,
    debouncedPositionFilter,
    criticalFilter,
    successorFilter,
  } = useDashboardFilters();

  const [selectedLeader, setSelectedLeader] = useState<ManagerListItem | null>(null);
  const [isListExpanded, setIsListExpanded] = useState(true);

  // 1. Запрос списка руководителей с первичными фильтрами
  const {
    data: leaders = [],
    isLoading: leadersLoading,
    isError: leadersError,
    refetch: refetchLeaders,
  } = useLeadersQuery({
    gradeMin: filters.gradeMin,
    domains: filters.domain ? [filters.domain] : undefined,
    critical: criticalFilter,
    hasSuccessor: successorFilter,
  });

  // Оставляем только точное совпадение грейда
  const exactGradeLeaders = useMemo(() => {
    if (filters.gradeMin === undefined) return leaders;
    return leaders.filter((l) => l.grade === filters.gradeMin);
  }, [leaders, filters.gradeMin]);

  // 2. Локальная фильтрация и опции для Autocomplete
  const filteredNameOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (positionFilter.trim()) {
      const lowerPos = positionFilter.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.position.toLowerCase().includes(lowerPos));
    }
    const names = relevantLeaders.map((m) => m.fullName);
    if (!searchName.trim()) return names;
    return names.filter((name) => name.toLowerCase().includes(searchName.trim().toLowerCase()));
  }, [exactGradeLeaders, searchName, positionFilter]);

  const filteredPositionOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (searchName.trim()) {
      const lowerName = searchName.trim().toLowerCase();
      relevantLeaders = relevantLeaders.filter((l) => l.fullName.toLowerCase().includes(lowerName));
    }
    const positions = [...new Set(relevantLeaders.map((m) => capitalizeFirstLetter(m.position)))].sort();
    if (!positionFilter.trim()) return positions;
    return positions.filter((pos) => pos.toLowerCase().includes(positionFilter.trim().toLowerCase()));
  }, [exactGradeLeaders, searchName, positionFilter]);

  const filteredDomainOptions = useMemo(() => {
    let relevantLeaders = exactGradeLeaders;
    if (searchName.trim()) relevantLeaders = relevantLeaders.filter((l) => l.fullName.toLowerCase().includes(searchName.trim().toLowerCase()));
    if (positionFilter.trim()) relevantLeaders = relevantLeaders.filter((l) => l.position.toLowerCase().includes(positionFilter.trim().toLowerCase()));
    const activeDomains = new Set(relevantLeaders.map((m) => m.domain));
    if (filters.domain) activeDomains.add(filters.domain);
    return availableDomains.filter((d) => activeDomains.has(d));
  }, [exactGradeLeaders, searchName, positionFilter, availableDomains, filters.domain]);

  const filteredLeaders = useMemo(() => {
    let result = exactGradeLeaders;
    if (debouncedSearchName.trim()) result = result.filter((l) => l.fullName.toLowerCase().includes(debouncedSearchName.trim().toLowerCase()));
    if (debouncedPositionFilter.trim()) result = result.filter((l) => l.position.toLowerCase().includes(debouncedPositionFilter.trim().toLowerCase()));
    return result;
  }, [exactGradeLeaders, debouncedSearchName, debouncedPositionFilter]);

  const availableCriticalOptions = useMemo(() => Array.from(new Set(filteredLeaders.map(l => l.critical?.toString()).filter(Boolean))) as string[], [filteredLeaders]);
  const availableSuccessorOptions = useMemo(() => Array.from(new Set(filteredLeaders.map(l => {
    const ld = l as unknown as Record<string, unknown>;
    return typeof ld.hasSuccessor === 'boolean' 
      ? String(ld.hasSuccessor) 
      : String(typeof ld.successorsCount === 'number' && ld.successorsCount > 0);
  }))) as string[], [filteredLeaders]);

  // 3. Логика авто-выбора для менеджеров
  useEffect(() => {
    if (role === ROLES.MANAGER && filteredLeaders.length > 0 && !selectedLeader) {
      const timer = setTimeout(() => setSelectedLeader(filteredLeaders[0]), 0);
      return () => clearTimeout(timer);
    }
  }, [role, filteredLeaders, selectedLeader]);

  // 4. Загрузка детализации
  const { data: team = [], isLoading: teamLoading, isError: teamError, refetch: refetchTeam } = useTeamQuery(selectedLeader?.fullName);
  const { data: successors = [], isLoading: succLoading, isError: succError, refetch: refetchSucc } = useSuccessorsQuery(selectedLeader?.fullName);
  const { data: managerDetail, isLoading: detailLoading, isError: detailError } = useManagerDetailQuery(selectedLeader?.fullName);

  const handleRowClick = (params: { row: ManagerListItem }) => {
    setSelectedLeader(params.row);
    setIsListExpanded(false);
  };

  const handleResetSelection = () => {
    if (role !== ROLES.MANAGER) {
      setSelectedLeader(null);
      setIsListExpanded(true);
    }
  };

  return {
    role, leadersLoading, leadersError, refetchLeaders,
    filteredNameOptions, filteredPositionOptions, filteredDomainOptions, filteredLeaders,
    availableCriticalOptions, availableSuccessorOptions,
    selectedLeader, isListExpanded, setIsListExpanded,
    team, teamLoading, teamError, refetchTeam,
    successors, succLoading, succError, refetchSucc,
    managerDetail, detailLoading, detailError,
    handleRowClick, handleResetSelection,
  };
}