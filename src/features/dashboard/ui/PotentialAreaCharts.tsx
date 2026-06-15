import { useMemo, useState } from 'react';
import { Box, Typography, Switch, FormControlLabel } from '@mui/material';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import type { NineBoxResponse } from '@/entities/dashboard';

interface PotentialAreaChartsProps {
  nineBox: NineBoxResponse;
}

export function PotentialAreaCharts({ nineBox }: PotentialAreaChartsProps) {
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

  const globalMax = useMemo(() => {
    let max = 0;
    const checkMax = (data: Array<{ successors: number, nonSuccessors: number }>) => {
      data.forEach(d => {
        if (d.successors > max) max = d.successors;
        if (d.nonSuccessors > max) max = d.nonSuccessors;
      });
    };
    checkMax(potentialData);
    checkMax(performanceData);
    return max > 0 ? max : 1; // Возвращаем минимум 1, чтобы шкала не ломалась от [0, 0]
  }, [potentialData, performanceData]);

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
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14, fontWeight: 'bold' }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={unifiedScale ? [0, globalMax] : ['auto', 'auto']}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} 
                  />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0088FF', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  
                  <Radar
                    name="С преемниками"
                    dataKey="successors"
                    stroke="#2f9d76"
                    fill="#2f9d76"
                    fillOpacity={activeSeries === 'successors' ? 0.7 : (activeSeries === 'nonSuccessors' ? 0.1 : 0.4)}
                    strokeOpacity={activeSeries === 'nonSuccessors' ? 0.2 : 1}
                    isAnimationActive={true}
                  />
                  <Radar
                    name="Без преемников"
                    dataKey="nonSuccessors"
                    stroke="#ee5d48"
                    fill="#ee5d48"
                    fillOpacity={activeSeries === 'nonSuccessors' ? 0.7 : (activeSeries === 'successors' ? 0.1 : 0.4)}
                    strokeOpacity={activeSeries === 'successors' ? 0.2 : 1}
                    isAnimationActive={true}
                  />
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
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 14, fontWeight: 'bold' }} />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={unifiedScale ? [0, globalMax] : ['auto', 'auto']}
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} 
                  />
                  
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0088FF', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                    labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '8px' }}
                  />
                  
                  <Radar
                    name="С преемниками"
                    dataKey="successors"
                    stroke="#2f9d76"
                    fill="#2f9d76"
                    fillOpacity={activeSeries === 'successors' ? 0.7 : (activeSeries === 'nonSuccessors' ? 0.1 : 0.4)}
                    strokeOpacity={activeSeries === 'nonSuccessors' ? 0.2 : 1}
                    isAnimationActive={true}
                  />
                  <Radar
                    name="Без преемников"
                    dataKey="nonSuccessors"
                    stroke="#ee5d48"
                    fill="#ee5d48"
                    fillOpacity={activeSeries === 'nonSuccessors' ? 0.7 : (activeSeries === 'successors' ? 0.1 : 0.4)}
                    strokeOpacity={activeSeries === 'successors' ? 0.2 : 1}
                    isAnimationActive={true}
                  />
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
