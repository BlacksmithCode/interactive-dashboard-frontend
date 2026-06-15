//import { useNavigate } from "react-router-dom";
import { Box, Alert, LinearProgress, Typography, 
  Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { DashboardFiltersProvider, useComputedSummaryStats } from "@/features/dashboard";
import {
  RoleSuccessionOverview,
  NineBoxMatrix,
  SummaryStatsSkeleton,
  DomainInsightsPanel,
  PotentialAreaCharts,
} from "@/features/dashboard/ui";
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
  const {
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
  } = useComputedSummaryStats();

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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ backgroundColor: '#0088FF', borderRadius: '12px', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: 'white', pt: 2 }}>
              Матрица потенциала
            </Typography>
            <NineBoxMatrix mergedCells={mergedCells} nineBox={nineBox} />
          </Box>
          
          <Accordion 
            sx={{ 
              backgroundColor: '#0088FF',
              borderRadius: '12px !important',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
              sx={{
                backgroundColor: '#1DAFF7',
                borderRadius: '12px',
                '& .MuiAccordionSummary-content': { justifyContent: 'center', margin: '12px 0' },
                '& .MuiAccordionSummary-expandIconWrapper': { position: 'absolute', right: 16 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: 'white' }}>
                Область потенциала
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, backgroundColor: '#0088FF' }}>
              <PotentialAreaCharts nineBox={nineBox} totalManagers={totalManagers} />
            </AccordionDetails>
          </Accordion> 
        </Box>
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