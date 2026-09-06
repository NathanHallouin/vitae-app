import type { Explainer } from '@vitae/core/explainers';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import { versRoute } from '@/lib/route';
import { usePalette } from '@/theme/palette';

/**
 * Le pied d'un écran de résultats : ce qu'on lit ensuite.
 *
 * Les quatre écrans se lisent dans un ordre — ce que le corps dépense, ce que ça change dans
 * l'assiette, où cela mène, ce que le mouvement peut prendre en charge. Le dire à la fin de chacun
 * transforme quatre onglets indépendants en un parcours, sans rien ajouter à la navigation : le
 * bandeau du haut permet de sauter, cette ligne dit dans quel sens on avance.
 *
 * Elle vivait au bas de la carte d'explications, qui a quitté ces écrans pour devenir le cours.
 * Sortie de la carte, elle n'est plus posée sur un fond : un filet la sépare du dernier bloc, ce
 * qui est le traitement d'un pied de page et non celui d'une carte de plus.
 *
 * Le renvoi est annoncé par son surtitre : sans lui, le lien se lisait comme un élément du bloc
 * précédent plutôt que comme la sortie vers l'écran d'après.
 */
export default function SuiteEcran({ data }: { data: Explainer }) {
  const palette = usePalette();

  return (
    <View className="mt-6 border-t border-line pt-4">
      <Overline className="mb-1">La suite</Overline>
      <Link href={versRoute(data.suite.href)} asChild>
        <Pressable
          accessibilityRole="link"
          className="flex-row items-center gap-2 self-start rounded-control py-1 active:opacity-70"
        >
          <Text className="text-option font-sans-medium text-primary-ink">{data.suite.label}</Text>
          <Icon name="flecheDroite" size={15} color={palette.primaryInk} />
        </Pressable>
      </Link>
    </View>
  );
}
