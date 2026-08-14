import { platsMaison } from '@vitae/content';
import type { Metrics } from '@vitae/core/calc';
import type { GoalKey } from '@vitae/core/constants';
import { fmtPortions, kcal } from '@vitae/core/format';
import { eatingTips } from '@vitae/core/nutrition';
import {
  buildRecipeSuggestions,
  EXCLUSIONS,
  type Exclusion,
  type Suggestion,
  snackKcal,
} from '@vitae/core/recipes';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { versRoute } from '@/lib/route';
import { usePalette } from '@/theme/palette';
import { useProfile } from '../ProfileProvider';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';
import { Bullet, Card, cx } from '../ui/primitives';

/**
 * Des plats à cuisiner plutôt qu'un menu fabriqué.
 *
 * Une liste d'aliments pesés au gramme près se lit bien mais ne se cuisine pas : personne n'ouvre
 * son frigo pour « 145 g de féculent complet cuit ».
 *
 * Les recettes de l'application passent en premier, et se distinguent à l'œil : ce sont des
 * recettes rédigées, aux valeurs contrôlées, qui ouvrent leur propre écran avec les quantités
 * ajustables et les étapes à cocher. Cet écran ne proposait auparavant que des recherches sur des
 * sites extérieurs, alors même que l'application publie ses propres recettes — trois d'entre elles
 * s'y trouvaient même deux fois, une fois en lien de recherche et une fois en recette maison.
 *
 * Les propositions extérieures restent, et restent des liens de recherche plutôt que des recettes
 * précises : les valeurs nutritionnelles publiées par ces sites sont calculées automatiquement et
 * parfois très fausses. Elles comblent ce que le catalogue maison ne couvre pas encore.
 *
 * Les décalages de « changer » vivent dans l'état du composant, pas dans le profil : c'est le
 * geste d'une visite, pas une préférence à retenir. Les filtres, eux, sont enregistrés.
 */
export default function RecipesCard({ metrics, goal }: { metrics: Metrics; goal: GoalKey }) {
  const { profile, setExcluded } = useProfile();
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const excluded = profile?.excluded ?? [];
  // Les recettes de l'application passent devant ; les propositions extérieures comblent le reste.
  const meals = buildRecipeSuggestions(metrics, goal, { excluded, offsets, maison: platsMaison() });
  const tips = eatingTips(metrics);
  const collation = snackKcal(metrics);

  const basculer = (key: Exclusion) => {
    setExcluded(excluded.includes(key) ? excluded.filter((e) => e !== key) : [...excluded, key]);
    // Changer un filtre rebat les cartes : garder les décalages ferait sauter des plats au hasard.
    setOffsets({});
  };

  const changer = (slotKey: string) =>
    setOffsets((o) => ({ ...o, [slotKey]: (o[slotKey] ?? 0) + 1 }));

  return (
    <Card className="p-6">
      <Overline className="mb-1">Des recettes pour ces repères</Overline>
      <Text className="mb-5 text-base leading-[22px] text-muted">
        Nos recettes, choisies pour tomber près de vos {kcal(metrics.target)} kcal et de vos besoins
        en protéines, sans jamais servir deux fois le même ingrédient dans la journée. Touchez-en
        une pour l’ouvrir, ou « changer » pour une autre proposition. Si vos filtres réduisent trop
        le choix, une recherche sur un site de cuisine vient compléter.
      </Text>

      <View accessibilityLabel="Filtrer les ingrédients" className="mb-5 flex-row flex-wrap gap-2">
        {EXCLUSIONS.map((filtre) => {
          const actif = excluded.includes(filtre.key);
          return (
            <Pressable
              key={filtre.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: actif }}
              accessibilityLabel={`Sans ${filtre.label.toLowerCase()}`}
              onPress={() => basculer(filtre.key)}
              className={cx(
                'rounded-full border px-[14px] py-[6px]',
                actif ? 'border-primary-ink bg-primary-tint' : 'border-line',
              )}
            >
              <Text
                className={cx(
                  'text-small font-sans-medium',
                  actif ? 'text-primary-ink' : 'text-muted',
                )}
              >
                {filtre.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="gap-[22px]">
        {meals.map((meal) => (
          <View key={meal.name}>
            <View className="mb-[10px] flex-row items-baseline justify-between gap-2">
              <Text className="text-option font-sans-medium text-ink">{meal.name}</Text>
              <Text style={{ fontVariant: ['tabular-nums'] }} className="text-small text-muted2">
                environ {kcal(meal.budget)} kcal
              </Text>
            </View>

            <View className="gap-3">
              {meal.recipes.map((recipe) => (
                <RecipeLink
                  key={recipe.slotKey}
                  recipe={recipe}
                  onChange={() => changer(recipe.slotKey)}
                />
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text className="mt-5 text-small leading-[22px] text-muted">
        Ces trois repas couvrent environ 90 % de votre journée. Il reste {kcal(collation)} kcal pour
        une collation : un fruit, un yaourt, une poignée d’amandes. Rien à calculer.
      </Text>

      <View className="mt-5 gap-[10px]">
        {tips.map((tip) => (
          <Bullet key={tip}>{tip}</Bullet>
        ))}
      </View>
    </Card>
  );
}

/**
 * La carte entière ouvre la recette ; « changer » reste un contrôle distinct, posé au-dessus.
 *
 * Le site devait ruser — un bouton dans un lien est du HTML invalide — et étendait la zone
 * cliquable par un pseudo-élément. Ici deux `Pressable` imbriqués suffisent : le plus intérieur
 * intercepte la pression, l'extérieur ne la voit pas.
 *
 * Deux destinations possibles, et la différence se voit. Une recette de l'application ouvre son
 * écran, avec ses quantités ajustables et ses étapes à cocher. Une proposition extérieure ouvre
 * une recherche dans un onglet in-app — l'utilisateur revient d'un geste, sans passer par le
 * sélecteur d'applications, ce qu'Apple comme Google considèrent comme le comportement attendu.
 */
function RecipeLink({ recipe, onChange }: { recipe: Suggestion; onChange: () => void }) {
  const palette = usePalette();
  const router = useRouter();
  const portions = `${fmtPortions(recipe.portions)} portion${recipe.portions > 1 ? 's' : ''}`;
  const maison = Boolean(recipe.slug);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={
        maison
          ? `${recipe.title} — ouvrir la recette`
          : `${recipe.title} — chercher des recettes sur ${recipe.source}`
      }
      onPress={() =>
        maison ? router.navigate(versRoute(recipe.url)) : WebBrowser.openBrowserAsync(recipe.url)
      }
      className={cx(
        'gap-[6px] rounded-xl border p-[14px] active:border-primary-ink active:bg-surface2',
        // Une recette de l'application se distingue d'un simple lien : c'est du contenu rédigé,
        // aux valeurs contrôlées, pas une recherche dont le résultat reste à choisir.
        maison ? 'border-primary-ink bg-primary-tint' : 'border-line',
      )}
    >
      <View className="flex-row items-start gap-2">
        <Text className="flex-1 text-base font-sans-medium leading-[20px] text-primary-ink">
          {recipe.title}
        </Text>
        <View className="mt-[2px] flex-none">
          <Icon
            name={maison ? 'coche' : 'lienExterne'}
            size={15}
            color={maison ? palette.primaryInk : palette.muted2}
          />
        </View>
      </View>

      <Text className={cx('text-caption', maison ? 'text-primary-ink' : 'text-muted2')}>
        {maison ? 'Recette de l’application' : recipe.source}
      </Text>

      <Text style={{ fontVariant: ['tabular-nums'] }} className="text-small text-muted">
        environ {kcal(recipe.kcal)} kcal · {recipe.prot} g de protéines par portion
      </Text>

      {recipe.portions !== 1 ? (
        <Text className="text-caption text-muted2">
          Comptez {portions} pour ce repas, soit {kcal(recipe.totalKcal)} kcal et {recipe.totalProt}{' '}
          g de protéines.
        </Text>
      ) : null}

      {recipe.missingKcal > 0 ? (
        <Text className="text-caption text-muted2">
          Il manquera {kcal(recipe.missingKcal)} kcal pour le repère de ce repas : ajoutez du pain,
          du riz ou un laitage plutôt qu’une portion de plus.
        </Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Proposer un autre plat à la place de « ${recipe.title} »`}
        onPress={onChange}
        className="mt-1 flex-row items-center gap-[6px] self-start rounded-full border border-line bg-surface px-[10px] py-[5px] active:border-primary-ink"
      >
        <Icon name="rotation" size={13} color={palette.muted} />
        <Text className="text-caption font-sans-medium text-muted">Changer</Text>
      </Pressable>
    </Pressable>
  );
}
