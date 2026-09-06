import type { ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import { Text, View } from 'react-native';
import { cx } from './primitives';

/**
 * La ligne « libellé à gauche, valeur à droite », et sa pile.
 *
 * C'est le second motif de la refonte, après le cadran, et il revient sur quatre écrans : la
 * décomposition de la dépense, la tendance de poids face au rythme prévu, le catalogue de gestes
 * du quotidien, les exercices d'une séance. Il remplace les tuiles `StatTile` empilées, qui
 * répondaient à la même question — comparer quelques valeurs de même nature — en occupant trois
 * fois la hauteur et en séparant chaque libellé de son chiffre.
 *
 * Deux choses le tiennent, et les deux viennent de la maquette :
 *
 * — **l'alignement est sur la ligne de base**, pas au centre. Un libellé de 14 px en regard d'un
 *   nombre de 17 centrés verticalement donne deux textes qui flottent ; posés sur la même ligne de
 *   base, ils se lisent comme une seule ligne de tableau ;
 * — **le suffixe reste dans la valeur**, en 13 px et en 400. « 1 786 kcal · 74 % » est une seule
 *   information ; le sortir dans une troisième colonne obligerait à réserver sa largeur sur toutes
 *   les lignes, y compris celles qui n'en ont pas.
 *
 * Le filet est posé par `Lignes` et non par `Ligne` : c'est un séparateur, il n'appartient donc à
 * aucune des deux lignes qu'il sépare. Écrit sur la ligne elle-même, la dernière traînait un filet
 * qui doublait le bord de la carte — le défaut qu'on retrouvait dans quatre écrans avant que le
 * motif soit un composant.
 */
export function Lignes({ children, className }: { children: ReactNode; className?: string }) {
  const lignes = Children.toArray(children).filter(isValidElement);

  return (
    <View className={className}>
      {lignes.map((ligne, i) => (
        // L'ordre est fixe et les lignes n'ont pas d'identité propre ici : l'index fait une clé
        // stable. Les appelants qui rendent une liste variable posent la leur sur leur `map`.
        // biome-ignore lint/suspicious/noArrayIndexKey: pile statique, jamais réordonnée
        <View key={i} className={cx(i > 0 && 'border-divider border-t')}>
          {ligne}
        </View>
      ))}
    </View>
  );
}

export function Ligne({
  label,
  valeur,
  suffixe,
  /** met la valeur en `accent` : la mesure constatée, face à ce que le plan prévoyait */
  mesure = false,
  className,
}: {
  label: ReactNode;
  /** déjà mise en forme : la ligne affiche « ≈ 241 », pas un nombre brut */
  valeur: ReactNode;
  suffixe?: string;
  mesure?: boolean;
  className?: string;
}) {
  return (
    <View className={cx('flex-row items-baseline justify-between gap-3 py-[7px]', className)}>
      <Text className="font-sans min-w-0 flex-1 text-base text-ink">{label}</Text>
      <Text
        className={cx('font-sans-bold flex-none text-stat3', mesure ? 'text-accent' : 'text-ink')}
        // Chasse fixe : ces lignes se lisent en colonne, et un chiffre de largeur variable ferait
        // onduler la colonne des valeurs d'une ligne à l'autre.
        style={{ fontVariant: ['tabular-nums'] }}
      >
        {valeur}
        {suffixe ? <Text className="font-sans text-small text-muted"> {suffixe}</Text> : null}
      </Text>
    </View>
  );
}
