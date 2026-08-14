import { dureeTotale, getAllRecipes } from '@vitae/content';
import { SITE_URL } from '@vitae/core/site';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import Seo from '@/components/Seo';
import Page, { useColumns } from '@/components/ui/Page';
import { Card } from '@/components/ui/primitives';

/**
 * Index des recettes.
 *
 * La liste est connue à la compilation : `getAllRecipes()` lit un tableau déjà en mémoire, donc
 * l'écran s'ouvre sans requête ni attente, et l'export web en fait un fichier HTML complet.
 */
export default function RecettesIndex() {
  const recettes = getAllRecipes();
  const colonnes = useColumns(3);

  return (
    <>
      <Seo
        title="Recettes équilibrées, avec leurs calories et leurs protéines"
        description="Des recettes simples, avec le nombre de calories et de protéines par portion. De quoi remplir vos repères de la journée sans peser chaque aliment."
        canonical={`${SITE_URL}/recettes`}
      />

      <Page>
        <Text
          accessibilityRole="header"
          className="mb-[6px] font-display text-h1 leading-[44px] text-ink"
        >
          Recettes
        </Text>
        {/* Mesure bornée en points et non en `ch` : l'unité typographique n'existe pas en
            natif, où la borne serait silencieusement ignorée. */}
        <Text className="mb-8 text-body leading-[26px] text-muted" style={{ maxWidth: 680 }}>
          Des recettes simples, avec leurs calories et leurs protéines par portion, pour remplir les
          repères de votre journée sans avoir à peser chaque aliment.
        </Text>

        {recettes.length === 0 ? (
          <Text className="text-base text-muted">Aucune recette pour le moment.</Text>
        ) : (
          /* Grille plutôt que pile : en pleine largeur, chaque recette occupait un bandeau de
             1 400 px pour trois lignes de texte. Le rembourrage remplace `gap`, seul moyen de
             composer avec des largeurs en pourcentage sans recourir à `calc()`, absent en natif. */
          <View className="flex-row flex-wrap" style={{ marginHorizontal: -8 }}>
            {recettes.map((r) => (
              <View
                key={r.slug}
                style={{ width: `${100 / colonnes}%`, paddingHorizontal: 8, paddingBottom: 16 }}
              >
                <Link href={`/recettes/${r.slug}`} asChild>
                  <Pressable accessibilityRole="link" className="h-full">
                    <Card className="h-full p-5">
                      <Text className="mb-1 text-option font-sans-medium text-primary-ink">
                        {r.titre}
                      </Text>
                      <Text className="mb-3 flex-1 text-small leading-[19px] text-muted">
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
              </View>
            ))}
          </View>
        )}
      </Page>
    </>
  );
}
