import type { ReactNode } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

/**
 * Titre d'écran et phrase d'accroche : de quoi parle cet écran, en une ligne.
 *
 * L'illustration est décorative et n'apporte rien au sens : elle disparaît sous 768 px plutôt que
 * de rétrécir, pour laisser la largeur au texte. C'est la règle qu'appliquait déjà la version web
 * — la même base de code servant désormais les deux, un téléphone ne la voit jamais et un écran
 * large la retrouve.
 */
export default function PageIntro({
  title,
  lead,
  illustration,
}: {
  title: string;
  lead: string;
  illustration?: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const large = width >= 768;

  return (
    <View className="mb-6 flex-row items-center gap-8">
      <View className="min-w-0 flex-1">
        <Text
          accessibilityRole="header"
          className="mb-[6px] font-display text-h2 leading-[34px] text-ink"
        >
          {title}
        </Text>
        <Text className="text-body leading-[26px] text-muted">{lead}</Text>
      </View>

      {illustration && large ? (
        <View className="flex-none" style={{ width: 190, aspectRatio: 1 }}>
          {illustration}
        </View>
      ) : null}
    </View>
  );
}
