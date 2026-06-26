import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import { colors } from "@/shared/theme/tokens";

interface KpiCardProps {
  title: string;
  value: number;
  total?: number;
  /** Если передан — процент считается от percentValue, а не от value */
  percentValue?: number;
  color?: string;
}

/**
 * Карточка ключевого показателя (KPI) в стиле Т1.
 * Отображает значение и опционально процент от общего числа.
 */
export function KpiCard({ title, value, total, percentValue, color }: KpiCardProps) {
  const base = percentValue !== undefined ? percentValue : value;
  const percent =
    total !== undefined && total > 0
      ? Math.round((base / total) * 100)
      : undefined;

  return (
    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
      <Card
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: color || "background.paper",
          "&::before": color
            ? {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: colors.gradientPrimary,
              }
            : undefined,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em" }}
          >
            {title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 900 }}>
              {value}
            </Typography>
            {percent !== undefined && (
              <Typography
                variant="body1"
                component="span"
                sx={{
                  color: percent > 70 ? colors.success : percent > 40 ? colors.warning : colors.error,
                  fontWeight: 600,
                  textShadow: `0 0 6px rgba(255,255,255,0.5)`,
                }}
              >
                ({percent}%)
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Grid>
  );
}
