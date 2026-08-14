import { type Block, dureeISO, dureeTotale, getRecipe, getRecipeSlugs } from '@vitae/content';
import { SITE_NAME, SITE_URL } from '@vitae/core/site';
import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import Seo from '@/components/layout/Seo';
import RecetteAtelier, { GarderEcranAllume } from '@/components/recette/RecetteAtelier';
import Page from '@/components/ui/Page';

/**
 * Toutes les recettes sont connues à la compilation : l'export web produit un fichier HTML par
 * recette, et l'application native ouvre l'écran sans le moindre accès disque.
 */
export function generateStaticParams(): Array<{ slug: string }> {
  return getRecipeSlugs().map((slug) => ({ slug }));
}

export default function RecettePage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const recette = getRecipe(slug ?? '');

  if (!recette) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-bg p-6">
        <Text className="font-display text-h3 text-ink">Cette recette n’existe pas</Text>
        <Link href="/recettes" className="text-base font-sans-semibold text-primary-ink">
          Voir toutes les recettes
        </Link>
      </View>
    );
  }

  const total = dureeTotale(recette);
  const url = `${SITE_URL}/recettes/${recette.slug}`;

  /**
   * Données structurées schema.org `Recipe`.
   *
   * C'est le levier SEO principal d'un site de recettes : c'est lui qui déclenche les résultats
   * enrichis (photo, durée, calories) plutôt qu'un simple lien bleu. Les champs viennent du
   * frontmatter et des étapes du Markdown, donc la page et le balisage ne peuvent pas diverger.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recette.titre,
    description: recette.description,
    datePublished: recette.publiee,
    author: { '@type': 'Organization', name: SITE_NAME },
    recipeCategory: recette.categorie,
    recipeCuisine: 'Française',
    prepTime: dureeISO(recette.preparation),
    cookTime: dureeISO(recette.cuisson),
    totalTime: dureeISO(total),
    recipeYield: `${recette.portions} portion${recette.portions > 1 ? 's' : ''}`,
    recipeIngredient: recette.ingredients,
    recipeInstructions: recette.etapes.map((texte, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: texte,
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      servingSize: '1 portion',
      calories: `${recette.kcal} kcal`,
      proteinContent: `${recette.proteines} g`,
    },
  };

  const reperes = [
    { t: 'Préparation', v: `${recette.preparation} min` },
    { t: 'Cuisson', v: `${recette.cuisson} min` },
    { t: 'En tout', v: `${total} min` },
    { t: 'Par portion', v: `${recette.kcal} kcal · ${recette.proteines} g de protéines` },
  ];

  return (
    <>
      <Seo
        title={`${recette.titre} : ${recette.kcal} kcal et ${recette.proteines} g de protéines`}
        description={recette.description}
        canonical={url}
        jsonLd={jsonLd}
      />
      <GarderEcranAllume />

      <Page>
        <View className="mb-6 flex-row">
          <Link href="/recettes" className="text-small text-primary-ink">
            Recettes
          </Link>
          <Text className="text-small text-muted2"> · {recette.categorie}</Text>
        </View>

        <Text
          accessibilityRole="header"
          className="mb-3 font-display text-h1 leading-[44px] text-ink"
        >
          {recette.titre}
        </Text>
        <Text className="mb-6 text-body leading-[26px] text-muted">{recette.description}</Text>

        <View className="mb-5 gap-2">
          {reperes.map((item) => (
            <View key={item.t} className="flex-row items-baseline gap-[6px]">
              <Text className="text-small text-muted2">{item.t}</Text>
              <Text
                style={{ fontVariant: ['tabular-nums'] }}
                className="text-small font-sans-medium text-ink"
              >
                {item.v}
              </Text>
            </View>
          ))}
        </View>

        <Prose blocks={recette.introBlocks} className="mb-5" />

        <RecetteAtelier recette={recette} />

        <Prose blocks={recette.suiteBlocks} />
      </Page>
    </>
  );
}

/**
 * La prose libre d'une recette.
 *
 * Le site rendait le HTML produit par `marked` ; ici on met en page les blocs typés produits par
 * le même script de compilation. Deux niveaux suffisent — paragraphe et titre — parce que c'est
 * tout ce que les recettes emploient.
 */
function Prose({ blocks, className }: { blocks: Block[]; className?: string }) {
  if (blocks.length === 0) return null;
  return (
    <View className={className}>
      {blocks.map((bloc) =>
        bloc.type === 'h2' ? (
          <Text
            key={bloc.text}
            accessibilityRole="header"
            className="mt-4 mb-2 font-display text-h3 text-ink"
          >
            {bloc.text}
          </Text>
        ) : (
          <Text key={bloc.text} className="mb-3 text-body leading-[26px] text-muted">
            {bloc.text}
          </Text>
        ),
      )}
    </View>
  );
}
