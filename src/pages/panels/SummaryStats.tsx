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
import {
  fetchStats,
  fetchNineBox,
} from "../../api/dashboardApi";

const DOMAINS = ["", "Иннотех", "Искусственный интеллект", "Код"];

// ---------- 9-box: описание объединённых категорий ----------
type MergedKey = "AD_AE" | "AC" | "AA_AB" | "BD_BE" | "BC" | "BA_BB" | "CD_CE" | "CB_CC" | "CA";

const boxMeta: Record<MergedKey, { label: string; description: string }> = {
  AD_AE: { label: "Низкоэффективный", description: "Требуется развитие экспертизы" },
  AC:    { label: "Профессионал", description: "Возможен карьерный рост и развитие экспертизы" },
  AA_AB: { label: "Звезда", description: "Требуется продвижение" },

  BD_BE: { label: "Низкоэффективный", description: "Требуется ротация или смена деятельности" },
  BC:    { label: "Профессионал", description: "Возможен карьерный рост с наставником и развитие экспертизы" },
  BA_BB: { label: "Эксперт", description: "Возможен карьерный рост" },

  CD_CE: { label: "Зона риска", description: "Низкие результаты и потенциал" },
  CB_CC: { label: "Профессионал", description: "Требуется развитие потенциала" },
  CA:    { label: "Эксперт", description: "Требуется развитие потенциала" },
};

// Цвета для каждой объединённой категории
const categoryColor: Record<MergedKey, string> = {
  AD_AE: "#ffe0b2", // оранжевый
  AC:    "#ffe0b2",
  AA_AB: "#c8e6c9", // зелёный

  BD_BE: "#ffe0b2",
  BC:    "#ffe0b2",
  BA_BB: "#c8e6c9",

  CD_CE: "#ffcdd2", // красный
  CB_CC: "#ffe0b2",
  CA:    "#c8e6c9",
};

// Порядок ячеек для рендеринга 3x3
const rowsOrder: MergedKey[][] = [
  ["AD_AE", "AC", "AA_AB"], // потенциал A
  ["BD_BE", "BC", "BA_BB"], // потенциал B
  ["CD_CE", "CB_CC", "CA"], // потенциал C
];

const potentialLabels = ["A (высокий)", "B (средний)", "C (низкий)"];
const performanceLabels = ["D / E", "C", "A / B"];

// ---------- Компонент одной ячейки ----------
function BoxCell({
  code,
  managers,
  successors,
  nonSuccessors,
}: {
  code: MergedKey;
  managers: number;
  successors: number;
  nonSuccessors: number;
}) {
  const meta = boxMeta[code] ?? { label: "—", description: "" };
  const bg = categoryColor[code] ?? "#fff";

  return (
    <Card
      sx={{
        bgcolor: bg,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="caption" sx={{ alignSelf: "flex-start", fontWeight: "bold" }}>
          {code.replace("_", " + ")}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
          {meta.label}
        </Typography>
        <Typography variant="caption" sx={{ mb: 0.5 }}>
          {meta.description}
        </Typography>
        <Typography variant="body2" sx={{ mt: "auto" }}>
          Рук: {managers} | Прем: {successors} | Не преем: {nonSuccessors}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ---------- Утилита для суммирования значений по списку ключей ----------
function sumCells(
  cells: Record<string, { managers: number; successors: number; nonSuccessors: number }>,
  keys: string[]
) {
  let managers = 0, successors = 0, nonSuccessors = 0;
  for (const key of keys) {
    const cell = cells[key];
    if (cell) {
      managers += cell.managers;
      successors += cell.successors;
      nonSuccessors += cell.nonSuccessors;
    }
  }
  return { managers, successors, nonSuccessors };
}

// ---------- Основной компонент дашборда ----------
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

  // Общее количество руководителей
  const totalManagers = stats
    ? stats.managersWithSuccessors + stats.managersWithoutSuccessors
    : 0;

  // Предрасчитываем агрегированные значения для 3x3
  const mergedCells = nineBox
    ? {
        AD_AE: sumCells(nineBox.cells, ["AD", "AE"]),
        AC:    sumCells(nineBox.cells, ["AC"]),
        AA_AB: sumCells(nineBox.cells, ["AA", "AB"]),
        BD_BE: sumCells(nineBox.cells, ["BD", "BE"]),
        BC:    sumCells(nineBox.cells, ["BC"]),
        BA_BB: sumCells(nineBox.cells, ["BA", "BB"]),
        CD_CE: sumCells(nineBox.cells, ["CD", "CE"]),
        CB_CC: sumCells(nineBox.cells, ["CB", "CC"]),
        CA:    sumCells(nineBox.cells, ["CA"]),
      }
    : null;

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
              <MenuItem key={d} value={d}>
                {d}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }} />
      </Grid>

      {/* KPI-карточки */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <KpiCard
            title="Всего руководителей"
            value={totalManagers}
            total={totalManagers}
            percentValue={stats.managersWithSuccessors}
          />
          <KpiCard
            title="С преемниками"
            value={stats.managersWithSuccessors}
            total={totalManagers}
            color="success.light"
          />
          <KpiCard
            title="Без преемников"
            value={stats.managersWithoutSuccessors}
            total={totalManagers}
            color="error.light"
          />
          <KpiCard
            title="Критические роли"
            value={stats.criticalRoles}
            total={totalManagers}
          />
          <KpiCard
            title="Крит. с преемниками"
            value={stats.criticalRolesWithSuccessors}
            total={totalManagers}
            color="success.light"
          />
          <KpiCard
            title="Крит. без преемника"
            value={stats.criticalRolesWithoutSuccessors}
            total={totalManagers}
            color="error.light"
          />
        </Grid>
      )}

      {/* Матрица 9-box 3x3 */}
      {mergedCells && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Матрица 9‑box
          </Typography>

          {/* Ось результативности сверху */}
          <Box sx={{ display: "flex", pl: "80px" }}>
            <Box sx={{ flex: 1, textAlign: "center" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                Результативность (вторая оценка) →
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "stretch" }}>
            {/* Вертикальная ось слева */}
            <Box
              sx={{
                width: "80px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                mr: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: "bold",
                  transform: "rotate(-90deg)",
                  whiteSpace: "nowrap",
                }}
              >
                Потенциал (первая оценка)
              </Typography>
            </Box>

            {/* Таблица ячеек */}
            <Box sx={{ flex: 1 }}>
              {/* Заголовки столбцов */}
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 0.5 }}>
                {performanceLabels.map((label) => (
                  <Typography key={label} variant="caption" align="center">
                    {label}
                  </Typography>
                ))}
              </Box>

              {/* Строки с ячейками */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {rowsOrder.map((row, rowIndex) => (
                  <Box key={rowIndex} sx={{ display: "flex", alignItems: "stretch" }}>
                    {/* Метка потенциала слева */}
                    <Box
                      sx={{
                        width: "80px",
                        display: "flex",
                        alignItems: "center",
                        mr: 1,
                      }}
                    >
                      <Typography variant="caption">
                        {potentialLabels[rowIndex]}
                      </Typography>
                    </Box>
                    {/* Ячейки строки */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, width: "100%" }}>
                      {row.map((code) => (
                        <BoxCell
                          key={code}
                          code={code}
                          {...mergedCells[code]}
                        />
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

// Вспомогательный компонент KpiCard – теперь с процентом
function KpiCard({
  title,
  value,
  total,
  percentValue,
  color,
}: {
  title: string;
  value: number;
  total?: number;
  percentValue?: number;
  color?: string;
}) {
  // Если percentValue передан — используем его, иначе self
  const base = percentValue !== undefined ? percentValue : value;
  const percent =
    total !== undefined && total > 0
      ? Math.round((base / total) * 100)
      : undefined;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card variant="outlined" sx={color ? { bgcolor: color } : {}}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h5">
            {value}
            {percent !== undefined && (
              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                ({percent}%)
              </Typography>
            )}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}