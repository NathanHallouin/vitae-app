import type { Explainer as ExplainerData } from '@vitae/core/explainers';
import { Text, View } from 'react-native';
import { Card } from './ui/primitives';

/**
 * Les explications d'un écran de résultats.
 *
 * Le texte vient de `@vitae/core/explainers`, partagé avec le site : c'est le même mot à mot, et
 * il n'y a qu'un endroit où le corriger. Ne reste ici que la mise en page.
 */
export default function Explainer({ data }: { data: ExplainerData }) {
  return (
    <Card className="mt-6 p-6">
      <Text className="mb-4 font-display text-h3 text-ink">{data.title}</Text>
      <View className="gap-5">
        {data.items.map((item) => (
          <View key={item.titre}>
            <Text className="mb-1 text-option font-sans-medium text-ink">{item.titre}</Text>
            <Text className="text-base leading-[22px] text-muted">{item.texte}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}
