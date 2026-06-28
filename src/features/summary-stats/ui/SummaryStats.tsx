import { Box, Alert, LinearProgress, Typography,
  Accordion, AccordionSummary, AccordionDetails, useTheme } from "@mui/material";
import { DashboardFiltersProvider, useComputedSummaryStats } from "@/features/dashboard";
import {
  RoleSuccessionOverview,
  NineBoxMatrix,
  SummaryStatsSkeleton,
  DomainInsightsPanel,
  PotentialAreaCharts,
} from "@/features/dashboard/ui";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { colors } from "@/shared/theme/tokens";

export default function SummaryStats() {
  return (
    <DashboardFiltersProvider>
      <SummaryStatsContent />
    </DashboardFiltersProvider>
  );
}

function SummaryStatsContent() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
          <Box sx={{
            backgroundColor: isDark ? colors.surfaceVariantDark : colors.primary,
            borderRadius: '12px',
            overflow: 'hidden',
            outline: '2px solid transparent',
            transition: 'outline-color 0.2s ease',
            '&:hover': { outlineColor: colors.primary },
          }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: colors.white, pt: 2 }}>
              Матрица потенциала
            </Typography>
            <NineBoxMatrix mergedCells={mergedCells} />
          </Box>
          
          <Accordion
            sx={{
              backgroundColor: isDark ? colors.surfaceDark : colors.primaryDark,
              borderRadius: '12px !important',
              boxShadow: 'none',
              '&:before': { display: 'none' },
              overflow: 'hidden',
              outline: '2px solid transparent',
              transition: 'outline-color 0.2s ease',
              '&:hover': { outlineColor: colors.primary },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon sx={{ color: colors.white }} />}
              sx={{
                backgroundColor: isDark ? colors.surfaceVariantDark : colors.primary,
                borderRadius: '12px',
                '& .MuiAccordionSummary-content': { justifyContent: 'center', margin: '12px 0' },
                '& .MuiAccordionSummary-expandIconWrapper': { position: 'absolute', right: 16 },
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', color: colors.white }}>
                Область потенциала
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, backgroundColor: isDark ? colors.surfaceDark : colors.primaryDark }}>
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