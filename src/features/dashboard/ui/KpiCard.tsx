import { Grid, Card, CardContent, Typography } from "@mui/material";

interface KpiCardProps {
  title: string;
  value: number;
  total?: number;
  /** Если передан — процент считается от percentValue, а не от value */
  percentValue?: number;
  color?: string;
}

/**
 * Карточка ключевого показателя (KPI).
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
      <Card variant="outlined" sx={color ? { bgcolor: color } : undefined}>
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
