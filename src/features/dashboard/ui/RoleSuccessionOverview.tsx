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
} from "@mui/material";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis} from "recharts";
import type { StatsResponse } from "@/entities/dashboard";
import type { ManagerListItem } from "@/entities/leader";

const SUCCESS_COLOR = "#4caf50";
const ERROR_COLOR = "#f44336";
const NEUTRAL_COLOR = "#9e9e9e";
const REST_COLOR = "rgba(255,255,255,0.2)";

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
      <Typography variant="body2" sx={{ width: 140, flexShrink: 0, color: "white" }}>
        {label}: {value}
      </Typography>
      <Box sx={{ flexGrow: 1, height: 30, mx: 1 }}>
        <ResponsiveContainer width="99%" height={30} minWidth={1}>
          <BarChart layout="vertical" data={data}>
            <XAxis type="number" domain={[0, max]} hide />
            <YAxis type="category" dataKey="name" hide />
            <Bar dataKey="value" stackId="a" fill={color} />
            <Bar dataKey="rest" stackId="a" fill={REST_COLOR} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Typography variant="body2" sx={{ width: 50, textAlign: "right", color: "white" }}>
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

  // --- Функция форматирования процента (убирает .0) ---
  const formatPercent = (value: number): string => {
    const rounded = Math.round(value * 10) / 10;
    if (Number.isInteger(rounded)) {
      return `${rounded}%`;
    }
    return `${rounded.toFixed(1)}%`;
  };

  // --- Логика процентов с нормировкой и коррекцией суммы ---
  const getSubPercentPair = (
    groupTotal: number,
    subA: number,
    subB: number
  ): [string, string] => {
    if (groupTotal === 0) return ["0%", "0%"];
    // Общий процент группы (округлённый до целого)
    const totalPercent = Math.round((groupTotal / totalManagers) * 100);
    if (totalPercent === 0) return ["0%", "0%"];

    // Равные доли
    if (subA === subB && subA > 0) {
      const half = totalPercent / 2;
      const halfStr = formatPercent(half);
      return [halfStr, halfStr];
    }

    // Неравные доли – точные доли от totalPercent
    const exactA = (subA / groupTotal) * totalPercent;
    const exactB = (subB / groupTotal) * totalPercent;
    let roundedA = Math.round(exactA * 10) / 10;
    let roundedB = Math.round(exactB * 10) / 10;

    // Коррекция суммы, чтобы roundedA + roundedB = totalPercent
    const sum = roundedA + roundedB;
    const diff = totalPercent - sum;
    if (Math.abs(diff) > 0.01) {
      if (roundedA >= roundedB) {
        roundedA = Math.round((roundedA + diff) * 10) / 10;
      } else {
        roundedB = Math.round((roundedB + diff) * 10) / 10;
      }
    }

    return [formatPercent(roundedA), formatPercent(roundedB)];
  };

  const criticalTotal = stats.criticalRoles;
  const criticalWith = stats.criticalRolesWithSuccessors;
  const criticalWithout = stats.criticalRolesWithoutSuccessors;

  const nonCriticalTotal = stats.nonCriticalRoles;
  const nonCriticalWith = stats.nonCriticalRolesWithSuccessors;
  const nonCriticalWithout = stats.nonCriticalRolesWithoutSuccessors;

  const criticalTotalPercent = totalManagers > 0 ? Math.round((criticalTotal / totalManagers) * 100) : 0;
  const nonCriticalTotalPercent = totalManagers > 0 ? Math.round((nonCriticalTotal / totalManagers) * 100) : 0;

  const [criticalWithPercent, criticalWithoutPercent] = getSubPercentPair(criticalTotal, criticalWith, criticalWithout);
  const [nonCriticalWithPercent, nonCriticalWithoutPercent] = getSubPercentPair(nonCriticalTotal, nonCriticalWith, nonCriticalWithout);

  return (
    <Box sx={{ bgcolor: '#1DAFF7', color: 'white', p: 3, mb: 4, borderRadius: 2 }}>
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
          <Typography variant="h6" gutterBottom >
            Критичные должности
          </Typography>
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
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              {/* ШАПКА ТАБЛИЦЫ */}
              <TableHead sx={{ display: "block", backgroundColor: '#0088FF' }}>
                <TableRow sx={{ display: "flex" }}>
                  <TableCell
                    component="th"
                    scope="col"
                    sx={{
                      flex: 2,
                      fontWeight: "bold",
                      borderBottom: "none", // или "none"
                      padding: "8px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      color: "white",
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
                      borderBottom: "none",
                      padding: "8px 12px",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      color: "white",
                    }}
                    onClick={() => handleSort("count")}
                  >
                    Количество руководителей {sortField === "count" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
            
            {/* ... тело таблицы ... */}
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
                          color: "white",
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
                          color: "white",
                        }}
                      >
                        {item.count}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* ПОДВАЛ С ИТОГАМИ */}
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              <TableHead>
                <TableRow sx={{ display: "flex", backgroundColor: '#0088FF', borderRadius: '0 0 4px 4px' }}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{ flex: 2, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: "white" }}
                  >
                    Всего должностей: {criticalPositionsRaw.length}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ flex: 1, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: "white" }}
                  >
                    Всего руководителей: {criticalTotal}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}