'use client';

import Box from '@mui/material/Box';
import { CHART, type Projection } from '@/lib/calc';
import { useTokens } from '@/theme/ThemeRegistry';

const LABEL_Y = 190;
const VIEW_HEIGHT = 196;

/** Courbe de poids projeté, un point par semaine, avec la cible en pointillés. */
export default function ProjectionChart({
  projection,
  targetLabel,
}: {
  projection: Projection;
  targetLabel: string;
}) {
  const tokens = useTokens();
  const { points, ticks, targetX, targetY } = projection;
  if (points.length === 0) return null;

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastX = points[points.length - 1].x;
  const area = `${CHART.x0},${CHART.y1} ${line} ${lastX.toFixed(1)},${CHART.y1}`;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${CHART.width} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Projection du poids sur ${projection.weeks} semaines jusqu'à ${targetLabel}`}
      sx={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {ticks.map((t) => (
        <line
          key={`grid-${t.label}`}
          x1={t.x}
          x2={t.x}
          y1={CHART.y0}
          y2={CHART.y1}
          stroke={tokens.divider}
          strokeWidth={1}
        />
      ))}
      <line
        x1={CHART.x0}
        x2={CHART.x1}
        y1={CHART.y1}
        y2={CHART.y1}
        stroke={tokens.border}
        strokeWidth={1}
      />
      <line
        x1={CHART.x0}
        x2={CHART.x1}
        y1={targetY}
        y2={targetY}
        stroke={tokens.primaryInk}
        strokeWidth={1.5}
        strokeDasharray="5 5"
        opacity={0.7}
      />
      <polygon points={area} fill={tokens.primaryTint} stroke="none" />
      <polyline
        points={line}
        fill="none"
        stroke={tokens.primary}
        strokeWidth={3}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={5}
        fill={tokens.primary}
        stroke={tokens.surface}
        strokeWidth={2}
      />

      {ticks.map((t) => (
        <text
          key={`label-${t.label}`}
          x={t.x}
          y={LABEL_Y}
          fontSize={12}
          fill={tokens.faint}
          textAnchor={t.x < 20 ? 'start' : t.x > CHART.width - 20 ? 'end' : 'middle'}
        >
          {t.label}
        </text>
      ))}
    </Box>
  );
}
