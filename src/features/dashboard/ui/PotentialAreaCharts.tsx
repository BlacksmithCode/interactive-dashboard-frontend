import { useMemo, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import type { NineBoxResponse } from '@/entities/dashboard';
import { MERGE_RULES } from '../hooks/useMergedCells';

interface PotentialAreaChartsProps {
  nineBox: NineBoxResponse;
  totalManagers: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  payload: {
    subject: string;
    successors: number;
    nonSuccessors: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  totalManagers?: number;
}

interface CustomTickProps {
  payload?: { value: string };
  x?: number | string;
  y?: number | string;
  cy?: number | string;
  textAnchor?: 'inherit' | 'end' | 'start' | 'middle';
  data?: Array<{ subject: string; successors: number; nonSuccessors: number }>;
  activeSeries?: 'successors' | 'nonSuccessors' | null;
}

// Кастомный рендер углов графика (Буква + Значение)
const CustomTick = (props: CustomTickProps) => {
  const { payload, x, y, cy, textAnchor, data, activeSeries } = props;
  if (!payload || !data || y === undefined) return null;

  const dataPoint = data.find(d => d.subject === payload.value);
  if (!dataPoint) return null;

  let displayValue: number;
  let color: string;

  if (!activeSeries) {
    displayValue = dataPoint.successors + dataPoint.nonSuccessors;
    color = 'white'; // Белый для общей суммы
  } else if (activeSeries === 'successors') {
    displayValue = dataPoint.successors;
    color = '#a7f3d0'; // Светло-зеленый
  } else {
    displayValue = dataPoint.nonSuccessors;
    color = '#fecaca'; // Светло-красный
  }

  const numY = Number(y);
  const numCy = Number(cy);
  // Определяем, находится ли точка в верхней половине (координата y меньше центра cy)
  const isTop = !isNaN(numY) && !isNaN(numCy) && numY < numCy - 10;

  // Для верхней точки: и букву, и значение выталкиваем ВВЕРХ (уменьшаем y от края)
  // Для нижних/боковых точек: выталкиваем ВНИЗ (увеличиваем y от края)
  const letterY = isTop ? numY - 24 : numY + 10;
  const valueY = isTop ? numY - 8 : numY + 26;

  return (
    <text x={x} y={y} textAnchor={textAnchor} dominantBaseline="central">
      {/* Буква угла */}
      <tspan x={x} y={letterY} fill="white" fontSize={14} fontWeight="bold">{payload.value}</tspan>
      {/* Значение (скрываем если 0, чтобы не шуметь) */}
      {displayValue > 0 && (
        <tspan x={x} y={valueY} fill={color} fontSize={14} fontWeight="bold">{displayValue}</tspan>
      )}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  totalManagers?: number;
  seriesType?: 'successors' | 'nonSuccessors' | null;
  chartData?: Array<{ subject: string; successors: number; nonSuccessors: number }>;
}

// Кастомный тултип для радарных графиков
const CustomTooltip = ({ active, payload, label, totalManagers = 0, seriesType, chartData }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const currentSubject = label;
    const currentSuccessors = data.successors || 0;
    const currentNonSuccessors = data.nonSuccessors || 0;

    // Если выбрана серия
    if (seriesType && chartData) {
      // Находим текущую точку
      const currentPoint = chartData.find(d => d.subject === currentSubject);
      if (!currentPoint) return null;

      const currentValue = seriesType === 'successors' ? currentPoint.successors : currentPoint.nonSuccessors;

      // Сравниваем с остальными точками
      const others = chartData
        .filter(d => d.subject !== currentSubject)
        .map(d => {
          const otherValue = seriesType === 'successors' ? d.successors : d.nonSuccessors;
          const diff = currentValue - otherValue;
          const percentDiff = otherValue > 0 ? Math.round((Math.abs(diff) / otherValue) * 100) : 0;
          return {
            label: d.subject,
            value: otherValue,
            diff,
            percentDiff: diff > 0 ? `+${percentDiff}%` : diff < 0 ? `-${percentDiff}%` : '0%',
            isGreater: diff > 0,
          };
        })
        .sort((a, b) => b.value - a.value);

      return (
        <Box sx={{ backgroundColor: 'rgba(0,0,0,0.85)', color: 'white', p: 1.5, borderRadius: '4px', minWidth: 220, pointerEvents: 'auto', userSelect: 'text' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: 13 }}>{currentSubject}</Typography>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1, pb: 1, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: seriesType === 'successors' ? '#2f9d76' : '#ee5d48', mr: 1 }} />
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 13 }}>
              {seriesType === 'successors' ? 'С преемниками' : 'Без преемников'}: {currentValue}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block', mb: 0.5 }}>
            Сравнение с другими:
          </Typography>
          {others.map((other) => (
            <Box key={other.label} sx={{ display: "flex", alignItems: "center", fontSize: 12, mb: 0.3 }}>
              <Typography sx={{ width: 25, fontWeight: 'bold' }}>{other.label}</Typography>
              <Typography sx={{ width: 30, textAlign: 'right', mr: 1 }}>{other.value}</Typography>
              <Typography
                sx={{
                  color: other.isGreater ? '#69f0ae' : '#ff6b6b',
                  fontWeight: 'bold',
                  fontSize: 11,
                }}
              >
                {other.diff > 0 ? '▲' : other.diff < 0 ? '▼' : '•'} {other.percentDiff}
              </Typography>
            </Box>
          ))}
        </Box>
      );
    }

    // Если серия не выбрана — показываем successors vs nonSuccessors
    const total = currentSuccessors + currentNonSuccessors;

    let succPercent = 0;
    let nonSuccPercent = 0;
    if (total > 0) {
      succPercent = Math.round((currentSuccessors / total) * 100);
      nonSuccPercent = Math.round((currentNonSuccessors / total) * 100);
      const diff = 100 - (succPercent + nonSuccPercent);
      if (diff !== 0) {
        if (succPercent >= nonSuccPercent) succPercent += diff;
        else nonSuccPercent += diff;
      }
    }

    const managerPercent = totalManagers > 0 ? Math.round((total / totalManagers) * 100) : 0;

    return (
      <Box sx={{ backgroundColor: 'rgba(0,0,0,0.85)', color: 'white', p: 1.5, borderRadius: '4px', minWidth: 220, pointerEvents: 'auto', userSelect: 'text' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, fontSize: 13 }}>{label}</Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", gap: 2 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#2f9d76', mr: 0.5, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: 12 }}>С преемниками:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto', fontSize: 12 }}>{currentSuccessors} ({succPercent}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", gap: 2 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ee5d48', mr: 0.5, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: 12 }}>Без преемников:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto', fontSize: 12 }}>{currentNonSuccessors} ({nonSuccPercent}%)</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", borderTop: '1px solid rgba(255,255,255,0.3)', pt: 0.5, mt: 0.5, whiteSpace: "nowrap", gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: 12 }}>Всего:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', ml: 'auto', fontSize: 12 }}>{total} {totalManagers > 0 && `(${managerPercent}%)`}</Typography>
          </Box>
        </Box>
      </Box>
    );
  }
  return null;
};

export function PotentialAreaCharts({ nineBox, totalManagers }: PotentialAreaChartsProps) {
  const [activeSeries, setActiveSeries] = useState<'successors' | 'nonSuccessors' | null>(null);
  const [unifiedScale, setUnifiedScale] = useState(true);

  const { potentialData, performanceData } = useMemo(() => {
    const potCounts = { A: { succ: 0, non: 0 }, B: { succ: 0, non: 0 }, C: { succ: 0, non: 0 } };
    const perfCounts = { A: { succ: 0, non: 0 }, B: { succ: 0, non: 0 }, C: { succ: 0, non: 0 }, D: { succ: 0, non: 0 }, E: { succ: 0, non: 0 } };

    // Бэкенд возвращает merged-ключи (AD_AE, AC, AA_AB...).
    // Разбираем каждый merged-ключ на исходные ячейки (AD, AE) через MERGE_RULES
    // и делим данные поровну, чтобы не задваивать счётчики.
    Object.entries(nineBox.cells).forEach(([mergedKey, cell]) => {
      const originalKeys = MERGE_RULES[mergedKey as keyof typeof MERGE_RULES];
      if (!originalKeys) return;

      const share = 1 / originalKeys.length;
      originalKeys.forEach((key) => {
        const potKey = key[0] as 'A' | 'B' | 'C';
        const perfKey = key[1] as 'A' | 'B' | 'C' | 'D' | 'E';
        
        potCounts[potKey].succ += Math.round(cell.successors * share);
        potCounts[potKey].non += Math.round(cell.nonSuccessors * share);

        perfCounts[perfKey].succ += Math.round(cell.successors * share);
        perfCounts[perfKey].non += Math.round(cell.nonSuccessors * share);
      });
    });

    const potData = [
      { subject: 'A', successors: potCounts.A.succ, nonSuccessors: potCounts.A.non },
      { subject: 'B', successors: potCounts.B.succ, nonSuccessors: potCounts.B.non },
      { subject: 'C', successors: potCounts.C.succ, nonSuccessors: potCounts.C.non },
    ];

    const perfData = [
      { subject: 'A', successors: perfCounts.A.succ, nonSuccessors: perfCounts.A.non },
      { subject: 'B', successors: perfCounts.B.succ, nonSuccessors: perfCounts.B.non },
      { subject: 'C', successors: perfCounts.C.succ, nonSuccessors: perfCounts.C.non },
      { subject: 'D', successors: perfCounts.D.succ, nonSuccessors: perfCounts.D.non },
      { subject: 'E', successors: perfCounts.E.succ, nonSuccessors: perfCounts.E.non },
    ];

    return { potentialData: potData, performanceData: perfData };
  }, [nineBox]);

  // Сводные таблицы для графиков
  const [potSortField, setPotSortField] = useState<'label' | 'count'>('count');
  const [potSortDirection, setPotSortDirection] = useState<'asc' | 'desc'>('desc');
  const [perfSortField, setPerfSortField] = useState<'label' | 'count'>('count');
  const [perfSortDirection, setPerfSortDirection] = useState<'asc' | 'desc'>('desc');

  const handlePotSort = (field: 'label' | 'count') => {
    if (potSortField === field) {
      setPotSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setPotSortField(field);
      setPotSortDirection(field === 'label' ? 'asc' : 'desc');
    }
  };

  const handlePerfSort = (field: 'label' | 'count') => {
    if (perfSortField === field) {
      setPerfSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setPerfSortField(field);
      setPerfSortDirection(field === 'label' ? 'asc' : 'desc');
    }
  };

  const potSummary = useMemo(() => {
    const data = potentialData.map(d => ({
      label: d.subject === 'A' ? 'A (Высокий)' : d.subject === 'B' ? 'B (Средний)' : 'C (Низкий)',
      count: d.successors + d.nonSuccessors,
    }));
    data.sort((a, b) => {
      if (potSortField === 'label') {
        return potSortDirection === 'asc' ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      }
      return potSortDirection === 'asc' ? a.count - b.count : b.count - a.count;
    });
    return data;
  }, [potentialData, potSortField, potSortDirection]);

  const perfSummary = useMemo(() => {
    const data = performanceData.map(d => ({
      label: d.subject === 'A' ? 'A (Высшая)' : d.subject === 'B' ? 'B (Высокая)' : d.subject === 'C' ? 'C (Нормальная)' : d.subject === 'D' ? 'D (Сниженная)' : 'E (Низкая)',
      count: d.successors + d.nonSuccessors,
    }));
    data.sort((a, b) => {
      if (perfSortField === 'label') {
        return perfSortDirection === 'asc' ? a.label.localeCompare(b.label) : b.label.localeCompare(a.label);
      }
      return perfSortDirection === 'asc' ? a.count - b.count : b.count - a.count;
    });
    return data;
  }, [performanceData, perfSortField, perfSortDirection]);

  const renderSummaryTable = (
    data: Array<{ label: string; count: number }>,
    onSort: (field: 'label' | 'count') => void,
    sortField: 'label' | 'count',
    sortDirection: 'asc' | 'desc'
  ) => {
    const total = data.reduce((sum, d) => sum + d.count, 0);
    return (
      <Box sx={{ mt: 2, width: '100%' }}>
        <Table size="small" sx={{ bgcolor: 'rgba(0,0,0,0.15)', borderRadius: 1, fontSize: 13 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>
              <TableCell
                component="th"
                scope="col"
                sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                onClick={() => onSort('label')}
              >
                Оценка {sortField === 'label' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell
                component="th"
                scope="col"
                align="right"
                sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                onClick={() => onSort('count')}
              >
                Кол-во {sortField === 'count' && (sortDirection === 'asc' ? '↑' : '↓')}
              </TableCell>
              <TableCell
                component="th"
                scope="col"
                align="right"
                sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', userSelect: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' } }}
                onClick={() => onSort('count')}
              >
                % от всего
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow
                key={row.label}
                sx={{
                  bgcolor: '#1daff7',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: 'rgba(29, 175, 247, 0.85)', outline: '1px solid rgba(255,255,255,0.3)' },
                  '&:last-child td': { borderBottom: 0 },
                  '& .MuiTableCell-root': { color: 'white',},
                }}
              >
                <TableCell sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.label}</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.count}</TableCell>
                <TableCell align="right" sx={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {Math.round((row.count / total) * 100)}%
                </TableCell>
              </TableRow>
            ))}
            <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.08)' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>Всего</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>{total}</TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                {totalManagers > 0 ? Math.round((total / totalManagers) * 100) : 0}%
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  };

  // Умный расчет осей
  const { potDomainMax, perfDomainMax } = useMemo(() => {
    const getChartMax = (data: Array<{ successors: number, nonSuccessors: number }>) => {
      let max = 0;
      data.forEach(d => {
        if (activeSeries === 'successors' || !activeSeries) max = Math.max(max, d.successors);
        if (activeSeries === 'nonSuccessors' || !activeSeries) max = Math.max(max, d.nonSuccessors);
      });
      return max;
    };

    // Алгоритм "красивого" округления шкалы до числа, которое ровно делится на 4 интервала
    const getNiceMax = (maxValue: number) => {
      if (maxValue <= 4) return 4;
      const target = maxValue / 4;
      const power = Math.floor(Math.log10(target));
      const mag = Math.pow(10, power);
      const factor = target / mag;
      
      let stepFactor;
      if (factor <= 1) stepFactor = 1;
      else if (factor <= 2) stepFactor = 2;
      else if (factor <= 2.5) stepFactor = 2.5;
      else if (factor <= 3) stepFactor = 3;
      else if (factor <= 4) stepFactor = 4;
      else if (factor <= 5) stepFactor = 5;
      else stepFactor = 10;

      const step = Math.max(1, Math.ceil(stepFactor * mag));
      return step * 4;
    };

    const potNice = getNiceMax(getChartMax(potentialData));
    const perfNice = getNiceMax(getChartMax(performanceData));
    
    if (unifiedScale) {
      const unifiedMax = Math.max(potNice, perfNice);
      return { potDomainMax: unifiedMax, perfDomainMax: unifiedMax };
    }
    return { potDomainMax: potNice, perfDomainMax: perfNice };
  }, [potentialData, performanceData, activeSeries, unifiedScale]);

  const hasPotential = potentialData.some(d => d.successors > 0 || d.nonSuccessors > 0);
  const hasPerformance = performanceData.some(d => d.successors > 0 || d.nonSuccessors > 0);

  const toggleSeries = (series: 'successors' | 'nonSuccessors') => {
    setActiveSeries(prev => prev === series ? null : series);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1, pb: 2, px: 2, color: 'white' }}>
      {/* Переключатель единого масштаба */}
      {(hasPotential && hasPerformance) && (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', px: { xs: 1, md: 4 }, mb: 1 }}>
          <Box 
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', borderRadius: 1, px: 1.5, py: 0.5, transition: 'all 0.2s ease', border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.3)' } }}
          >
            <FormControlLabel
              control={<Switch checked={unifiedScale} onChange={(e) => setUnifiedScale(e.target.checked)} color="info" size="small" />}
              label={<Typography variant="body2" sx={{ userSelect: 'none' }}>Единый масштаб</Typography>}
              labelPlacement="start"
            />
          </Box>
        </Box>
      )}

      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 4,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%'
        }}
      >
        {/* График Потенциала (Треугольник) */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: 500 }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', cursor: 'pointer', borderRadius: 1, px: 2, py: 0.5, transition: 'all 0.2s ease', outline: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', outlineColor: 'rgba(255,255,255,0.3)' } }}>
            Потенциал
          </Typography>
          <Box sx={{ height: 300, minHeight: 300, minWidth: 200, width: '100%' }}>
            {hasPotential ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={potentialData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                  tick={(tickProps: CustomTickProps) => <CustomTick {...tickProps} data={potentialData} activeSeries={activeSeries} />} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, potDomainMax]}
                    tickCount={5}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} 
                  />
                  
                  <Tooltip 
                    content={<CustomTooltip totalManagers={totalManagers} seriesType={activeSeries} chartData={potentialData} />} 
                    isAnimationActive={true}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />
                  
                  {(!activeSeries || activeSeries === 'successors') && (
                    <Radar
                      name="С преемниками"
                      dataKey="successors"
                      stroke="#2f9d76"
                      fill="#2f9d76"
                      fillOpacity={activeSeries ? 0.7 : 0.4}
                      strokeOpacity={1}
                      isAnimationActive={true}
                    />
                  )}
                  {(!activeSeries || activeSeries === 'nonSuccessors') && (
                    <Radar
                      name="Без преемников"
                      dataKey="nonSuccessors"
                      stroke="#ee5d48"
                      fill="#ee5d48"
                      fillOpacity={activeSeries ? 0.7 : 0.4}
                      strokeOpacity={1}
                      isAnimationActive={true}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Нет данных</Typography>
              </Box>
            )}
          </Box>
          {hasPotential && renderSummaryTable(potSummary, handlePotSort, potSortField, potSortDirection)}
        </Box>

        {/* График Результативности (Пятиугольник) */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: 500 }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', cursor: 'pointer', borderRadius: 1, px: 2, py: 0.5, transition: 'all 0.2s ease', outline: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', outlineColor: 'rgba(255,255,255,0.3)' } }}>
            Результативность
          </Typography>
          <Box sx={{ height: 300, minHeight: 300, minWidth: 200, width: '100%' }}>
            {hasPerformance ? (
              <ResponsiveContainer width="100%" height={300} minHeight={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                  tick={(tickProps: CustomTickProps) => <CustomTick {...tickProps} data={performanceData} activeSeries={activeSeries} />} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, perfDomainMax]}
                    tickCount={5}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} 
                  />
                  
                  <Tooltip 
                    content={<CustomTooltip totalManagers={totalManagers} seriesType={activeSeries} chartData={performanceData} />} 
                    isAnimationActive={true}
                    animationDuration={200}
                    animationEasing="ease-out"
                  />
                  
                  {(!activeSeries || activeSeries === 'successors') && (
                    <Radar
                      name="С преемниками"
                      dataKey="successors"
                      stroke="#2f9d76"
                      fill="#2f9d76"
                      fillOpacity={activeSeries ? 0.7 : 0.4}
                      strokeOpacity={1}
                      isAnimationActive={true}
                    />
                  )}
                  {(!activeSeries || activeSeries === 'nonSuccessors') && (
                    <Radar
                      name="Без преемников"
                      dataKey="nonSuccessors"
                      stroke="#ee5d48"
                      fill="#ee5d48"
                      fillOpacity={activeSeries ? 0.7 : 0.4}
                      strokeOpacity={1}
                      isAnimationActive={true}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Нет данных</Typography>
              </Box>
            )}
          </Box>
          {hasPerformance && renderSummaryTable(perfSummary, handlePerfSort, perfSortField, perfSortDirection)}
        </Box>
      </Box>

      {/* Интерактивная кастомная легенда */}
      {(hasPotential || hasPerformance) && (
        <Box sx={{ display: 'flex', gap: 4, mt: 4, userSelect: 'none' }}>
          <Box 
            onClick={() => toggleSeries('successors')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', opacity: activeSeries === 'nonSuccessors' ? 0.4 : 1, transition: 'all 0.2s', borderRadius: 1, px: 1.5, py: 0.5, border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.3)' } }}
          >
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#2f9d76' }} />
            <Typography variant="body2" sx={{ fontWeight: activeSeries === 'successors' ? 'bold' : 'normal' }}>
              С преемниками
            </Typography>
          </Box>
          
          <Box 
            onClick={() => toggleSeries('nonSuccessors')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', opacity: activeSeries === 'successors' ? 0.4 : 1, transition: 'all 0.2s', borderRadius: 1, px: 1.5, py: 0.5, border: '1px solid transparent', '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.3)' } }}
          >
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ee5d48' }} />
            <Typography variant="body2" sx={{ fontWeight: activeSeries === 'nonSuccessors' ? 'bold' : 'normal' }}>
              Без преемников
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
