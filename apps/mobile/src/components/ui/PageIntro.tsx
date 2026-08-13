import { Text, View } from 'react-native';

/**
 * Titre d'écran et phrase d'accroche : de quoi parle cet écran, en une ligne.
 *
 * L'illustration du site n'est pas reprise : elle y disparaissait déjà sous `md`, c'est-à-dire
 * exactement sur les largeurs qui nous intéressent ici. La rendre sur téléphone reviendrait à
 * ajouter du décor là où le site avait justement décidé de n'en pas mettre.
 */
export default function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <View className="mb-6">
      <Text className="mb-[6px] font-display text-h2 leading-[34px] text-ink">
        {title}
      </Text>
      <Text className="text-body leading-[26px] text-muted">{lead}</Text>
    </View>
  );
}
