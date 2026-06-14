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
  const { filters, minGrade, maxGrade } = useDashboardFilters();
  const { data: stats, isLoading: sLoading, isError: sError } = useStatsQuery(filters);
  const { data: nineBox, isLoading: nLoading, isError: nError } = useNineBoxQuery(filters);
  const mergedCells = useMergedCells(nineBox);

  // 1. Получаем список критичных руководителей
  const { data: criticalLeadersRaw = [] } = useLeadersQuery({
    critical: true,
    gradeMin: filters.gradeMin,
  });

  const criticalLeaders = useMemo(() => {
    if (!filters.domain) return criticalLeadersRaw;
    return criticalLeadersRaw.filter((l) => l.domain === filters.domain);
  }, [criticalLeadersRaw, filters.domain]);

  // 2. Получаем общую статистику по доменам
  const { data: gist } = useDomainGistQuery({ gradeMin: filters.gradeMin });

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
    minGrade,
    maxGrade,
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