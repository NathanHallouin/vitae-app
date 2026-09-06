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
        stroke={palette.borderStrong}
        strokeDasharray="6 10"
        strokeLinecap="round"
      />

      {/*
        Creux pour de vrai : `fill` blanc sur un fond lavande, ce n'était pas un cercle vide, c'était
        un disque plein — et il se lisait comme une tache, pas comme une destination manquante.

        Le pointillé boucle : la circonférence vaut 2π × 18 = 113,097, découpée en dix périodes de
        11,3097. Avec « 5 7 » le motif tombait à 9,42 période et le dernier tiret se coupait net,
        laissant une encoche au point de fermeture — visible, et lisible comme un défaut de rendu.
      */}
      <Circle
        cx={256}
        cy={104}
        r={18}
        fill="none"
        strokeWidth={3}
        stroke={palette.borderStrong}
        strokeDasharray="5.2 6.11"
      />
    </Illustration>
  );
}
