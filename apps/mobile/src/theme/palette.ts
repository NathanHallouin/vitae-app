/**
 * La palette du thème courant, en valeurs plutôt qu'en classes.
 *
 * NativeWind couvre tout ce qui se pose sur une `View` ou un `Text`. Restent trois endroits où il
 * faut une couleur en clair : les traits de `react-native-svg`, la barre d'onglets de React
 * Navigation, et la barre d'état du système. C'est à cela que sert ce raccourci — pas à styler des
 * composants, qui doivent continuer à passer par `className`.
 */

import { PALETTES, type Palette } from '@vitae/core/tokens';
import { useColorMode } from './ColorMode';

export type { Palette };

export function usePalette(): Palette {
  return PALETTES[useColorMode().mode];
}
