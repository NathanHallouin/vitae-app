import { cssInterop } from 'nativewind';
import Animated from 'react-native-reanimated';

/**
 * `Animated.View`, mais qui comprend `className`.
 *
 * NativeWind ne traduit les classes que pour les composants qu'il connaît. `View` en fait partie ;
 * `Animated.View`, qui est une enveloppe de Reanimated, non — les classes y sont silencieusement
 * ignorées. Le symptôme est déroutant : une carte animée perd d'un coup sa bordure et son fond,
 * sans la moindre erreur, et l'on cherche du côté de l'animation alors que le problème est le
 * style.
 *
 * `cssInterop` l'enregistre une fois pour toutes, en indiquant que `className` alimente `style`.
 */
export const VueAnimee = Animated.View;

cssInterop(VueAnimee, { className: 'style' });
