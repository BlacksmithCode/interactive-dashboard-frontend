import { Box, Alert, LinearProgress, Typography, 
  Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import { DashboardFiltersProvider, useComputedSummaryStats, useDashboardFilters } from "@/features/dashboard";
import {
  RoleSuccessionOverview,
  NineBoxMatrix,
  SummaryStatsSkeleton,
  DomainInsightsPanel,
  PotentialAreaCharts,
} from "@/features/dashboard/ui";
import { downloadPdfExport } from "@/features/dashboard/api/export";
import { downloadFile } from "@/shared/lib/download";
import { useAuth, ROLES } from "@/entities/user";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import { colors } from "@/shared/theme/tokens";

export default function SummaryStats() {
  return (
    <DashboardFiltersProvider>
      <SummaryStatsContent />
    </DashboardFiltersProvider>
  );
}

function SummaryStatsContent() {
  const { role } = useAuth();
  const { filters } = useDashboardFilters();
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

  const isPdfExportAvailable = role !== ROLES.MANAGER;

  const handleExportPdf = async () => {
    try {
      const blob = await downloadPdfExport({
        gradeMin: filters.gradeMin,
        domain: filters.domain,
      });
      downloadFile(blob, "dashboard_report.pdf");
    } catch (err) {
      console.error("Ошибка при экспорте PDF:", err);
    }
  };

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

  return (
    <Box>
      {(sLoading || nLoading) && <LinearProgress />}

      {isPdfExportAvailable && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportPdf}
          >
            Экспорт в PDF
          </Button>
        </Box>
      )}

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
          <Box sx={{ backgroundColor: colors.blueDark, borderRadius: '12px', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: colors.white, pt: 2 }}>
              Матрица потенциала
            </Typography>
            <NineBoxMatrix mergedCells={mergedCells} />
          </Box>
          
          <Accordion 
            sx={{ 
              backgroundColor: colors.blueDark,
              borderRadius: '12px !important',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              overflow: 'hidden',
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.white }} />}
              sx={{
                backgroundColor: colors.bluePrimary,
                borderRadius: '12px',
                '& .MuiAccordionSummary-content': { justifyContent: 'center', margin: '12px 0' },
                '& .MuiAccordionSummary-expandIconWrapper': { position: 'absolute', right: 16 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: colors.white }}>
                Область потенциала
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, backgroundColor: colors.blueDark }}>
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
    </Box>
  );
}