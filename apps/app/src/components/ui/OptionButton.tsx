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
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cx(
        'w-full rounded-xl border',
        selected ? 'border-primary-ink bg-primary-tint' : 'border-line bg-surface',
        className,
      )}
    >
      {children}
    </Pressable>
  );
}
