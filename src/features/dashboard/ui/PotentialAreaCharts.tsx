import { useMemo } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip
} from 'recharts';
import type { NineBoxResponse } from '@/entities/dashboard';
import { PERF_MAP, POT_MAP } from '../config/nineBoxMeta';

interface PotentialAreaChartsProps {
  nineBox: NineBoxResponse;
}

export function PotentialAreaCharts({ nineBox }: PotentialAreaChartsProps) {
  const { potentialData, performanceData } = useMemo(() => {
    const potCounts = { A: 0, B: 0, C: 0 };
    const perfCounts = { A: 0, B: 0, C: 0, D: 0, E: 0 };

    Object.entries(nineBox.cells).forEach(([key, cell]) => {
      const potKey = key[0] as 'A' | 'B' | 'C';
      const perfKey = key[1] as 'A' | 'B' | 'C' | 'D' | 'E';
      
      potCounts[potKey] += cell.managers;
      perfCounts[perfKey] += cell.managers;
    });

    const potData = [
      { subject: `A (${POT_MAP.A})`, count: potCounts.A },
      { subject: `B (${POT_MAP.B})`, count: potCounts.B },
      { subject: `C (${POT_MAP.C})`, count: potCounts.C },
    ];

    const perfData = [
      { subject: `A (${PERF_MAP.A})`, count: perfCounts.A },
      { subject: `B (${PERF_MAP.B})`, count: perfCounts.B },
      { subject: `C (${PERF_MAP.C})`, count: perfCounts.C },
      { subject: `D (${PERF_MAP.D})`, count: perfCounts.D },
      { subject: `E (${PERF_MAP.E})`, count: perfCounts.E },
    ];

    return { potentialData: potData, performanceData: perfData };
  }, [nineBox]);

  return (
    <Box sx={{ p: 2, color: 'white' }}>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            Потенциал
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
            {potentialData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={potentialData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} />
                  <Radar
                    name="Руководителей"
                    dataKey="count"
                    stroke="#ff953f"
                    fill="#ff953f"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0088FF', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Нет данных</Typography>
              </Box>
            )}
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            Результативность
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', height: 300 }}>
            {performanceData.some(d => d.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={performanceData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.3)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'white', fontSize: 12 }} />
                  <PolarRadiusAxis tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }} />
                  <Radar
                    name="Руководителей"
                    dataKey="count"
                    stroke="#2f9d76"
                    fill="#2f9d76"
                    fillOpacity={0.5}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0088FF', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px' }}
                    itemStyle={{ color: 'white' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>Нет данных</Typography>
              </Box>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
