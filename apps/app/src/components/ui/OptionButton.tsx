import type { ReactNode } from 'react';
import { Pressable } from 'react-native';
import { cx } from './primitives';

/**
 * Option sélectionnable (sexe, activité, objectif, poids cible).
 * Sélectionnée : fond `primaryTint`, bordure et texte `primaryInk`.
 *
 * Le rôle est `radio` et non `button` : ces options vont toujours par groupe, dont un seul membre
 * est actif. C'est ce que le site n'annonçait pas correctement (voir ROADMAP.md, « ARIA des
 * groupes d'options ») ; le portage était l'occasion de ne pas reconduire le défaut.
 */
export default function OptionButton({
  selected,
  onPress,
  children,
  className,
  accessibilityLabel,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  className?: string;
  accessibilityLabel?: string;
  /**
   * Sans effet ici : il n'y a pas de clavier à écouter sur un téléphone.
   *
   * La propriété existe quand même pour que les appelants soient les mêmes des deux côtés — voir
   * `OptionButton.web.tsx`, que Metro choisit sur le web et qui, lui, s'en sert.
   */
  onNavigate?: (direction: -1 | 1 | 'premier' | 'dernier') => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      // `accessibilityState` renseigne les lecteurs d'écran natifs, mais `react-native-web` ne le
      // traduit pas en `aria-checked` pour ce rôle : un `role="radio"` sans état est invalide, et
      // un lecteur d'écran de navigateur annonce l'option sans jamais dire si elle est choisie.
      aria-checked={selected}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cx(
        'w-full rounded-control',
        // Bordure épaissie sur l'option choisie, et marge négative d'un point pour compenser :
        // sans elle, la ligne choisie grandirait d'un pixel et ferait sauter tout le groupe. Deux
        // points plutôt qu'un parce que sur le gris-violet de la refonte, le fond `primaryTint`
        // à 10 % ne suffit plus seul à distinguer la ligne choisie de ses voisines.
        selected
          ? 'border-2 border-primary-ink bg-primary-tint m-[-1px]'
          : 'border border-line bg-surface',
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
