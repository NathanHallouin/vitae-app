'use client';

import { CHART, type Projection } from '@/lib/calc';

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
  const { points, ticks, targetX, targetY } = projection;
  if (points.length === 0) return null;

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastX = points[points.length - 1].x;
  const area = `${CHART.x0},${CHART.y1} ${line} ${lastX.toFixed(1)},${CHART.y1}`;

  return (
    <svg
      viewBox={`0 0 ${CHART.width} ${VIEW_HEIGHT}`}
      role="img"
      aria-label={`Projection du poids sur ${projection.weeks} semaines jusqu'à ${targetLabel}`}
      // Largeur bornée : le texte du SVG grossit avec la largeur d'affichage, et les libellés
      // d'axe deviendraient énormes sur un écran large.
      className="block h-auto w-full max-w-[760px]"
    >
      {ticks.map((t) => (
        <line
          key={`grid-${t.label}`}
          x1={t.x}
          x2={t.x}
          y1={CHART.y0}
          y2={CHART.y1}
          strokeWidth={1}
          className="stroke-divider"
        />
      ))}
      <line
        x1={CHART.x0}
        x2={CHART.x1}
        y1={CHART.y1}
        y2={CHART.y1}
        strokeWidth={1}
        className="stroke-line"
      />
      <line
        x1={CHART.x0}
        x2={CHART.x1}
        y1={targetY}
        y2={targetY}
        strokeWidth={1.5}
        className="stroke-primary-ink"
        strokeDasharray="5 5"
        opacity={0.7}
      />
      <polygon points={area} stroke="none" className="fill-primary-tint" />
      <polyline
        points={line}
        fill="none"
        strokeWidth={3}
        className="stroke-primary-ink"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={5}
        strokeWidth={2}
        className="fill-primary-ink stroke-surface"
      />

      {ticks.map((t) => (
        <text
          key={`label-${t.label}`}
          x={t.x}
          y={LABEL_Y}
          fontSize={12}
          className="fill-faint"
          textAnchor={t.x < 20 ? 'start' : t.x > CHART.width - 20 ? 'end' : 'middle'}
        >
          {t.label}
        </text>
      ))}
    </svg>
  );
}
