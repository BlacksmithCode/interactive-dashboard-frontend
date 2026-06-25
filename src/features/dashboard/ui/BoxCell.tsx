import { Card, CardContent, Typography, Box, Tooltip } from "@mui/material";
import type { NineBoxCell, MergedKey } from "@/entities/dashboard";
import { boxMeta, categoryColor, PERF_MAP, POT_MAP } from "../config/nineBoxMeta";
import { MERGE_RULES } from "../hooks/useMergedCells";

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
  const bg = categoryColor[code] ?? "#fff";

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

  const tooltipContent = (
    <Box sx={{ backgroundColor: 'rgba(0,0,0,0.75)', color: 'white', p: 1.5, borderRadius: '4px', minWidth: 220 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        {meta.label}: {meta.description}
      </Typography>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
            Результативность
          </Typography>
          {Array.from(perfCounts.entries()).map(([letter, count]) => (
            <Box key={letter} sx={{ display: "flex", justifyContent: "space-between", whiteSpace: "nowrap" }}>
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
            <Box key={letter} sx={{ display: "flex", justifyContent: "space-between", whiteSpace: "nowrap" }}>
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

  const displayCode = code.replace("_", " + ");

  return (
    <Tooltip
      title={tooltipContent}
      arrow
      placement="top"
      slotProps={{
        tooltip: {
          sx: { backgroundColor: 'transparent', boxShadow: 'none', userSelect: 'text' },
        },
        arrow: {
          sx: { color: 'rgba(0,0,0,0.75)' },
        },
      }}
    >
      <Card
        sx={{
          bgcolor: bg,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          textAlign: "center",
          cursor: "pointer",
          color: "white",
          transition: "all 0.2s ease",
          outline: isMax ? "3px solid #fff" : "2px solid transparent",
          outlineOffset: "-3px",
          "&:hover": {
            outlineColor: isMax ? "#fff" : "rgba(255,255,255,0.6)",
            opacity: 0.85,
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 1, display: "flex", flexDirection: "column" }}>
          <Typography variant="caption" sx={{ alignSelf: "flex-start", fontWeight: "bold", color: "white" }}>
            {displayCode}
          </Typography>
          <Typography variant="subtitle2" sx={{ mt: 0.5, fontWeight: "bold", color: "white" }}>
            {meta.label}
          </Typography>
          <Typography variant="caption" sx={{ mb: 0.5, color: "white" }}>
            {meta.description}
          </Typography>
          <Box sx={{ mt: "auto", display: "flex", justifyContent: "space-between" }}>
            <Box sx={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <Typography variant="body2">Руководители:</Typography>
              <Typography variant="body2">Преемники:</Typography>
              <Typography variant="body2">Не преемники:</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "stretch" }}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", mr: 1 }}>
                <Typography variant="body2">{managers}</Typography>
                <Typography variant="body2">{successors}</Typography>
                <Typography variant="body2">{nonSuccessors}</Typography>
              </Box>
              {showPercent && (
                <Box
                  sx={{
                    borderLeft: "1px solid",
                    borderColor: "white",
                    pl: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                  }}
                >
                  <Typography variant="body2">{finalManagerPercent}%</Typography>
                  <Typography variant="body2">{succPercent}%</Typography>
                  <Typography variant="body2">{nonSuccPercent}%</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  );
}