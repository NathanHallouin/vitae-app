import { dureeTotale, getAllRecipes } from '@vitae/content';
import { SITE_URL } from '@vitae/core/site';
import { Link } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Seo from '@/components/Seo';
import { Card } from '@/components/ui/primitives';

/**
 * Index des recettes.
 *
 * La liste est connue à la compilation : `getAllRecipes()` lit un tableau déjà en mémoire, donc
 * l'écran s'ouvre sans requête ni attente, et l'export web en fait un fichier HTML complet.
 */
export default function RecettesIndex() {
  const recettes = getAllRecipes();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Seo
        title="Recettes équilibrées, avec leurs calories et leurs protéines"
        description="Des recettes simples, avec le nombre de calories et de protéines par portion. De quoi remplir vos repères de la journée sans peser chaque aliment."
        canonical={`${SITE_URL}/recettes`}
      />

      <ScrollView
        className="flex-1 bg-bg"
        contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 64 }}
        contentContainerClassName="px-4"
      >
        <Text
          accessibilityRole="header"
          className="mb-[6px] font-display text-h1 leading-[44px] text-ink"
        >
          Recettes
        </Text>
        <Text className="mb-8 text-body leading-[26px] text-muted">
          Des recettes simples, avec leurs calories et leurs protéines par portion, pour remplir les
          repères de votre journée sans avoir à peser chaque aliment.
        </Text>

        {recettes.length === 0 ? (
          <Text className="text-base text-muted">Aucune recette pour le moment.</Text>
        ) : (
          <View className="gap-4">
            {recettes.map((r) => (
              <Link key={r.slug} href={`/recettes/${r.slug}`} asChild>
                <Pressable accessibilityRole="link">
                  <Card className="p-5">
                    <Text className="mb-1 text-option font-sans-medium text-primary-ink">
                      {r.titre}
                    </Text>
                    <Text className="mb-3 text-small leading-[19px] text-muted">
                      {r.description}
                    </Text>
                    <Text
                      style={{ fontVariant: ['tabular-nums'] }}
                      className="text-caption text-muted2"
                    >
                      {dureeTotale(r)} min · {r.kcal} kcal · {r.proteines} g de protéines par
                      portion
                    </Text>
                  </Card>
                </Pressable>
              </Link>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}
