import { Box, Typography } from "@mui/material";
import { rowsOrder, potentialLabels, performanceLabels } from "../config/nineBoxMeta";
import { BoxCell } from "./BoxCell";
import type { MergedCells } from "../hooks/useMergedCells";
import { MERGE_RULES } from "../hooks/useMergedCells"; // <-- добавляем импорт
import type { NineBoxResponse } from "../../../types/dashboard";

interface NineBoxMatrixProps {
  mergedCells: MergedCells;
  nineBox: NineBoxResponse;
}

export function NineBoxMatrix({ mergedCells, nineBox }: NineBoxMatrixProps) {
  const totalManagers = Object.values(mergedCells).reduce(
    (sum, cell) => sum + (cell?.managers ?? 0),
    0
  );

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Матрица потенциала
      </Typography>
      <Box sx={{ display: "flex", pl: "80px" }}>
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Результативность (вторая оценка) →
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "flex", alignItems: "stretch" }}>
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
            sx={{ fontWeight: "bold", transform: "rotate(-90deg)", whiteSpace: "nowrap" }}
          >
            Потенциал (первая оценка)
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, mb: 0.5 }}>
            {performanceLabels.map((label) => (
              <Typography key={label} variant="caption" align="center">
                {label}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {rowsOrder.map((row, rowIndex) => (
              <Box key={rowIndex} sx={{ display: "flex", alignItems: "stretch" }}>
                <Box sx={{ width: "80px", display: "flex", alignItems: "center", mr: 1 }}>
                  <Typography variant="caption">{potentialLabels[rowIndex]}</Typography>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, width: "100%" }}>
                  {row.map((code) => (
                    <BoxCell
                      key={code}
                      code={code}
                      {...mergedCells[code]}
                      totalManagers={totalManagers}
                      sourceKeys={MERGE_RULES[code]}
                      rawCells={nineBox.cells}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}