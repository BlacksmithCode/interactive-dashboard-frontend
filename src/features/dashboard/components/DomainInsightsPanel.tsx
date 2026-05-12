import { Box, Grid, Typography, Card, useTheme } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PieChart } from "@mui/x-charts/PieChart";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDomainGistQuery } from "../hooks/useDomainGistQuery";
import { useMemo } from "react";
import { GradeFilterInput } from "./GradeFilterInput";

interface DomainInsightsPanelProps {
  totalManagers: number;
  defaultMinGrade?: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
}

export function DomainInsightsPanel({
  totalManagers,
  defaultMinGrade,
  minPossibleGrade,
  maxPossibleGrade,
}: DomainInsightsPanelProps) {
  const theme = useTheme();
  const { filters, setGradeMin } = useDashboardFilters();
  const { data: gist, isLoading, isError } = useDomainGistQuery({ gradeMin: filters.gradeMin });

  const filteredGist = useMemo(() => {
    if (!gist) return [];
    if (filters.domain) {
      return gist.filter(d => d.domain === filters.domain);
    }
    return gist;
  }, [gist, filters.domain]);

  const chartData = useMemo(() => {
    if (!filteredGist.length) return {
      barSeriesSuccess: [], barSeriesFail: [],
      barXLabels: [], barXLabelsShort: [],
      totalWith: 0, totalWithout: 0, overallPercent: 0,
    };

    const barSeriesSuccess = filteredGist.map(d => d.managersWithSuccessors);
    const barSeriesFail = filteredGist.map(d => d.managersWithoutSuccessors);
    const barXLabels = filteredGist.map(d => d.domain);
    const barXLabelsShort = barXLabels.map(label =>
      label.length > 10 ? label.slice(0, 9) + '…' : label
    );

    const totalWith = barSeriesSuccess.reduce((a, b) => a + b, 0);
    const totalWithout = barSeriesFail.reduce((a, b) => a + b, 0);
    const overallPercent = (totalWith + totalWithout) > 0
      ? Math.round((totalWith / (totalWith + totalWithout)) * 100)
      : 0;

    return { barSeriesSuccess, barSeriesFail, barXLabels, barXLabelsShort, totalWith, totalWithout, overallPercent };
  }, [filteredGist]);

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        {/* Грейд + общее количество */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Всего руководителей ≥ грейда
            </Typography>
            {defaultMinGrade !== undefined ? (
              <GradeFilterInput
                value={filters.gradeMin}
                onChange={setGradeMin}
                defaultMinGrade={defaultMinGrade}
                minPossibleGrade={minPossibleGrade}
                maxPossibleGrade={maxPossibleGrade}
              />
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Загрузка...
              </Typography>
            )}
            <Typography variant="h2" sx={{ fontWeight: "bold" }}>
              {totalManagers}
            </Typography>
          </Box>
        </Grid>

        {/* Гистограмма */}
        <Grid size={{ xs: 12, md: 5 }}>
          {isLoading ? (
            <Typography>Загрузка данных по доменам…</Typography>
          ) : isError ? (
            <Typography color="error">Ошибка загрузки доменов</Typography>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {filters.domain 
                  ? `Домен: ${filters.domain}` 
                  : 'Все домены'}
              </Typography>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={filteredGist} margin={{ top: 20, right: 10, left: 0, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip />
                    <Legend wrapperStyle={{ bottom: 0 }} />
                    <Bar dataKey="managersWithSuccessors" name="С преемниками" fill={theme.palette.success.main} />
                    <Bar dataKey="managersWithoutSuccessors" name="Без преемников" fill={theme.palette.error.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </>
          )}
        </Grid>

        {/* Кольцевая диаграмма */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" align="center" sx={{ mb: 1 }}>
              Процент охвата преемниками по доменам
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" color="text.secondary" />
                <Typography variant="h6" sx={{ color: theme.palette.error.main, fontWeight: 'bold' }}>
                  {chartData.totalWithout > 0
                    ? Math.round((chartData.totalWithout / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
              <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <PieChart
                  series={[{
                    data: [
                      { id: "with", value: chartData.totalWith, color: theme.palette.success.main },
                      { id: "without", value: chartData.totalWithout, color: theme.palette.error.light },
                    ],
                    innerRadius: 60,
                    outerRadius: 80,
                  }]}
                  width={160} height={160}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                />
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" color="text.secondary" />
                <Typography variant="h6" sx={{ color: theme.palette.success.main, fontWeight: 'bold' }}>
                  {chartData.totalWithout > 0
                    ? Math.round((chartData.totalWith / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.error.main }} />
                <Typography variant="caption">Без преемников: {chartData.totalWithout}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                <Typography variant="caption">С преемниками: {chartData.totalWith}</Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}