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
  useTheme,
} from "@mui/material";
import type { StatsResponse } from "@/entities/dashboard";
import type { ManagerListItem } from "@/entities/leader";
import { colors } from "@/shared/theme/tokens";

const SUCCESS_COLOR = colors.success;
const ERROR_COLOR = colors.error;
const NEUTRAL_COLOR = colors.primaryHover;

interface HorizontalBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
  percentText: string;
}

function HorizontalBar({ label, value, max, color, percentText }: HorizontalBarProps) {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 1.5,
        height: 30,
        borderRadius: 1,
        border: "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.2s ease",
        px: 1,
        "&:hover": {
          borderColor: "rgba(255,255,255,0.5)",
          bgcolor: "rgba(255,255,255,0.08)",
        },
      }}
    >
      {/* Левая зона — label + значение */}
      <Box sx={{ width: 160, flexShrink: 0, px: 1 }}>
        <Typography variant="body2" sx={{ color: "white", whiteSpace: "nowrap", lineHeight: "30px", fontSize: 13 }}>
          {label} {value}
        </Typography>
      </Box>

      {/* Центральная зона — бар с отступами сверху/снизу */}
      <Box
        sx={{
          flex: "1 1 auto",
          minWidth: 0,
          height: 30,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: 20,
            bgcolor: "rgba(255,255,255,0.15)",
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              height: "100%",
              width: `${percent}%`,
              bgcolor: color,
              borderRadius: 1,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
      </Box>

      {/* Правая зона — процент */}
      <Box sx={{ width: 55, flexShrink: 0, px: 1, textAlign: "right" }}>
        <Typography variant="body2" sx={{ color: "white", whiteSpace: "nowrap", lineHeight: "30px", fontSize: 13 }}>
          {percentText}
        </Typography>
      </Box>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const headerBg = isDark ? colors.surfaceDark : colors.primaryHover;
  const footerBg = isDark ? colors.surfaceDark : colors.primaryHover;
  const containerBg = isDark ? colors.surfaceVariantDark : colors.primary;
  const rowHoverBg = 'rgba(255,255,255,0.08)';
  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

  // --- Группировка должностей ---
  const criticalPositionsRaw = useMemo(() => {
    const map = new Map<string, { count: number; withSuccessors: number; withoutSuccessors: number }>();
    criticalLeaders.forEach((m) => {
      const entry = map.get(m.position) || { count: 0, withSuccessors: 0, withoutSuccessors: 0 };
      entry.count += 1;
      if (m.hasSuccessor) {
        entry.withSuccessors += 1;
      } else {
        entry.withoutSuccessors += 1;
      }
      map.set(m.position, entry);
    });
    return Array.from(map, ([position, data]) => ({
      position,
      ...data,
      displayPosition: capitalizeFirstLetter(position),
    }));
  }, [criticalLeaders]);

  // --- Сортировка ---
  const [sortField, setSortField] = useState<"position" | "count" | "withSuccessors" | "withoutSuccessors">("count");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const criticalPositions = useMemo(() => {
    const sorted = [...criticalPositionsRaw];
    sorted.sort((a, b) => {
      if (sortField === "position") {
        return sortDirection === "asc"
          ? a.displayPosition.localeCompare(b.displayPosition)
          : b.displayPosition.localeCompare(a.displayPosition);
      } else if (sortField === "withSuccessors") {
        return sortDirection === "asc" ? a.withSuccessors - b.withSuccessors : b.withSuccessors - a.withSuccessors;
      } else if (sortField === "withoutSuccessors") {
        return sortDirection === "asc" ? a.withoutSuccessors - b.withoutSuccessors : b.withoutSuccessors - a.withoutSuccessors;
      } else {
        return sortDirection === "asc" ? a.count - b.count : b.count - a.count;
      }
    });
    return sorted;
  }, [criticalPositionsRaw, sortField, sortDirection]);

  const handleSort = (field: "position" | "count" | "withSuccessors" | "withoutSuccessors") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection(field === "position" ? "asc" : "desc");
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
    <Box sx={{
      bgcolor: containerBg,
      color: 'white',
      p: 3,
      mb: 4,
      borderRadius: 2,
      outline: '2px solid transparent',
      transition: 'outline-color 0.2s ease',
      '&:hover': { outlineColor: colors.primary },
    }}>
      <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, cursor: "pointer", borderRadius: 1, px: 1.5, py: 0.5, transition: "all 0.2s ease", display: "inline-block", outline: "1px solid transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.08)", outlineColor: "rgba(255,255,255,0.3)" } }}>
            Критичные роли
          </Typography>
          <HorizontalBar
            label="Руководителей:"
            value={criticalTotal}
            max={totalManagers}
            color={NEUTRAL_COLOR}
            percentText={`${criticalTotalPercent}%`}
          />
          <HorizontalBar
            label="С преемниками:"
            value={criticalWith}
            max={totalManagers}
            color={SUCCESS_COLOR}
            percentText={criticalWithPercent}
          />
          <HorizontalBar
            label="Без преемников:"
            value={criticalWithout}
            max={totalManagers}
            color={ERROR_COLOR}
            percentText={criticalWithoutPercent}
          />

          <Typography variant="subtitle1" sx={{ mt: 4, mb: 1, cursor: "pointer", borderRadius: 1, px: 1.5, py: 0.5, transition: "all 0.2s ease", display: "inline-block", outline: "1px solid transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.08)", outlineColor: "rgba(255,255,255,0.3)" } }}>
            Некритичные роли
          </Typography>
          <HorizontalBar
            label="Руководителей:"
            value={nonCriticalTotal}
            max={totalManagers}
            color={NEUTRAL_COLOR}
            percentText={`${nonCriticalTotalPercent}%`}
          />
          <HorizontalBar
            label="С преемниками:"
            value={nonCriticalWith}
            max={totalManagers}
            color={SUCCESS_COLOR}
            percentText={nonCriticalWithPercent}
          />
          <HorizontalBar
            label="Без преемников:"
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
              borderRadius: 1,
              overflow: 'hidden',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
              outline: '2px solid transparent',
              transition: 'outline-color 0.2s ease',
              '&:hover': { outlineColor: colors.primary },
            }}
          >
            <Table sx={{ tableLayout: "fixed", width: "100%" }}>
              {/* ШАПКА ТАБЛИЦЫ */}
              <TableHead sx={{ bgcolor: headerBg }}>
                <TableRow sx={{ display: "flex" }}>
                  <TableCell
                    component="th"
                    scope="col"
                    sx={{
                      flex: 2,
                      fontWeight: "bold",
                      borderBottom: "none",
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
                    align="center"
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
                    onClick={() => handleSort("withSuccessors")}
                  >
                    С преемниками {sortField === "withSuccessors" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="col"
                    align="center"
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
                    onClick={() => handleSort("withoutSuccessors")}
                  >
                    Без преемников {sortField === "withoutSuccessors" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                  <TableCell
                    component="th"
                    scope="col"
                    align="center"
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
                    Всего {sortField === "count" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
            
            {/* ... тело таблицы ... */}
            <Box sx={{ flex: 1, overflowY: "auto" }}>
              <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableBody>
                  {criticalPositions.map((item) => (
                    <TableRow key={item.position} sx={{ display: "flex", cursor: "pointer", transition: "all 0.2s ease", "&:hover": { bgcolor: rowHoverBg } }}>
                      <TableCell
                        sx={{
                          flex: 2,
                          borderBottom: "1px solid",
                          borderColor: dividerColor,
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
                        align="center"
                        sx={{
                          flex: 1,
                          borderBottom: "1px solid",
                          borderColor: dividerColor,
                          padding: "6px 12px",
                          color: SUCCESS_COLOR,
                          fontWeight: 'bold',
                          textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
                        }}
                      >
                        {item.withSuccessors}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          flex: 1,
                          borderBottom: "1px solid",
                          borderColor: dividerColor,
                          padding: "6px 12px",
                          color: ERROR_COLOR,
                          fontWeight: 'bold',
                          textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff',
                        }}
                      >
                        {item.withoutSuccessors}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          flex: 1,
                          borderBottom: "1px solid",
                          borderColor: dividerColor,
                          padding: "6px 12px",
                          color: "white",
                          fontWeight: 'bold',
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
              <TableBody>
                <TableRow sx={{ display: "flex", bgcolor: footerBg }}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ flex: 2, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: "white" }}
                    >
                      Всего должностей: {criticalPositionsRaw.length}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ flex: 1, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: SUCCESS_COLOR, textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
                    >
                      {criticalPositionsRaw.reduce((sum, item) => sum + item.withSuccessors, 0)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ flex: 1, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: ERROR_COLOR, textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff' }}
                    >
                      {criticalPositionsRaw.reduce((sum, item) => sum + item.withoutSuccessors, 0)}
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ flex: 1, fontWeight: "bold", borderBottom: "none", padding: "6px 12px", whiteSpace: "nowrap", color: "white" }}
                    >
                      {criticalPositionsRaw.reduce((sum, item) => sum + item.count, 0)}
                    </TableCell>
                  </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}