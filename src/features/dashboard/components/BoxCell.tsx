import { Card, CardContent, Typography, Box } from "@mui/material";
import type { MergedKey, NineBoxCell } from "../../../types/dashboard";
import { boxMeta, categoryColor } from "../config/nineBoxMeta";

interface BoxCellProps extends NineBoxCell {
  code: MergedKey;
  totalManagers?: number;
}

export function BoxCell({
  code,
  managers,
  successors,
  nonSuccessors,
  totalManagers = 0,
}: BoxCellProps) {
  const meta = boxMeta[code] ?? { label: "—", description: "" };
  const bg = categoryColor[code] ?? "#fff";

  const total = managers || 0;
  const succPercent = total > 0 ? Math.round((successors / total) * 100) : 0;
  const nonSuccPercent = total > 0 ? Math.round((nonSuccessors / total) * 100) : 0;
  const managerPercent =
    totalManagers > 0 ? Math.round((managers / totalManagers) * 100) : 0;

  const showPercent = totalManagers > 0;

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
        <Typography
          variant="caption"
          sx={{ alignSelf: "flex-start", fontWeight: "bold" }}
        >
          {code.replace("_", " + ")}
        </Typography>
        <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
          {meta.label}
        </Typography>
        <Typography variant="caption" sx={{ mb: 0.5 }}>
          {meta.description}
        </Typography>

        {/* Основной блок: подписи слева, числа и проценты справа */}
        <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}>
          {/* Подписи (теперь с явным выравниванием влево) */}
          <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <Typography variant="body2">Руководителей:</Typography>
            <Typography variant="body2">Преемники:</Typography>
            <Typography variant="body2">Не преемники:</Typography>
          </Box>

          {/* Числа и проценты как единый блок */}
          <Box sx={{ display: "flex", alignItems: "stretch" }}>
            {/* Колонка чисел (выровнены вправо) */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
              <Typography variant="body2">{managers}</Typography>
              <Typography variant="body2">{successors}</Typography>
              <Typography variant="body2">{nonSuccessors}</Typography>
            </Box>

            {/* Колонка процентов со сплошной линией слева */}
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
  );
}