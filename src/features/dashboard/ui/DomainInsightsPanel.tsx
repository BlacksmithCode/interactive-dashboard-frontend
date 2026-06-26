import { Box, Grid, Typography, Card, useTheme, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { PieChart } from "@mui/x-charts/PieChart";
import { useDomainGistQuery } from "../hooks";
import { useDashboardFilters } from "../model/useDashboardFilters";
import { useMemo, useState } from "react";
import { GradeFilterInput } from "./GradeFilterInput";
import { RoleGuard, ROLES } from "@/entities/user";
import { colors } from "@/shared/theme/tokens";

interface DomainInsightsPanelProps {
  totalManagers: number;
  minPossibleGrade?: number;
  maxPossibleGrade?: number;
}

// Стили для Select на общем фоне
const selectSx = {
  color: colors.white,
  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.white },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.white },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: colors.white },
  '& .MuiSvgIcon-root': { color: colors.white },
  '& .MuiInputLabel-root': { color: `${colors.white} !important` },
  '& .MuiInputLabel-root.Mui-focused': { color: `${colors.white} !important` },
  '& .MuiInputBase-input': { color: colors.white },
};

// Кастомный тултип с адаптивным фоном под тему
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { domain: string; managersWithSuccessors: number; managersWithoutSuccessors: number } }> }) => {
  const tooltipTheme = useTheme();
  const isDark = tooltipTheme.palette.mode === 'dark';
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const withSucc = data.managersWithSuccessors || 0;
    const withoutSucc = data.managersWithoutSuccessors || 0;
    const total = withSucc + withoutSucc;

    return (
      <Box sx={{ backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(255,255,255,0.95)', color: isDark ? '#fff' : '#000', p: 1.5, borderRadius: '8px', minWidth: 200, pointerEvents: 'auto', userSelect: 'text', border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>{data.domain}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2">С преемниками:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto' }}>{withSucc}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="body2">Без преемников:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto' }}>{withoutSucc}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}`, pt: 0.5, mt: 0.5 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Всего:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto' }}>{total}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
  return null;
};

export function DomainInsightsPanel({
  totalManagers,
  minPossibleGrade,
  maxPossibleGrade,
}: DomainInsightsPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { filters, setGradeMin, setDomain, availableDomains, criticalFilter, successorFilter, debouncedSearchName, debouncedPositionFilter } = useDashboardFilters();
  const { data: gist, isLoading, isError } = useDomainGistQuery({ 
    gradeMin: filters.gradeMin, 
    domains: filters.domain ? [filters.domain] : undefined,
    critical: criticalFilter,
    hasSuccessor: successorFilter,
    searchName: debouncedSearchName,
    positionFilter: debouncedPositionFilter,
  });

  const currentGist = useMemo(() => gist || [], [gist]);

  const computedDomains = useMemo(() => {
    const fromGist = gist ? gist.map(d => d.domain) : [];
    return [...new Set([...(availableDomains || []), ...fromGist])].sort();
  }, [gist, availableDomains]);

  const chartData = useMemo(() => {
    if (!currentGist.length) {
      return { totalWith: 0, totalWithout: 0 };
    }
    const totalWith = currentGist.reduce((sum, d) => sum + d.managersWithSuccessors, 0);
    const totalWithout = currentGist.reduce((sum, d) => sum + d.managersWithoutSuccessors, 0);
    return { totalWith, totalWithout };
  }, [currentGist]);

  const bgColor = isDark ? colors.successDark : colors.success;
  const errColor = isDark ? colors.errorDark : colors.error;

  const pieData = [
    { id: "with", value: chartData.totalWith || 0, color: bgColor },
    { id: "without", value: chartData.totalWithout || 0, color: errColor },
  ];

  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  return (
    <Card variant="outlined" sx={{ mb: 4, backgroundColor: colors.primary, color: colors.white, borderColor: 'rgba(255, 255, 255, 0.3)' }}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        
        {/* Левый блок: фон colors.primary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              textAlign: "center",
              color: colors.white,
            }}
          >
            <Typography variant="body1" sx={{ mb: 1, color: colors.white }}>
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
                backgroundColor: isDark ? colors.surfaceVariantDark : colors.primaryDark,
                borderRadius: 2,
                p: 2,
                display: "inline-block",
                minWidth: 120,
                cursor: "pointer",
                transition: "all 0.2s ease",
                outline: "2px solid transparent",
                "&:hover": {
                  outlineColor: colors.primary,
                },
              }}
            >
              <Typography variant="h2" sx={{ fontWeight: "bold", color: colors.white }}>
              {filters.domain ? (chartData.totalWith + chartData.totalWithout) : totalManagers}
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Центральный блок: гистограмма */}
        <Grid size={{ xs: 12, md: 5 }}>
          <RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.HRD_EVALUATION]}>
            <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160, '& .MuiInputLabel-root': { color: colors.white }, '& .MuiInputLabel-root.Mui-focused': { color: colors.white }, }}>
                <InputLabel id="domain-select-label" sx={{ color: colors.white }}>Домен</InputLabel>
                <Select
                  labelId="domain-select-label"
                  value={filters.domain ?? ''}
                  label="Домен"
                  onChange={(e) => {
                    const val = e.target.value;
                    setDomain(val ? String(val) : undefined);
                  }}
                  sx={selectSx}
                >
                  <MenuItem value="">Все домены</MenuItem>
                  {computedDomains.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </RoleGuard>
          {isLoading ? (
            <Typography sx={{ color: colors.white }}>Загрузка данных по доменам…</Typography>
          ) : isError ? (
            <Typography color="error">Ошибка загрузки доменов</Typography>
          ) : (
            <Box sx={{ width: '100%', height: 300, minWidth: 250 }}>
              <style>{`
                .histogram-bar rect { cursor: pointer; transition: opacity 0.2s ease !important; }
                .histogram-bar:hover rect { opacity: 0.7 !important; }
              `}</style>
              <ResponsiveContainer width="99%" height={300} minWidth={1}>
                <BarChart data={currentGist} margin={{ top: 20, right: 10, left: 0, bottom: 80 }} >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="domain" interval={0} angle={-25} textAnchor="end" tick={{ fontSize: 12, fill: colors.white }} />
                  <YAxis tick={{ fill: colors.white }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: isDark ? 'rgba(0,0,0,0.4)' : colors.primaryDark }}/>
                  <Legend wrapperStyle={{ bottom: 0 }} formatter={(value) => <span style={{ color: colors.white }}>{value}</span>} />
                  <Bar dataKey="managersWithSuccessors" name="С преемниками" fill={bgColor} className="histogram-bar" />
                  <Bar dataKey="managersWithoutSuccessors" name="Без преемников" fill={errColor} className="histogram-bar" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Grid>
        
        {/* Правый блок: кольцевая диаграмма */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              borderRadius: 2,
              p: 2,
              color: colors.white,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body2" align="center" sx={{ color: colors.white, mb: 1 }}>
              Процент охвата преемниками по доменам
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" sx={{ color: colors.white }} />
                <Typography variant="h6" sx={{ color: errColor, fontWeight: 'bold', textShadow: '0 0 2px #fff, 0 0 2px #fff, 0 0 2px #fff, 0 0 2px #fff' }}>
                  {chartData.totalWith + chartData.totalWithout > 0
                    ? Math.round((chartData.totalWithout / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
              <Box sx={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", mx: 0 }}>
                <PieChart
                  series={[{
                    data: pieData,
                    innerRadius: 60,
                    outerRadius: 80,
                  }]}
                  width={180}
                  height={180}
                  margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
                  onHighlightChange={(id) => setHoveredSlice(id as string | null)}
                  // @ts-expect-error - 'hidden' works but missing from @mui/x-charts types
                  slotProps={{ legend: { hidden: true } }}
                  sx={{
                    '& path': {
                      stroke: `${colors.white} !important`,
                      // strokeWidth: '2px !important',
                      // transition: 'opacity 0.2s ease',
                      // opacity: isDark ? 0.6 : 1,
                    }
                  }}
                />
              </Box>
              <Box sx={{ textAlign: 'center', minWidth: 50 }}>
                <Typography variant="body2" sx={{ color: colors.white }} />
                <Typography variant="h6" sx={{ color: bgColor, fontWeight: 'bold', textShadow: '0 0 2px #fff, 0 0 2px #fff, 0 0 2px #fff, 0 0 2px #fff' }}>
                  {chartData.totalWith + chartData.totalWithout > 0
                    ? Math.round((chartData.totalWith / (chartData.totalWith + chartData.totalWithout)) * 100)
                    : 0}%
                </Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5, 
                  cursor: "pointer", 
                  transition: "all 0.2s ease", 
                  borderRadius: 1, 
                  px: 1, 
                  py: 0.25,
                  outline: "1px solid transparent",
                  opacity: hoveredSlice && hoveredSlice !== "without" ? 0.6 : 1,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    outlineColor: "rgba(255,255,255,0.3)",
                  }
                }}
                onMouseEnter={() => setHoveredSlice("without")}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: errColor }} />
                <Typography variant="caption" sx={{ color: colors.white, whiteSpace: "nowrap" }}>
                  Без преемников: {chartData.totalWithout}
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5, 
                  cursor: "pointer", 
                  transition: "all 0.2s ease", 
                  borderRadius: 1, 
                  px: 1, 
                  py: 0.25,
                  outline: "1px solid transparent",
                  opacity: hoveredSlice && hoveredSlice !== "with" ? 0.6 : 1,
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.08)",
                    outlineColor: "rgba(255,255,255,0.3)",
                  }
                }}
                onMouseEnter={() => setHoveredSlice("with")}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: bgColor }} />
                <Typography variant="caption" sx={{ color: colors.white, whiteSpace: "nowrap" }}>
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