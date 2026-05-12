import { useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis} from "recharts";
import type { ManagerListItem, StatsResponse } from "../../../types/dashboard";

const SUCCESS_COLOR = "#4caf50";
const ERROR_COLOR = "#f44336";
const NEUTRAL_COLOR = "#9e9e9e";
const REST_COLOR = "#f5f5f5";

interface HorizontalBarProps {
  label: string;
  value: number;
  max: number; // общее количество руководителей (totalManagers)
  color: string;
}

function HorizontalBar({ label, value, max, color }: HorizontalBarProps) {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const data = [{ name: "", value, rest: max - value }];

  return (
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, height: 30 }}>
      <Typography variant="body2" sx={{ width: 140, flexShrink: 0 }}>
        {label}: {value}
      </Typography>
      <Box sx={{ flexGrow: 1, height: "100%", mx: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart layout="vertical" data={data}>
            <XAxis type="number" domain={[0, max]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="value" stackId="a" fill={color} />
            <Bar dataKey="rest" stackId="a" fill={REST_COLOR} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="body2" sx={{ width: 50, textAlign: "right" }}>
        {percent}%
      </Typography>
    </Box>
  );
}

interface RoleSuccessionOverviewProps {
  stats: StatsResponse;
  criticalLeaders: ManagerListItem[];
  totalManagers: number;
}

/** Приводит первую букву к заглавной, остальные к строчным */
function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function RoleSuccessionOverview({ stats, criticalLeaders, totalManagers }: RoleSuccessionOverviewProps) {
  const criticalPositions = useMemo(() => {
    const map = new Map<string, number>();
    criticalLeaders.forEach((m) => {
      map.set(m.position, (map.get(m.position) || 0) + 1);
    });
    return Array.from(map, ([position, count]) => ({
      position,
      count,
      displayPosition: capitalizeFirstLetter(position),
    }))
      .sort((a, b) => b.count - a.count);
  }, [criticalLeaders]);

  const nonCriticalTotal = stats.nonCriticalRoles;
  const nonCriticalWith = stats.nonCriticalRolesWithSuccessors;
  const nonCriticalWithout = stats.nonCriticalRolesWithoutSuccessors;

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={4} sx={{ alignItems: 'flex-start' }}>
        {/* Левая часть: гистограммы */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Критические роли
          </Typography>
          <HorizontalBar
            label="Руководителей"
            value={stats.criticalRoles}
            max={totalManagers}
            color={NEUTRAL_COLOR}
          />
          <HorizontalBar
            label="С преемниками"
            value={stats.criticalRolesWithSuccessors}
            max={totalManagers}
            color={SUCCESS_COLOR}
          />
          <HorizontalBar
            label="Без преемников"
            value={stats.criticalRolesWithoutSuccessors}
            max={totalManagers}
            color={ERROR_COLOR}
          />

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
            Некритические роли
          </Typography>
          <HorizontalBar
            label="Руководителей"
            value={nonCriticalTotal}
            max={totalManagers}
            color={NEUTRAL_COLOR}
          />
          <HorizontalBar
            label="С преемниками"
            value={nonCriticalWith}
            max={totalManagers}
            color={SUCCESS_COLOR}
          />
          <HorizontalBar
            label="Без преемников"
            value={nonCriticalWithout}
            max={totalManagers}
            color={ERROR_COLOR}
          />
        </Grid>

        {/* Правая часть: таблица критических должностей */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Критические должности
          </Typography>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Должность</strong></TableCell>
                  <TableCell align="right"><strong>Количество руководителей</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criticalPositions.map((item) => (
                  <TableRow key={item.position}>
                    <TableCell>{item.displayPosition}</TableCell>
                    <TableCell align="right">{item.count}</TableCell>
                  </TableRow>
                ))}
                <TableRow sx={{ "& td": { fontWeight: "bold", borderTop: "2px solid", borderTopColor: "grey.400" } }}>
                  <TableCell>Всего уникальных должностей: {criticalPositions.length}</TableCell>
                  <TableCell align="right">Всего руководителей: {stats.criticalRoles}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}