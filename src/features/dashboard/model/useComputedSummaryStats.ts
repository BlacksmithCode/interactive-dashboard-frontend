import { useMemo } from "react";
import { useDashboardFilters } from "./useDashboardFilters";
import {
  useStatsQuery,
  useNineBoxQuery,
  useMergedCells,
  useLeadersQuery,
  useDomainGistQuery,
} from "../hooks";

export function useComputedSummaryStats() {
  const fullFilters = useDashboardFilters();
  const filters = {
    gradeMin: fullFilters.filters.gradeMin,
    domain: fullFilters.filters.domain,
    critical: fullFilters.criticalFilter,
    hasSuccessor: fullFilters.successorFilter,
    searchName: fullFilters.debouncedSearchName || undefined,
    positionFilter: fullFilters.debouncedPositionFilter || undefined,
  };
  
  const { data: stats, isLoading: sLoading, isError: sError } = useStatsQuery({
    gradeMin: filters.gradeMin,
    domain: filters.domain,
    critical: filters.critical,
    hasSuccessor: filters.hasSuccessor,
    searchName: filters.searchName,
    positionFilter: filters.positionFilter,
  });
  const { data: nineBox, isLoading: nLoading, isError: nError } = useNineBoxQuery({
    gradeMin: filters.gradeMin,
    domain: filters.domain,
    critical: filters.critical,
    hasSuccessor: filters.hasSuccessor,
    searchName: filters.searchName,
    positionFilter: filters.positionFilter,
  });
  const mergedCells = useMergedCells(nineBox);

  // 1. Получаем список критичных руководителей
  const { data: criticalLeadersPaginated } = useLeadersQuery({
    critical: true,
    gradeMin: filters.gradeMin,
    domains: filters.domain ? [filters.domain] : undefined,
    hasSuccessor: filters.hasSuccessor,
    searchName: filters.searchName,
    positionFilter: filters.positionFilter,
  }, { pageSize: 100 });

  const criticalLeaders = useMemo(() => {
    return criticalLeadersPaginated?.items ?? [];
  }, [criticalLeadersPaginated?.items]);

  // 2. Получаем общую статистику по доменам
  const { data: gist } = useDomainGistQuery({ 
    gradeMin: filters.gradeMin,
    domains: filters.domain ? [filters.domain] : undefined,
    critical: filters.critical,
    hasSuccessor: filters.hasSuccessor,
    searchName: filters.searchName,
    positionFilter: filters.positionFilter,
  });

  const domainTotals = useMemo(() => {
    if (!gist) return null;
    let currentGist = gist;
    if (filters.domain) {
      currentGist = gist.filter((d) => d.domain === filters.domain);
    }
    const totalWith = currentGist.reduce((sum, d) => sum + d.managersWithSuccessors, 0);
    const totalWithout = currentGist.reduce((sum, d) => sum + d.managersWithoutSuccessors, 0);
    return { totalWith, totalWithout, total: totalWith + totalWithout };
  }, [gist, filters.domain]);

  // 3. Вычисляем правильную статистику
  const computedStats = useMemo(() => {
    if (!stats) return undefined;
    if (!filters.domain || !domainTotals) return stats;

    const criticalTotal = criticalLeaders.length;
    const criticalWith = criticalLeaders.filter((l) => l.hasSuccessor).length;
    const criticalWithout = criticalTotal - criticalWith;

    const nonCriticalTotal = domainTotals.total - criticalTotal;
    const nonCriticalWith = domainTotals.totalWith - criticalWith;
    const nonCriticalWithout = domainTotals.totalWithout - criticalWithout;

    return {
      ...stats,
      criticalRoles: criticalTotal,
      criticalRolesWithSuccessors: criticalWith,
      criticalRolesWithoutSuccessors: criticalWithout,
      nonCriticalRoles: nonCriticalTotal > 0 ? nonCriticalTotal : 0,
      nonCriticalRolesWithSuccessors: nonCriticalWith > 0 ? nonCriticalWith : 0,
      nonCriticalRolesWithoutSuccessors: nonCriticalWithout > 0 ? nonCriticalWithout : 0,
      managersWithSuccessors: domainTotals.totalWith,
      managersWithoutSuccessors: domainTotals.totalWithout,
    };
  }, [stats, filters.domain, domainTotals, criticalLeaders]);

  const totalManagers = computedStats
    ? computedStats.managersWithSuccessors + computedStats.managersWithoutSuccessors
    : 0;

  return {
    minGrade: fullFilters.minGrade,
    maxGrade: fullFilters.maxGrade,
    sLoading,
    nLoading,
    sError,
    nError,
    nineBox,
    mergedCells,
    criticalLeaders,
    computedStats,
    totalManagers,
  };
}