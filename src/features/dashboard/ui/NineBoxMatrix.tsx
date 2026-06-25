import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import { rowsOrder, potentialLabels, performanceLabels } from "../config/nineBoxMeta";
import { BoxCell } from "./BoxCell";
import type { MergedCells } from "../hooks/useMergedCells";

interface NineBoxMatrixProps {
  mergedCells: MergedCells;
}

export function NineBoxMatrix({ mergedCells }: NineBoxMatrixProps) {
  const totalManagers = Object.values(mergedCells).reduce(
    (sum, cell) => sum + (cell?.managers ?? 0),
    0
  );

  const maxManagers = Math.max(...Object.values(mergedCells).map((c) => c?.managers ?? 0));

  const percentMap = new Map<string, number>();
  if (totalManagers > 0) {
    const rawPercents = Object.entries(mergedCells).map(([code, cell]) => ({
      code,
      raw: (cell?.managers ?? 0) / totalManagers * 100,
    }));

    const baseSum = rawPercents.reduce((sum, r) => sum + Math.floor(r.raw), 0);
    const remainderCount = Math.max(0, 100 - baseSum);

    const withRemainder = rawPercents.map((r, i) => ({
      ...r,
      remainder: r.raw - Math.floor(r.raw),
      index: i,
    }));

    withRemainder.sort((a, b) => b.remainder - a.remainder);

    withRemainder.forEach((item, i) => {
      percentMap.set(item.code, Math.floor(item.raw) + (i < remainderCount ? 1 : 0));
    });
  }

  return (
    <Box sx={{ p: 2, borderRadius: 2, color: "white" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "80px 1fr",
          gridTemplateRows: "auto 1fr",
          gap: 1,
        }}
      >
        <Box />

        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography variant="caption" sx={{ fontWeight: "bold" }}>
            Результативность (вторая оценка) →
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              transform: "rotate(-90deg)",
              whiteSpace: "nowrap",
              fontWeight: "bold",
            }}
          >
            Потенциал (первая оценка) →
          </Typography>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "80px repeat(3, minmax(0, 1fr))",
            gridTemplateRows: "auto repeat(3, 1fr)",
            gap: 1,
          }}
        >
          <Box />
          {performanceLabels.map((label) => (
            <Card key={label} sx={{ bgcolor: "transparent", boxShadow: "none" }}>
              <CardContent sx={{ p: 1, display: "flex", justifyContent: "center" }}>
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "white" }}>
                  {label}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {rowsOrder.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "white" }}>
                  {potentialLabels[rowIndex]}
                </Typography>
              </Box>
              {row.map((code) => (
                <BoxCell
                  key={code}
                  code={code}
                  {...mergedCells[code]}
                  totalManagers={totalManagers}
                  isMax={mergedCells[code]?.managers === maxManagers}
                  managerPercent={percentMap.get(code) ?? 0}
                />
              ))}
            </React.Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  );
}