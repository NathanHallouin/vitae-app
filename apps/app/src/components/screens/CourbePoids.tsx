import { CHART } from '@vitae/core/calc';
import { dec } from '@vitae/core/format';
import type { Courbe } from '@vitae/core/suivi';
import { View } from 'react-native';
import { Circle, Line, Polyline, Svg, Text as SvgText } from 'react-native-svg';
import { usePalette } from '@/theme/palette';

const LABEL_Y = 190;
const VIEW_HEIGHT = 196;

/**
 * La courbe des pesées réelles.
 *
 * Même repère et même langage visuel que `ProjectionChart`, et pour la même raison : la géométrie
 * vient du métier partagé, ce composant ne calcule rien. Mettre les deux courbes dans un seul
 * dessin serait tentant mais faux — la projection repart du poids d'aujourd'hui à chaque
 * recalcul, elle n'a donc pas d'origine commune avec un historique qui, lui, remonte le temps.
 *
 * Un écart avec la projection, en revanche : les pesées sont marquées d'un point. Une projection
 * est une droite continue, un relevé est une suite de mesures — et voir *quand* on s'est pesé est
 * la moitié de ce qu'on vient chercher.
 */
export default function CourbePoids({ courbe }: { courbe: Courbe }) {
  const palette = usePalette();
  const { points, ticks, cibleY } = courbe;

  const ligne = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const premier = points[0].pesee;
  const dernier = points[points.length - 1].pesee;

  return (
    <View style={{ width: '100%', aspectRatio: CHART.width / VIEW_HEIGHT }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${CHART.width} ${VIEW_HEIGHT}`}
        accessibilityRole="image"
        accessibilityLabel={`Courbe de ${points.length} pesées, de ${dec(premier.poids)} kg à ${dec(dernier.poids)} kg`}
      >
        <Line
          x1={CHART.x0}
          x2={CHART.x1}
          y1={CHART.y1}
          y2={CHART.y1}
          strokeWidth={1}
          stroke={palette.border}
        />

        {cibleY !== null ? (
          <Line
            x1={CHART.x0}
            x2={CHART.x1}
            y1={cibleY}
            y2={cibleY}
            strokeWidth={1.5}
            stroke={palette.primaryInk}
            strokeDasharray="5 5"
            opacity={0.7}
          />
        ) : null}

        <Polyline
          points={ligne}
          fill="none"
          strokeWidth={3}
          stroke={palette.primaryInk}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <Circle
            key={p.pesee.date}
            cx={p.x}
            cy={p.y}
            r={4}
            strokeWidth={2}
            fill={palette.primaryInk}
            stroke={palette.surface}
          />
        ))}

        {ticks.map((t, i) => (
          <SvgText
            key={t.label}
            x={t.x}
            y={LABEL_Y}
            fontSize={12}
            fill={palette.faint}
            textAnchor={i === 0 ? 'start' : 'end'}
          >
            {t.label}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}
