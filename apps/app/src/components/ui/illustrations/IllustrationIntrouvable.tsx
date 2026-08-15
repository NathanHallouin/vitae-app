import { Circle, Path } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/**
 * La page introuvable : un chemin qui s'interrompt.
 *
 * On n'arrive ici que par un lien périmé, et le seul message utile est « ce n'est pas vous, et
 * voici la sortie ». Le dessin le dit : un chemin part de la flamme — l'application —, avance, et
 * s'arrête sur un cercle creux. Pas de croix, pas de panneau d'erreur : rien n'est cassé, la
 * destination n'existe simplement plus.
 */
export default function IllustrationIntrouvable() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 320 208"
      largeurMax={300}
      label="Un chemin partant d’une flamme et s’interrompant sur un point vide"
    >
      <Circle cx={72} cy={104} r={40} fill={palette.surface2} />
      <Glyphe nom="flamme" x={48} y={80} taille={48} couleur={palette.primaryInk} epaisseur={1.8} />

      {/* Plein d'abord, pointillé ensuite : le chemin existe, puis se perd. */}
      <Path d="M120 104h44" strokeWidth={3} stroke={palette.primary} strokeLinecap="round" />
      <Path
        d="M176 104h56"
        strokeWidth={3}
        stroke={palette.divider}
        strokeDasharray="6 10"
        strokeLinecap="round"
      />

      <Circle
        cx={256}
        cy={104}
        r={18}
        fill={palette.surface}
        strokeWidth={3}
        stroke={palette.divider}
        strokeDasharray="5 7"
      />
    </Illustration>
  );
}
