import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import type { NineBoxCell, MergedKey } from "@/entities/dashboard";
import { boxMeta, categoryColor, PERF_MAP, POT_MAP } from "../config/nineBoxMeta";
import { MERGE_RULES } from "../hooks/useMergedCells";
import { colors } from "@/shared/theme/tokens";

interface BoxCellProps extends NineBoxCell {
  code: MergedKey;
  totalManagers?: number;
  isMax?: boolean;
  managerPercent?: number;
}

export function BoxCell({
  code,
  managers,
  successors,
  nonSuccessors,
  totalManagers = 0,
  isMax = false,
  managerPercent,
}: BoxCellProps) {
  const meta = boxMeta[code] ?? { label: "—", description: "" };
  const bg = categoryColor[code] ?? colors.primary;

  const total = managers || 0;
  let succPercent = 0;
  let nonSuccPercent = 0;
  if (total > 0) {
    succPercent = Math.round((successors / total) * 100);
    nonSuccPercent = Math.round((nonSuccessors / total) * 100);
    const diff = 100 - (succPercent + nonSuccPercent);
    if (diff !== 0) {
      if (succPercent >= nonSuccPercent) {
        succPercent += diff;
      } else {
        nonSuccPercent += diff;
      }
    }
  }
  const finalManagerPercent = totalManagers > 0 ? (managerPercent ?? Math.round((managers / totalManagers) * 100)) : 0;
  const showPercent = totalManagers > 0;

  const perfCounts = new Map<string, number>();
  const potCounts = new Map<string, number>();
  const originalKeys = MERGE_RULES[code];

  if (originalKeys) {
    originalKeys.forEach((key) => {
      const potKey = key[0];
      const perfKey = key[1];
      const share = Math.round(managers / originalKeys.length);
      perfCounts.set(perfKey, (perfCounts.get(perfKey) || 0) + share);
      potCounts.set(potKey, (potCounts.get(potKey) || 0) + share);
    });
  }


  const displayCode = code.replace("_", " + ");

  return (
    <Tooltip
      title={
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 0.5 }}>
            {meta.label}: {meta.description}
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                Результативность
              </Typography>
              {Array.from(perfCounts.entries()).map(([l, c]) => (
                <Box key={l} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography variant="caption">{l} ({PERF_MAP[l] ?? l})</Typography>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>{c}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                Потенциал
              </Typography>
              {Array.from(potCounts.entries()).map(([l, c]) => (
                <Box key={l} sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                  <Typography variant="caption">{l} ({POT_MAP[l] ?? l})</Typography>
                  <Typography variant="caption" sx={{ fontWeight: "bold" }}>{c}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      }
      arrow
      placement="top"
    >
      <Card
        sx={{
          background: bg,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          cursor: "pointer",
          color: "white",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          outline: isMax ? `2px solid ${colors.white}` : "none",
          outlineOffset: isMax ? "-2px" : undefined,
          border: "none",
          boxShadow: isMax
            ? `0 0 20px ${bg}88`
            : "0 2px 8px rgba(0,0,0,0.15)",
          "&:hover": {
            transform: "translateY(-4px) scale(1.02)",
            boxShadow: `0 8px 25px ${bg}66`,
            outlineColor: colors.white,
            opacity: 0.95,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 1.5, display: "flex", flexDirection: "column" }}>
          <Typography variant="caption" sx={{ alignSelf: "flex-start", fontWeight: "bold", color: "white", opacity: 0.9 }}>
            {displayCode}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: "bold", color: "white", fontSize: "0.85rem" }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" sx={{ mb: 0.5, color: "white", opacity: 0.85 }}>
            {meta.description}
          </Typography>
          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>Руководители:</Typography>
              <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>Преемники:</Typography>
              <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>Не преемники:</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "0.72rem", fontWeight: 700 }}>{managers}</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.72rem", fontWeight: 700 }}>{successors}</Typography>
                <Typography variant="body2" sx={{ fontSize: "0.72rem", fontWeight: 700 }}>{nonSuccessors}</Typography>
              </Box>
              {showPercent && (
                <Box
                  sx={{
                    borderLeft: "1px solid",
                    borderColor: "rgba(255,255,255,0.5)",
                    pl: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>{finalManagerPercent}%</Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>{succPercent}%</Typography>
                  <Typography variant="body2" sx={{ fontSize: "0.72rem" }}>{nonSuccPercent}%</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}