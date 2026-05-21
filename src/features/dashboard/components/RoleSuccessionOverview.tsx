import { useMemo, useState } from "react";
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
  max: number;
  color: string;
  percentText: string;
}

function HorizontalBar({ label, value, max, color, percentText }: HorizontalBarProps) {
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
        {percentText}
      </Typography>
    </Box>
  );
}

function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

interface RoleSuccessionOverviewProps {
  stats: StatsResponse;
  criticalLeaders: ManagerListItem[];
  totalManagers: number;
}

export function RoleSuccessionOverview({ stats, criticalLeaders, totalManagers }: RoleSuccessionOverviewProps) {
  // --- Группировка должностей ---
  const criticalPositionsRaw = useMemo(() => {
    const map = new Map<string, number>();
    criticalLeaders.forEach((m) => {
      map.set(m.position, (map.get(m.position) || 0) + 1);
    });
    return Array.from(map, ([position, count]) => ({
      position,
      count,
      displayPosition: capitalizeFirstLetter(position),
    }));
  }, [criticalLeaders]);

  // --- Сортировка ---
  const [sortField, setSortField] = useState<"position" | "count">("count");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const criticalPositions = useMemo(() => {
    const sorted = [...criticalPositionsRaw];
    sorted.sort((a, b) => {
      if (sortField === "position") {
        return sortDirection === "asc"
          ? a.displayPosition.localeCompare(b.displayPosition)
          : b.displayPosition.localeCompare(a.displayPosition);
      } else {
        return sortDirection === "asc" ? a.count - b.count : b.count - a.count;
      }
    });
    return sorted;
  }, [criticalPositionsRaw, sortField, sortDirection]);

  const handleSort = (field: "position" | "count") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "count" ? "desc" : "asc");
    }
  };

  // --- Логика процентов (как ранее) ---
  const getSubPercent = (groupTotal: number, subValue: number, otherSubValue: number) => {
    if (groupTotal === 0) return "0%";
    const totalPercent = Math.round((groupTotal / totalManagers) * 100);
    if (subValue === otherSubValue && subValue > 0) {
      const half = (totalPercent / 2).toFixed(1);
      return `${half}%`;
    }
    const exact = (subValue / groupTotal) * totalPercent;
    return `${exact.toFixed(1)}%`;
  };

  const criticalTotal = stats.criticalRoles;
  const criticalWith = stats.criticalRolesWithSuccessors;
  const criticalWithout = stats.criticalRolesWithoutSuccessors;

  const nonCriticalTotal = stats.nonCriticalRoles;
  const nonCriticalWith = stats.nonCriticalRolesWithSuccessors;
  const nonCriticalWithout = stats.nonCriticalRolesWithoutSuccessors;

  const criticalTotalPercent = totalManagers > 0 ? Math.round((criticalTotal / totalManagers) * 100) : 0;
  const nonCriticalTotalPercent = totalManagers > 0 ? Math.round((nonCriticalTotal / totalManagers) * 100) : 0;

  const criticalWithPercent = getSubPercent(criticalTotal, criticalWith, criticalWithout);
  const criticalWithoutPercent = getSubPercent(criticalTotal, criticalWithout, criticalWith);
  const nonCriticalWithPercent = getSubPercent(nonCriticalTotal, nonCriticalWith, nonCriticalWithout);
  const nonCriticalWithoutPercent = getSubPercent(nonCriticalTotal, nonCriticalWithout, nonCriticalWith);

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
      <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Критичные роли
          </Typography>
          <HorizontalBar
            label="Руководителей"
            value={criticalTotal}
            max={totalManagers}
            color={NEUTRAL_COLOR}
            percentText={`${criticalTotalPercent}%`}
          />
          <HorizontalBar
            label="С преемниками"
            value={criticalWith}
            max={totalManagers}
            color={SUCCESS_COLOR}
            percentText={criticalWithPercent}
          />
          <HorizontalBar
            label="Без преемников"
            value={criticalWithout}
            max={totalManagers}
            color={ERROR_COLOR}
            percentText={criticalWithoutPercent}
          />

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1 }}>
            Некритичные роли
          </Typography>
          <HorizontalBar
            label="Руководителей"
            value={nonCriticalTotal}
            max={totalManagers}
            color={NEUTRAL_COLOR}
            percentText={`${nonCriticalTotalPercent}%`}
          />
          <HorizontalBar
            label="С преемниками"
            value={nonCriticalWith}
            max={totalManagers}
            color={SUCCESS_COLOR}
            percentText={nonCriticalWithPercent}
          />
          <HorizontalBar
            label="Без преемников"
            value={nonCriticalWithout}
            max={totalManagers}
            color={ERROR_COLOR}
            percentText={nonCriticalWithoutPercent}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Критичные должности
          </Typography>
          {/* Контейнер таблицы с прокруткой тела и фиксированным подвалом */}
          <Box
            sx={{
              height: 300,
              display: "flex",
              flexDirection: "column",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            {/* Заголовок (фиксированный) */}
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead sx={{ display: "block" }}>
                <TableRow sx={{ display: "flex" }}>
                  <TableCell
                    component="th"
                    scope="col"
                    sx={{
                      flex: 2,
                      fontWeight: "bold",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      padding: "8px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("position")}
                  >
                    Должность {sortField === "position" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="col"
                    align="right"
                    sx={{
                      flex: 1,
                      fontWeight: "bold",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      padding: "8px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                    }}
                    onClick={() => handleSort("count")}
                  >
                    Количество руководителей {sortField === "count" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>

            {/* Тело с прокруткой */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableBody>
                  {criticalPositions.map((item) => (
                    <TableRow key={item.position} sx={{ display: "flex" }}>
                      <TableCell
                        sx={{
                          flex: 2,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          padding: "6px 12px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {item.displayPosition}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          flex: 1,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          padding: "6px 12px",
                        }}
                      >
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Подвал (фиксированный) */}
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow
                  sx={{
                    display: "flex",
                    borderTop: "2px solid",
                    borderTopColor: "grey.400",
                    backgroundColor: "background.paper",
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      flex: 2,
                      fontWeight: "bold",
                      borderBottom: "none",
                      padding: "6px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Всего должностей: {criticalPositionsRaw.length}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      flex: 1,
                      fontWeight: "bold",
                      borderBottom: "none",
                      padding: "6px 12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Всего руководителей: {criticalTotal}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}