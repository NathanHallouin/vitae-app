import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
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
  value: ReactNode;
  note?: ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <View className={cx('rounded-xl bg-surface2 p-4', className)}>
      <Text className="mb-1 text-caption text-muted2">{label}</Text>
      <Text
        // Chiffres à chasse fixe : sans cela, une valeur qui s'anime ou se met à jour fait
        // sautiller toute la ligne.
        style={{ fontVariant: ['tabular-nums'] }}
        className={cx('font-display text-stat2', accent ? 'text-primary-ink' : 'text-ink')}
      >
        {value}
      </Text>
      {note ? <Text className="mt-1 text-caption text-muted">{note}</Text> : null}
    </View>
  );
}
