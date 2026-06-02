//import { useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { Box, Alert, LinearProgress, Typography, 
  Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import {
  useDashboardFilters,
  useStatsQuery,
  useNineBoxQuery,
  useMergedCells,
  useLeadersQuery,
  useDomainGistQuery,
} from "../hooks";
import {
  RoleSuccessionOverview,
  NineBoxMatrix,
  SummaryStatsSkeleton,
  DomainInsightsPanel,
} from "../components";
import { DashboardFiltersProvider } from "../context/DashboardFiltersProvider";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function SummaryStats() {
  return (
    <DashboardFiltersProvider>
      <SummaryStatsContent />
    </DashboardFiltersProvider>
  );
}

function SummaryStatsContent() {
//  const navigate = useNavigate();
  const { filters, minGrade, maxGrade } = useDashboardFilters();
  const { data: stats, isLoading: sLoading, isError: sError } = useStatsQuery(filters);
  const { data: nineBox, isLoading: nLoading, isError: nError } = useNineBoxQuery(filters);
  const mergedCells = useMergedCells(nineBox);

  // 1. Получаем список критичных руководителей (без учета домена, чтобы кэшировать всех)
  const { data: criticalLeadersRaw = [] } = useLeadersQuery({
    critical: true,
    gradeMin: filters.gradeMin,
  });

  // Локально фильтруем критичных руководителей по домену
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

  // 3. Вычисляем правильную статистику для RoleSuccessionOverview локально
  const computedStats = useMemo(() => {
    if (!stats) return undefined;
    if (!filters.domain || !domainTotals) return stats;

    const criticalTotal = criticalLeaders.length;
    const criticalWith = criticalLeaders.filter(l => l.hasSuccessor).length;
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

  if (!computedStats && !nineBox && (sLoading || nLoading)) {
    return <SummaryStatsSkeleton />;
  }

  if (sError || nError) {
    return (
      <Alert
        severity="error"
      >
        Ошибка загрузки данных
      </Alert>
    );
  }

  const totalManagers = computedStats
    ? computedStats.managersWithSuccessors + computedStats.managersWithoutSuccessors
    : 0;

  // Если нужна ссылка на список руководителей, раскомментируйте её ниже.
  // const handleTotalClick = () => {
  //   const params = new URLSearchParams();
  //   if (filters.gradeMin) params.set("gradeMin", String(filters.gradeMin));
  //   if (filters.domain) params.set("domain", filters.domain);
  //   navigate(`/dashboard/leaders?${params.toString()}`);
  // };

  return (
    <Box>
      {(sLoading || nLoading) && <LinearProgress />}

      <DomainInsightsPanel
        totalManagers={totalManagers}
        minPossibleGrade={minGrade}
        maxPossibleGrade={maxGrade}
      />

      {computedStats && (
        <RoleSuccessionOverview
          stats={computedStats}
          criticalLeaders={criticalLeaders}
          totalManagers={totalManagers}
        />
      )}

      {mergedCells && nineBox ? (
<Accordion 
  defaultExpanded 
  sx={{ 
    backgroundColor: '#0088FF',   // фон деталей и фона аккордеона
    borderRadius: '12px',
    boxShadow: 'none',
    '&:before': { display: 'none' },
    overflow: 'hidden',
  }}
>
  <AccordionSummary
    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
    sx={{
      backgroundColor: '#1DAFF7',
      borderRadius: '12px',      // полное скругление
      '& .MuiAccordionSummary-content': { justifyContent: 'center', margin: '12px 0' },
      '& .MuiAccordionSummary-expandIconWrapper': { position: 'absolute', right: 16 },
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
      Матрица потенциала
    </Typography>
  </AccordionSummary>
  <AccordionDetails sx={{ p: 0, backgroundColor: '#0088FF' }}>
    <NineBoxMatrix mergedCells={mergedCells} nineBox={nineBox} />
  </AccordionDetails>
</Accordion> 
      ) : (
        <Box sx={{ mt: 2, p: 2, border: '1px dashed grey.300', borderRadius: 1, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Нет данных для матрицы потенциала
          </Typography>
        </Box>
      )}

      {/* Если нужна ссылка на список руководителей, раскомментируйте этот блок */}
      {/* <Box sx={{ mt: 3, textAlign: "center" }}>
        <Link component="button" variant="body2" onClick={handleTotalClick} sx={{ textDecoration: "underline", cursor: "pointer" }}>
          Открыть список всех руководителей ({totalManagers}) с текущими фильтрами
        </Link>
      </Box> */}
    </Box>
  );
}