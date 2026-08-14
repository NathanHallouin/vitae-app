/**
 * Le nom des icônes, et rien d'autre.
 *
 * Le tracé vit dans chaque application — SVG DOM sur le web, `react-native-svg` sur mobile — mais
 * le nom est du métier : `nav.ts` et `constants.ts` désignent une icône par écran et par option
 * d'activité. Isoler l'union ici permet aux deux applications de se faire vérifier par le
 * compilateur qu'elles dessinent bien le même jeu, sans que `packages/core` ne dépende d'un
 * moteur de rendu.
 */
export const ICON_NAMES = [
  // Navigation et résultats
  'flamme',
  'assiette',
  'balance',
  'course',
  // Bascule de thème
  'soleil',
  'lune',
  // Mouvement du quotidien
  'bureau',
  'marche',
  'debout',
  'caisse',
  // Entraînement
  'haltere',
  'aucun',
  // Objectifs
  'flecheBas',
  'flecheHaut',
  'flecheDroite',
  'flechesOpposees',
  'egal',
  // Macronutriments et repères
  'oeuf',
  'goutte',
  'ble',
  'coche',
  'rotation',
  'lienExterne',
  'eclair',
  'silhouette',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
