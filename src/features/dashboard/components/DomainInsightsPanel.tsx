import { Box, Grid, Typography, Card, TextField, Chip, MenuItem, Select, FormControl, InputLabel, OutlinedInput, useTheme } from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import type { SelectChangeEvent } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDomainGistQuery } from "../hooks/useDomainGistQuery";
import { useMemo, useState } from "react";

interface DomainInsightsPanelProps {
  totalManagers: number;
}

export function DomainInsightsPanel({ totalManagers }: DomainInsightsPanelProps) {
  const theme = useTheme();
  const { filters, setGradeMin, setDomain } = useDashboardFilters();
  const { data: gist, isLoading, isError } = useDomainGistQuery({ gradeMin: filters.gradeMin });

  const [gradeInput, setGradeInput] = useState<string>(filters.gradeMin?.toString() ?? "");
  const handleGradeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setGradeInput(raw);
    const num = raw === "" ? undefined : parseInt(raw);
    setGradeMin(num);
  };

  const allDomains = useMemo(() => {
    if (!gist) return [];
    return Array.from(new Set(gist.map((d) => d.domain)));
  }, [gist]);

  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    filters.domain ? [filters.domain] : []
  );

  const handleDomainChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    const domains = typeof value === "string" ? value.split(",") : value;
    setSelectedDomains(domains);
    setDomain(domains.length > 0 ? domains[0] : undefined);
  };

  const handleDeleteDomain = (domainToDelete: string) => {
    const updated = selectedDomains.filter(d => d !== domainToDelete);
    setSelectedDomains(updated);
    setDomain(updated.length > 0 ? updated[0] : undefined);
  };

  const filteredGist = useMemo(() => {
    if (!gist) return [];
    if (selectedDomains.length === 0) return gist;
    return gist.filter(d => selectedDomains.includes(d.domain));
  }, [gist, selectedDomains]);

  const chartData = useMemo(() => {
    if (!filteredGist.length) return { barSeriesSuccess: [], barSeriesFail: [], barXLabels: [], barXLabelsShort: [], totalWith: 0, totalWithout: 0, overallPercent: 0 };

    const barSeriesSuccess = filteredGist.map(d => d.managersWithSuccessors);
    const barSeriesFail = filteredGist.map(d => d.managersWithoutSuccessors);
    const barXLabels = filteredGist.map(d => d.domain);

    // Сокращаем длинные названия до 10 символов
    const barXLabelsShort = barXLabels.map(label =>
      label.length > 10 ? label.slice(0, 9) + '…' : label
    );

    const totalWith = barSeriesSuccess.reduce((a, b) => a + b, 0);
    const totalWithout = barSeriesFail.reduce((a, b) => a + b, 0);
    const total = totalWith + totalWithout;
    const overallPercent = total > 0 ? Math.round((totalWith / total) * 100) : 0;

    return { barSeriesSuccess, barSeriesFail, barXLabels, barXLabelsShort, totalWith, totalWithout, overallPercent };
  }, [filteredGist]);

  return (
    <Card variant="outlined" sx={{ mb: 4 }}>
      <Grid container spacing={3} sx={{ p: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 1 }}>
              Всего руководителей ≥ грейда
            </Typography>
            <TextField
              type="number"
              value={gradeInput}
              onChange={handleGradeChange}
              placeholder="без фильтра"
              size="small"
              sx={{ width: 100, mb: 1 }}
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <Typography variant="h2" sx={{ fontWeight: "bold" }}>
              {totalManagers}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
  <InputLabel id="domain-select-label">Домены</InputLabel>
  <Select
    labelId="domain-select-label"
    multiple
    value={selectedDomains}
    onChange={handleDomainChange}
    input={<OutlinedInput label="Домены" />}
    renderValue={(selected) => (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
        {selected.map((domain) => (
          <Chip
            key={domain}
            label={domain}
            size="small"
            onDelete={() => handleDeleteDomain(domain)}
            onClick={(e) => e.stopPropagation()}
          />
        ))}
      </Box>
    )}
  >
    {allDomains.map((d) => (
      <MenuItem key={d} value={d}>
        {d}
      </MenuItem>
    ))}
  </Select>
</FormControl>
{isLoading ? (
  <Typography>Загрузка данных по доменам…</Typography>
) : isError ? (
  <Typography color="error">Ошибка загрузки доменов</Typography>
) : (
  <Box sx={{ width: '100%', height: 300 }}>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={filteredGist}
        margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="domain"
          interval={0}
          angle={-25}
          textAnchor="end"
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip />
        <Legend wrapperStyle={{ bottom: 0 }} />
        <Bar dataKey="managersWithSuccessors" name="С преемниками" fill={theme.palette.success.main} />
        <Bar dataKey="managersWithoutSuccessors" name="Без преемников" fill={theme.palette.error.main} />
      </BarChart>
    </ResponsiveContainer>
  </Box>
)}
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
              Процент охвата преемниками по доменам
            </Typography>
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
                width={180}
                height={180}
                margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 0, left: 0, bottom: 0, right: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                  {chartData.overallPercent}%
                </Typography>
              </Box>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Card>
  );
}