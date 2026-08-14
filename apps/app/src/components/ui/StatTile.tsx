import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Chiffre from './Chiffre';
import { cx } from './primitives';

/** Tuile de statistique sur fond `surface2` : libellé, valeur 22 px, note optionnelle. */
export default function StatTile({
  label,
  value,
  note,
  accent = false,
  className,
}: {
  label: ReactNode;
  /** déjà mise en forme : la tuile affiche « 1 808 kcal », pas un nombre brut */
  value: string;
  note?: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <View className={cx('rounded-xl bg-surface2 p-4', className)}>
      <Text className="mb-1 text-caption text-muted2">{label}</Text>
      <Chiffre valeur={value} taille="petit" ton={accent ? 'primary' : 'ink'} />
      {note ? <Text className="mt-1 text-caption text-muted">{note}</Text> : null}
    </View>
  );
}
