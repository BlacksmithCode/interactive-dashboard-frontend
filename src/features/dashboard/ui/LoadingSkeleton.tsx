import { Box, Skeleton, Grid, Card, CardContent } from "@mui/material";

/**
 * Скелетон загрузки для панели сводной статистики.
 * Имитирует структуру KPI-карточек и матрицы 9-box.
 */
export function SummaryStatsSkeleton() {
  return (
    <Box>
      {/* Скелетоны KPI-карточек */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Скелетон матрицы 9-box */}
      <Skeleton variant="text" width="200px" height={32} sx={{ mb: 2 }} />
      <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
    </Box>
  );
}
