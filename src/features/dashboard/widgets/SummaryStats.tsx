import { useNavigate } from "react-router-dom";
import { Box, Alert, Button, LinearProgress, Link, Typography } from "@mui/material";
import {
  useDashboardFilters,
  useStatsQuery,
  useNineBoxQuery,
  useMergedCells,
  useLeadersQuery,
} from "../hooks";
import {
  RoleSuccessionOverview,
  NineBoxMatrix,
  SummaryStatsSkeleton,
  DomainInsightsPanel,
} from "../components";
import { DashboardFiltersProvider } from "../context/DashboardFiltersProvider";

export default function SummaryStats() {
  return (
    <DashboardFiltersProvider>
      <SummaryStatsContent />
    </DashboardFiltersProvider>
  );
}

function SummaryStatsContent() {
  const navigate = useNavigate();
  const { filters, minGrade, maxGrade } = useDashboardFilters();
  const { data: stats, isLoading: sLoading, isError: sError, refetch: refetchStats } = useStatsQuery(filters);
  const { data: nineBox, isLoading: nLoading, isError: nError, refetch: refetchNineBox } = useNineBoxQuery(filters);
  const mergedCells = useMergedCells(nineBox);

  const { data: criticalLeaders = [] } = useLeadersQuery({
    critical: true,
    gradeMin: filters.gradeMin,
    domain: filters.domain,
  });

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

  const handleTotalClick = () => {
    const params = new URLSearchParams();
    if (filters.gradeMin) params.set("gradeMin", String(filters.gradeMin));
    if (filters.domain) params.set("domain", filters.domain);
    navigate(`/dashboard/leaders?${params.toString()}`);
  };

  return (
    <Box>
      {(sLoading || nLoading) && <LinearProgress />}

      <DomainInsightsPanel
        totalManagers={totalManagers}
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

      {mergedCells && nineBox ? (
        <NineBoxMatrix mergedCells={mergedCells} nineBox={nineBox} />
      ) : (
        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey.300', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для матрицы потенциала
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link
          component="button"
          variant="body2"
          onClick={handleTotalClick}
          sx={{ textDecoration: "underline", cursor: "pointer" }}
        >
          Открыть список всех руководителей ({totalManagers}) с текущими фильтрами
        </Link>
      </Box>
    </Box>
  );
}