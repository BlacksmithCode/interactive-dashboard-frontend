import { Box, Grid, Alert, Button } from "@mui/material";
import { useDashboardFilters } from "../../features/dashboard/hooks/useDashboardFilters";
import { useStatsQuery } from "../../features/dashboard/hooks/useStatsQuery";
import { useNineBoxQuery } from "../../features/dashboard/hooks/useNineBoxQuery";
import { useMergedCells } from "../../features/dashboard/hooks/useMergedCells";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { KpiCard } from "../../features/dashboard/components/KpiCard";
import { NineBoxMatrix } from "../../features/dashboard/components/NineBoxMatrix";
import { SummaryStatsSkeleton } from "../../features/dashboard/components/LoadingSkeleton";
import { DomainInsightsPanel } from "../../features/dashboard/components/DomainInsightsPanel";
import { CriticalRolesPanel } from "../../features/dashboard/components/CriticalRolesPanel";
import { useMemo } from "react";

/** Панель сводной статистики: KPI-карточки + матрица 9-box */
export default function SummaryStats() {
  const { filters } = useDashboardFilters();

  const { data: stats, isLoading: sLoading, isError: sError, refetch: refetchStats } = useStatsQuery(filters);
  const { data: nineBox, isLoading: nLoading, isError: nError, refetch: refetchNineBox } = useNineBoxQuery(filters);
  const mergedCells = useMergedCells(nineBox);

  // получаем всех руководителей для вычисления минимального грейда
  const { data: allManagers } = useLeadersQuery({}); // без фильтров – весь список
  
  const minGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.min(...allManagers.map(m => m.grade));
    }, [allManagers]);

  const maxGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.max(...allManagers.map(m => m.grade));
    }, [allManagers]);

  if (sLoading || nLoading) return <SummaryStatsSkeleton />;
  if (sError || nError) {
    return (
      <Alert severity="error"
        action={<Button color="inherit" size="small" onClick={() => { refetchStats(); refetchNineBox(); }}>Повторить</Button>}
      >
        Ошибка загрузки данных
      </Alert>
    );
  }

  const totalManagers = stats
    ? stats.managersWithSuccessors + stats.managersWithoutSuccessors
    : 0;

  return (
    <Box>
      {/* передаём минимальный грейд по умолчанию */}
      <DomainInsightsPanel
        totalManagers={totalManagers}
        defaultMinGrade={minGrade}
        minPossibleGrade={minGrade}
        maxPossibleGrade={maxGrade}
      />
      {/* KPI-карточки */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <KpiCard title="Критические роли" value={stats.criticalRoles} total={totalManagers} />
          <KpiCard title="Крит. с преемниками" value={stats.criticalRolesWithSuccessors} total={totalManagers} color="success.light" />
          <KpiCard title="Крит. без преемника" value={stats.criticalRolesWithoutSuccessors} total={totalManagers} color="error.light" />
        </Grid>
      )}
      <CriticalRolesPanel />
      {/* Матрица 9-box */}
      {mergedCells && <NineBoxMatrix mergedCells={mergedCells} />}
    </Box>
  );
}