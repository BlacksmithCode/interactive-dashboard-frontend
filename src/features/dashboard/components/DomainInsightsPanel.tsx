import { Box, Grid, Typography, Card, useTheme, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PieChart } from "@mui/x-charts/PieChart";
import { useDashboardFilters, useDomainGistQuery } from "../hooks";
import { useMemo } from "react";
import { GradeFilterInput } from "./GradeFilterInput";

interface DomainInsightsPanelProps {
  totalManagers: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
}

// Константы цветов
const LEFT_BLOCK_BG = "#0088ff";
const CARD_BG = "#1DAFF7";
const TEXT_COLOR = "white";

// Стили для полей ввода на левом блоке (синий фон)


// Стили для Select на общем фоне
const selectSx = {
  backgroundColor: '#0088FF',
  color: 'white',
  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'white' },
  '& .MuiSvgIcon-root': { color: 'white' },
  // Лейбл всегда белый, даже при фокусе
  '& .MuiInputLabel-root': { color: 'white !important' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'white !important' },
  '& .MuiInputBase-input': { color: 'white' },
};

export function DomainInsightsPanel({
  totalManagers,
  minPossibleGrade,
  maxPossibleGrade,
}: DomainInsightsPanelProps) {
  const theme = useTheme();
  const { filters, setGradeMin, setDomain, availableDomains } = useDashboardFilters();
  const { data: gist, isLoading, isError } = useDomainGistQuery({ gradeMin: filters.gradeMin });

  const filteredGist = useMemo(() => {
    if (!gist) return [];
    if (filters.domain) {
      return gist.filter((d) => d.domain === filters.domain);
    }
    return gist;
  }, [gist, filters.domain]);  

  const chartData = useMemo(() => {
    if (!filteredGist.length) {
      return { totalWith: 0, totalWithout: 0 };
    }
    const totalWith = filteredGist.reduce((sum, d) => sum + d.managersWithSuccessors, 0);
    const totalWithout = filteredGist.reduce((sum, d) => sum + d.managersWithoutSuccessors, 0);
    return { totalWith, totalWithout };
  }, [filteredGist]);

  const pieData = [
    { id: "with", value: chartData.totalWith || 0, color: theme.palette.success.main },
    { id: "without", value: chartData.totalWithout || 0, color: theme.palette.error.light },
  ];

  return (
    <Card variant="outlined" sx={{ mb: 4, backgroundColor: CARD_BG, color: TEXT_COLOR }}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        
        {/* Левый блок: фон #0088FF */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",      // центрируем по горизонтали
              height: "100%",            // растягиваем на всю высоту Grid
              textAlign: "center",
              color: TEXT_COLOR,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1, color: TEXT_COLOR }}>
              Всего руководителей ≥ грейда
            </Typography>
            
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <GradeFilterInput
                  value={filters.gradeMin}
                  onChange={setGradeMin}
                  defaultMinGrade={minPossibleGrade}
                  minPossibleGrade={minPossibleGrade}
                  maxPossibleGrade={maxPossibleGrade}
                />
            </Box>

            <Box
              sx={{
                backgroundColor: LEFT_BLOCK_BG,   // #0088ff
                borderRadius: 2,
                p: 2,
                display: "inline-block",
                minWidth: 120,
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: "bold", color: TEXT_COLOR }}>
                {totalManagers}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Центральный блок: гистограмма на фоне CARD_BG */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160, '& .MuiInputLabel-root': { color: 'white' }, '& .MuiInputLabel-root.Mui-focused': { color: 'white' }, }}>
            <InputLabel id="domain-select-label" sx={{ color: TEXT_COLOR }}>Домен</InputLabel>
            <Select
              labelId="domain-select-label"
              value={filters.domain ?? ''}
              label="Домен"
              onChange={(e) => setDomain(e.target.value || undefined)}
              sx={selectSx}
              >
                <MenuItem value="">Все домены</MenuItem>
                {availableDomains.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          {isLoading ? (
            <Typography sx={{ color: TEXT_COLOR }}>Загрузка данных по доменам…</Typography>
          ) : isError ? (
            <Typography color="error">Ошибка загрузки доменов</Typography>
          ) : (
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredGist} margin={{ top: 20, right: 10, left: 0, bottom: 80 }} >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="domain" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 12, fill: TEXT_COLOR }} />
                  <YAxis tick={{ fill: TEXT_COLOR }} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', color: '#000' }} cursor={{ fill: '#0088FF' }}/>
                  <Legend wrapperStyle={{ bottom: 0 }} formatter={(value) => <span style={{ color: TEXT_COLOR }}>{value}</span>} />
                  <Bar dataKey="managersWithSuccessors" name="С преемниками" fill={theme.palette.success.main} />
                  <Bar dataKey="managersWithoutSuccessors" name="Без преемников" fill={theme.palette.error.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Grid>

        {/* Правый блок: кольцевая диаграмма на фоне CARD_BG */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              borderRadius: 2,
              p: 2,
              color: TEXT_COLOR,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" sx={{ color: TEXT_COLOR, mb: 1 }}>
              Процент охвата преемниками по доменам
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" sx={{ color: TEXT_COLOR }} />
                <Typography variant="h6" sx={{ color: TEXT_COLOR, fontWeight: 'bold' }}>
                  {chartData.totalWith + chartData.totalWithout > 0
                    ? Math.round((chartData.totalWithout / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
              <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <PieChart
                  series={[{
                    data: pieData,
                    innerRadius: 60,
                    outerRadius: 80,
                  }]}
                  width={160} height={160}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                />
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" sx={{ color: TEXT_COLOR }} />
                <Typography variant="h6" sx={{ color: TEXT_COLOR, fontWeight: 'bold' }}>
                  {chartData.totalWith + chartData.totalWithout > 0
                    ? Math.round((chartData.totalWith / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.error.main }} />
                <Typography variant="caption" sx={{ color: TEXT_COLOR }}>
                  Без преемников: {chartData.totalWithout}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: theme.palette.success.main }} />
                <Typography variant="caption" sx={{ color: TEXT_COLOR }}>
                  С преемниками: {chartData.totalWith}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}