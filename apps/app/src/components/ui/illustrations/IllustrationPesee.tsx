import { Circle, Line, Polyline } from 'react-native-svg';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/** Les pesées à venir, sur la pente d'une perte régulière. */
const AVENIR = [
  { x: 110, y: 56 },
  { x: 165, y: 68 },
  { x: 220, y: 78 },
];

/**
 * L'état vide du suivi de poids : une première pesée, et la place des suivantes.
 *
 * Le message qui l'accompagne demande de se peser une fois par semaine ; l'image montre pourquoi.
 * Un seul point plein à gauche — celui qu'on s'apprête à saisir —, puis trois points creux sur une
 * ligne en pointillés : ce qui manque n'est pas une balance, c'est la répétition.
 *
 * La pente descend, parce que c'est l'objectif de la plupart des profils ; elle reste douce, parce
 * qu'annoncer une chute vertigineuse serait un mensonge que l'application passe son temps à
 * corriger ailleurs.
 */
export default function IllustrationPesee() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 260 110"
      largeurMax={260}
      label="Une première pesée, suivie de trois points en pointillés sur une pente douce"
    >
      <Line x1={22} y1={96} x2={238} y2={96} strokeWidth={2} stroke={palette.borderStrong} />

      <Polyline
        points={`46,44 ${AVENIR.map((p) => `${p.x},${p.y}`).join(' ')}`}
        fill="none"
        strokeWidth={2.5}
        stroke={palette.borderStrong}
        strokeDasharray="6 7"
        strokeLinecap="round"
      />

      {AVENIR.map((p) => (
        <Circle
          key={p.x}
          cx={p.x}
          cy={p.y}
          r={6.5}
          strokeWidth={2.5}
          fill={palette.surface}
          stroke={palette.borderStrong}
        />
      ))}

      {/* La première, pleine : c'est celle que le champ juste au-dessus attend. */}
      <Circle cx={46} cy={44} r={8} fill={palette.primaryInk} />
    </Illustration>
  );
}
