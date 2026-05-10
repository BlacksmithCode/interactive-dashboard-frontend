import { Box, Typography } from "@mui/material";
import { rowsOrder, potentialLabels, performanceLabels } from "../config/nineBoxMeta";
import { BoxCell } from "./BoxCell";
import type { MergedCells } from "../hooks/useMergedCells";

interface NineBoxMatrixProps {
  mergedCells: MergedCells;
}

/**
 * Матрица 9-box 3×3 с осями «Потенциал» и «Результативность».
 * Принимает предварительно агрегированные данные (MergedCells).
 */
export function NineBoxMatrix({ mergedCells }: NineBoxMatrixProps) {
  return (
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
                <Box sx={{ width: "80px", display: "flex", alignItems: "center", mr: 1 }}>
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
  );
}
