import { Card, CardContent, Typography } from "@mui/material";
import type { MergedKey, NineBoxCell } from "../../../types/dashboard";
import { boxMeta, categoryColor } from "../config/nineBoxMeta";

interface BoxCellProps extends NineBoxCell {
  code: MergedKey;
}

/**
 * Одна ячейка матрицы 9-box.
 * Отображает код категории, лейбл, описание и количества.
 */
export function BoxCell({ code, managers, successors, nonSuccessors }: BoxCellProps) {
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
