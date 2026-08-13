import { CHART, type Projection } from '@vitae/core/calc';
import { View } from 'react-native';
import { Circle, Line, Polygon, Polyline, Svg, Text as SvgText } from 'react-native-svg';
import { usePalette } from '@/theme/palette';

const LABEL_Y = 190;
const VIEW_HEIGHT = 196;

/**
 * Courbe de poids projeté, un point par semaine, avec la cible en pointillés.
 *
 * La géométrie vient entièrement de `buildProjection`, dans le métier partagé : ce composant ne
 * calcule rien, il dessine. C'est ce qui permet au site et à l'application de tracer exactement la
 * même courbe sans que deux implémentations aient à rester d'accord.
 *
 * Les couleurs, elles, ne peuvent pas venir de classes : `react-native-svg` ne connaît que des
 * propriétés de dessin.
 */
export default function ProjectionChart({
  projection,
  targetLabel,
}: {
  projection: Projection;
  targetLabel: string;
}) {
  const palette = usePalette();
  const { points, ticks, targetX, targetY } = projection;
  if (points.length === 0) return null;

  const line = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const lastX = points[points.length - 1].x;
  const area = `${CHART.x0},${CHART.y1} ${line} ${lastX.toFixed(1)},${CHART.y1}`;

  return (
    // Le rapport est fixé ici plutôt que sur le SVG : `aspectRatio` sur une `View` est la seule
    // façon fiable de faire tenir un dessin vectoriel dans une largeur variable en React Native.
    <View style={{ width: '100%', aspectRatio: CHART.width / VIEW_HEIGHT }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CHART.width} ${VIEW_HEIGHT}`}
        accessibilityRole="image"
        accessibilityLabel={`Projection du poids sur ${projection.weeks} semaines jusqu'à ${targetLabel}`}
      >
        {ticks.map((t) => (
          <Line
            key={`grid-${t.label}`}
            x1={t.x}
            x2={t.x}
            y1={CHART.y0}
            y2={CHART.y1}
            strokeWidth={1}
            stroke={palette.divider}
          />
        ))}
        <Line
          x1={CHART.x0}
          x2={CHART.x1}
          y1={CHART.y1}
          y2={CHART.y1}
          strokeWidth={1}
          stroke={palette.border}
        />
        <Line
          x1={CHART.x0}
          x2={CHART.x1}
          y1={targetY}
          y2={targetY}
          strokeWidth={1.5}
          stroke={palette.primaryInk}
          strokeDasharray="5 5"
          opacity={0.7}
        />
        <Polygon points={area} stroke="none" fill={palette.primaryTint} />
        <Polyline
          points={line}
          fill="none"
          strokeWidth={3}
          stroke={palette.primaryInk}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <Circle
          cx={targetX}
          cy={targetY}
          r={5}
          strokeWidth={2}
          fill={palette.primaryInk}
          stroke={palette.surface}
        />

        {ticks.map((t) => (
          <SvgText
            key={`label-${t.label}`}
            x={t.x}
            y={LABEL_Y}
            fontSize={12}
            fill={palette.faint}
            textAnchor={t.x < 20 ? 'start' : t.x > CHART.width - 20 ? 'end' : 'middle'}
          >
            {t.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
