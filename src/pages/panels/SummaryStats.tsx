import { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  MenuItem,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { fetchStats, fetchNineBox } from "../../api/dashboardApi";

const DOMAINS = ["", "Иннотех", "Искусственный интеллект", "Код"];

export default function SummaryStats() {
  const [gradeMin, setGradeMin] = useState<number | "">("");
  const [domain, setDomain] = useState("");

  const { data: stats, isLoading: sLoading, isError: sError } = useQuery({
    queryKey: ["stats", gradeMin, domain],
    queryFn: () =>
      fetchStats({
        gradeMin: gradeMin === "" ? undefined : gradeMin,
        domain: domain || undefined,
      }),
  });

  const { data: nineBox, isLoading: nLoading, isError: nError } = useQuery({
    queryKey: ["nineBox", gradeMin, domain],
    queryFn: () =>
      fetchNineBox({
        gradeMin: gradeMin === "" ? undefined : gradeMin,
        domain: domain || undefined,
      }),
  });

  if (sLoading || nLoading) return <Typography>Загрузка...</Typography>;
  if (sError || nError) return <Typography color="error">Ошибка загрузки данных</Typography>;

  return (
    <Box>
      {/* Фильтры */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Минимальный грейд"
            type="number"
            value={gradeMin}
            onChange={(e) =>
              setGradeMin(e.target.value === "" ? "" : parseInt(e.target.value))
            }
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            label="Домен"
            select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Все домены</MenuItem>
            {DOMAINS.filter(Boolean).map((d) => (
              <MenuItem key={d} value={d}>{d}</MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          {/* Кнопка не нужна — запросы обновляются автоматически */}
        </Grid>
      </Grid>

      {/* KPI-карточки */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <KpiCard title="Всего руководителей" value={stats.managersWithSuccessors + stats.managersWithoutSuccessors} />
          <KpiCard title="С преемниками" value={stats.managersWithSuccessors} color="success.light" />
          <KpiCard title="Без преемников" value={stats.managersWithoutSuccessors} color="error.light" />
          <KpiCard title="Критические роли" value={stats.criticalRoles} />
          <KpiCard title="Крит. с преемниками" value={stats.criticalRolesWithSuccessors} color="success.light" />
          <KpiCard title="Крит. без преемника" value={stats.criticalRolesWithoutSuccessors} color="error.light" />
        </Grid>
      )}

      {/* Матрица 9‑box */}
      {nineBox && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Матрица 9‑box
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 500 }}>
            {Object.entries(nineBox.cells).map(([key, cell]) => (
              <Grid size={4} key={key}>
                <Card sx={{ bgcolor: getBoxColor(key), textAlign: "center" }}>
                  <CardContent>
                    <Typography variant="caption">{key}</Typography>
                    <Typography>Рук: {cell.managers}</Typography>
                    <Typography>Прем: {cell.successors}</Typography>
                    <Typography>Не преем: {cell.nonSuccessors}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}

function KpiCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color?: string;
}) {
  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card variant="outlined" sx={color ? { bgcolor: color } : {}}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

function getBoxColor(key: string): string {
  if (["AA", "AB", "AC", "BA", "BB", "CA", "CB"].includes(key))
    return "#c8e6c9";
  if (["AD", "AE", "BD", "BE", "CD", "CE"].includes(key))
    return "#ffcdd2";
  return "#fff9c4";
}