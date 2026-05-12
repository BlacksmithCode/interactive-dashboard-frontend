import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import type { MergedKey, NineBoxCell } from "../../../types/dashboard";
import { boxMeta, categoryColor } from "../config/nineBoxMeta";

const PERF_MAP: Record<string, string> = {
  A: "Высшая",
  B: "Высокая",
  C: "Нормальная",
  D: "Сниженная",
  E: "Низкая",
};
const POT_MAP: Record<string, string> = {
  A: "Высокий",
  B: "Средний",
  C: "Низкий",
};

interface BoxCellProps extends NineBoxCell {
  code: MergedKey;
  totalManagers?: number;
  sourceKeys?: readonly string[];
  rawCells?: Record<string, NineBoxCell>;
}

export function BoxCell({
  code,
  managers,
  successors,
  nonSuccessors,
  totalManagers = 0,
  sourceKeys,
  rawCells,
}: BoxCellProps) {
  const meta = boxMeta[code] ?? { label: "—", description: "" };
  const bg = categoryColor[code] ?? "#fff";

  const total = managers || 0;
  const succPercent = total > 0 ? Math.round((successors / total) * 100) : 0;
  const nonSuccPercent = total > 0 ? Math.round((nonSuccessors / total) * 100) : 0;
  const managerPercent =
    totalManagers > 0 ? Math.round((managers / totalManagers) * 100) : 0;
  const showPercent = totalManagers > 0;

  // Содержимое тултипа
  let tooltipContent: React.ReactNode = `${meta.label}: ${meta.description}`;
  if (sourceKeys && rawCells) {
    const perfCounts = new Map<string, number>();
    const potCounts = new Map<string, number>();
    sourceKeys.forEach((key) => {
      const cell = rawCells[key];
      if (cell) {
        const m = cell.managers || 0;
        const pot = key.charAt(0);
        const perf = key.charAt(1);
        perfCounts.set(perf, (perfCounts.get(perf) || 0) + m);
        potCounts.set(pot, (potCounts.get(pot) || 0) + m);
      }
    });
    tooltipContent = (
      <Box sx={{ minWidth: 200 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {meta.label}: {meta.description}
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Результативность
            </Typography>
            {Array.from(perfCounts.entries()).map(([letter, count]) => (
              <Box key={letter} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  {letter} ({PERF_MAP[letter] ?? letter})
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", ml: 1 }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
              Потенциал
            </Typography>
            {Array.from(potCounts.entries()).map(([letter, count]) => (
              <Box key={letter} sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body2">
                  {letter} ({POT_MAP[letter] ?? letter})
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: "bold", ml: 1 }}>
                  {count}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Tooltip title={tooltipContent} arrow placement="top">
      <Card
        sx={{
          bgcolor: bg,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          cursor: "help",
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="caption" sx={{ alignSelf: "flex-start", fontWeight: "bold" }}>
            {code.replace("_", " + ")}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: "bold" }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" sx={{ mb: 0.5 }}>
            {meta.description}
          </Typography>
          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <Typography variant="body2">Руководителей:</Typography>
              <Typography variant="body2">Преемники:</Typography>
              <Typography variant="body2">Не преемники:</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
                <Typography variant="body2">{managers}</Typography>
                <Typography variant="body2">{successors}</Typography>
                <Typography variant="body2">{nonSuccessors}</Typography>
              </Box>
              {showPercent ? (
                <Box
                  sx={{
                    borderLeft: "1px solid",
                    borderColor: "divider",
                    pl: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography variant="body2">{managerPercent}%</Typography>
                  <Typography variant="body2">{succPercent}%</Typography>
                  <Typography variant="body2">{nonSuccPercent}%</Typography>
                </Box>
              ) : (
                <Box sx={{ pl: 1 }} />
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}