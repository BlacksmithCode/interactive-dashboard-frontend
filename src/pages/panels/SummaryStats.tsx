import { Box, Alert, Button, LinearProgress } from "@mui/material";
import { useDashboardFilters } from "../../features/dashboard/hooks/useDashboardFilters";
import { useStatsQuery } from "../../features/dashboard/hooks/useStatsQuery";
import { useNineBoxQuery } from "../../features/dashboard/hooks/useNineBoxQuery";
import { useMergedCells } from "../../features/dashboard/hooks/useMergedCells";
import { useLeadersQuery } from "../../features/dashboard/hooks/useLeadersQuery";
import { RoleSuccessionOverview } from "../../features/dashboard/components/RoleSuccessionOverview";
import { NineBoxMatrix } from "../../features/dashboard/components/NineBoxMatrix";
import { SummaryStatsSkeleton } from "../../features/dashboard/components/LoadingSkeleton";
import { DomainInsightsPanel } from "../../features/dashboard/components/DomainInsightsPanel";
import { DashboardFiltersProvider } from "../../features/dashboard/context/DashboardFiltersProvider";
import { useMemo } from "react";

export default function SummaryStats() {
  return (
    <DashboardFiltersProvider>
      <SummaryStatsContent />
    </DashboardFiltersProvider>
  );
}


function SummaryStatsContent() {
  const { filters } = useDashboardFilters();
  const { data: stats, isLoading: sLoading, isError: sError, refetch: refetchStats } = useStatsQuery(filters);
  const { data: nineBox, isLoading: nLoading, isError: nError, refetch: refetchNineBox } = useNineBoxQuery(filters);
  const mergedCells = useMergedCells(nineBox);

  const { data: allManagers } = useLeadersQuery({});
  const { data: criticalLeaders = [] } = useLeadersQuery({ 
  critical: true, 
  gradeMin: filters.gradeMin, 
  domain: filters.domain 
});

  const minGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.min(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  const maxGrade = useMemo(() => {
    if (!allManagers || allManagers.length === 0) return undefined;
    return Math.max(...allManagers.map((m) => m.grade));
  }, [allManagers]);

  // Показываем скелетон только если данных ещё нет и идёт первая загрузка
  if (!stats && !nineBox && (sLoading || nLoading)) {
    return <SummaryStatsSkeleton />;
  }

  if (sError || nError) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => { refetchStats(); refetchNineBox(); }}>
            Повторить
          </Button>
        }
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
      {/* Индикатор перезагрузки не удаляет панель */}
      {(sLoading || nLoading) && <LinearProgress />}

      <DomainInsightsPanel
        totalManagers={totalManagers}
        defaultMinGrade={minGrade}
        minPossibleGrade={minGrade}
        maxPossibleGrade={maxGrade}
      />

      {stats && (
        <RoleSuccessionOverview 
          stats={stats}
          criticalLeaders={criticalLeaders}
          totalManagers={totalManagers}
        />
      )}
      {mergedCells && <NineBoxMatrix mergedCells={mergedCells} />}
    </Box>
  );
}