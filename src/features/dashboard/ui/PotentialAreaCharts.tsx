import { useMemo, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import type { NineBoxResponse } from '@/entities/dashboard';

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

// Кастомный тултип для радарных графиков
const CustomTooltip = ({ active, payload, label, totalManagers = 0 }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const successors = data.successors || 0;
    const nonSuccessors = data.nonSuccessors || 0;
    const total = successors + nonSuccessors;

    let succPercent = 0;
    let nonSuccPercent = 0;
    if (total > 0) {
      succPercent = Math.round((successors / total) * 100);
      nonSuccPercent = Math.round((nonSuccessors / total) * 100);
      const diff = 100 - (succPercent + nonSuccPercent);
      if (diff !== 0) {
        // Балансируем округление, чтобы в сумме всегда было ровно 100%
        if (succPercent >= nonSuccPercent) succPercent += diff;
        else nonSuccPercent += diff;
      }
    }

    const managerPercent = totalManagers > 0 ? Math.round((total / totalManagers) * 100) : 0;
    
    return (
      <Box sx={{ backgroundColor: '#0088FF', color: 'white', p: 1.5, border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', minWidth: 150 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
        <Typography variant="body2" sx={{ color: '#a7f3d0', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <span>С преемниками:</span> <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{successors} ({succPercent}%)</span>
        </Typography>
        <Typography variant="body2" sx={{ color: '#fecaca', display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <span>Без преемников:</span> <span style={{ fontWeight: 'bold', marginLeft: '16px' }}>{nonSuccessors} ({nonSuccPercent}%)</span>
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1, pt: 0.5, borderTop: '1px solid rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Всего:</span> <span>{total} {totalManagers > 0 && `(${managerPercent}%)`}</span>
        </Typography>
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

    Object.entries(nineBox.cells).forEach(([key, cell]) => {
      const potKey = key[0] as 'A' | 'B' | 'C';
      const perfKey = key[1] as 'A' | 'B' | 'C' | 'D' | 'E';
      
      potCounts[potKey].succ += cell.successors;
      potCounts[potKey].non += cell.nonSuccessors;

      perfCounts[perfKey].succ += cell.successors;
      perfCounts[perfKey].non += cell.nonSuccessors;
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
          <FormControlLabel
            control={<Switch checked={unifiedScale} onChange={(e) => setUnifiedScale(e.target.checked)} color="info" size="small" />}
            label={<Typography variant="body2" sx={{ userSelect: 'none' }}>Единый масштаб</Typography>}
            labelPlacement="start"
          />
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
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            Потенциал
          </Typography>
          <Box sx={{ height: 300, minHeight: 300, minWidth: 200, width: '100%' }}>
            {hasPotential ? (
              <ResponsiveContainer width="100%" height="100%">
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
                  
                  <Tooltip content={<CustomTooltip totalManagers={totalManagers} />} />
                  
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
        </Box>

        {/* График Результативности (Пятиугольник) */}
        <Box sx={{ flex: 1, width: '100%', maxWidth: 500 }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            Результативность
          </Typography>
          <Box sx={{ height: 300, minHeight: 300, minWidth: 200, width: '100%' }}>
            {hasPerformance ? (
              <ResponsiveContainer width="100%" height="100%">
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
                  
                  <Tooltip content={<CustomTooltip totalManagers={totalManagers} />} />
                  
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
        </Box>
      </Box>

      {/* Интерактивная кастомная легенда */}
      {(hasPotential || hasPerformance) && (
        <Box sx={{ display: 'flex', gap: 4, mt: 4, userSelect: 'none' }}>
          <Box 
            onClick={() => toggleSeries('successors')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', opacity: activeSeries === 'nonSuccessors' ? 0.4 : 1, transition: 'opacity 0.2s' }}
          >
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#2f9d76' }} />
            <Typography variant="body2" sx={{ fontWeight: activeSeries === 'successors' ? 'bold' : 'normal' }}>
              С преемниками
            </Typography>
          </Box>
          
          <Box 
            onClick={() => toggleSeries('nonSuccessors')}
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer', opacity: activeSeries === 'successors' ? 0.4 : 1, transition: 'opacity 0.2s' }}
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
