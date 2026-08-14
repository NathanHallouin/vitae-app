import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';
import { cx } from './primitives';

/**
 * Les propriétés clavier, que `react-native-web` transmet au DOM.
 *
 * Les types de React Native ne les déclarent pas — il n'y a pas de clavier sur un téléphone — mais
 * la version web du `Pressable` les passe telles quelles à l'élément rendu. Le transtypage est
 * cantonné à ce fichier, qui n'est de toute façon compilé que pour le web.
 */
type PropsClavier = PressableProps & {
  tabIndex?: number;
  onKeyDown?: (e: { key: string; preventDefault: () => void }) => void;
};

const Touche = Pressable as React.ComponentType<PropsClavier>;

/**
 * La même option, mais navigable au clavier.
 *
 * Un groupe de boutons radio se parcourt aux flèches, pas à la tabulation : la tabulation entre
 * dans le groupe puis en sort, et à l'intérieur ce sont les flèches qui déplacent la sélection.
 * C'est ce que fait un `<input type="radio">` natif, et ce qu'un lecteur d'écran annonce en disant
 * « 2 sur 5 ». Avec quatre boutons tabulables par groupe et trois groupes sur l'écran du profil,
 * atteindre le bouton « Continuer » demandait une quinzaine de tabulations.
 *
 * Le motif s'appelle *roving tabindex* : un seul membre du groupe est dans l'ordre de tabulation —
 * celui qui est sélectionné — et les flèches déplacent à la fois la sélection et le focus.
 *
 * Ce fichier n'existe que pour le web, où il y a un clavier. Metro choisit `OptionButton.tsx` sur
 * mobile, qui n'a ni `tabIndex` ni `onKeyDown` à gérer.
 */
export default function OptionButton({
  selected,
  onPress,
  children,
  className,
  accessibilityLabel,
  onNavigate,
}: {
  selected: boolean;
  onPress: () => void;
  children: ReactNode;
  className?: string;
  accessibilityLabel?: string;
  /**
   * Demande au groupe de déplacer la sélection.
   *
   * C'est le parent qui connaît ses membres et leur ordre : lui seul peut dire ce qu'est
   * « le suivant ». Sans cette remontée, chaque bouton devrait connaître ses voisins.
   */
  onNavigate?: (direction: -1 | 1 | 'premier' | 'dernier') => void;
}) {
  return (
    <Touche
      accessibilityRole="radio"
      accessibilityState={{ selected, checked: selected }}
      // `accessibilityState` renseigne les lecteurs d'écran natifs, mais `react-native-web` ne le
      // traduit pas en `aria-checked` pour ce rôle : un `role="radio"` sans état est invalide, et
      // un lecteur d'écran de navigateur annonce l'option sans jamais dire si elle est choisie.
      aria-checked={selected}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      // Un seul membre du groupe est atteignable à la tabulation : celui qui est sélectionné.
      tabIndex={selected ? 0 : -1}
      onKeyDown={(e) => {
        const gestes: Record<string, -1 | 1 | 'premier' | 'dernier'> = {
          ArrowRight: 1,
          ArrowDown: 1,
          ArrowLeft: -1,
          ArrowUp: -1,
          Home: 'premier',
          End: 'dernier',
        };
        const geste = gestes[e.key];
        if (!geste || !onNavigate) return;
        // Sans cela, les flèches feraient aussi défiler la page sous le groupe.
        e.preventDefault();
        onNavigate(geste);
      }}
      className={cx(
        'w-full rounded-xl border',
        selected ? 'border-primary-ink bg-primary-tint' : 'border-line bg-surface',
        className,
      )}
    >
      {children}
    </Touche>
  );
}
