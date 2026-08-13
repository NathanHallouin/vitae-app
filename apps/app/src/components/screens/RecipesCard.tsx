import type { Metrics } from '@vitae/core/calc';
import type { GoalKey } from '@vitae/core/constants';
import { fmtPortions, kcal } from '@vitae/core/format';
import { eatingTips } from '@vitae/core/nutrition';
import {
  buildRecipeSuggestions,
  EXCLUSIONS,
  type Exclusion,
  RECIPES,
  type Suggestion,
  snackKcal,
} from '@vitae/core/recipes';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import { useProfile } from '../ProfileProvider';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';
import { Bullet, Card, cx } from '../ui/primitives';

/**
 * Des plats à cuisiner plutôt qu'un menu fabriqué.
 *
 * Une liste d'aliments pesés au gramme près se lit bien mais ne se cuisine pas : personne n'ouvre
 * son frigo pour « 145 g de féculent complet cuit ». Chaque proposition renvoie donc vers la
 * recherche du site de cuisine, où l'on choisit sa version parmi des dizaines.
 *
 * Les décalages de « changer » vivent dans l'état du composant, pas dans le profil : c'est le
 * geste d'une visite, pas une préférence à retenir. Les filtres, eux, sont enregistrés.
 */
export default function RecipesCard({ metrics, goal }: { metrics: Metrics; goal: GoalKey }) {
  const { profile, setExcluded } = useProfile();
  const [offsets, setOffsets] = useState<Record<string, number>>({});

  const excluded = profile?.excluded ?? [];
  const meals = buildRecipeSuggestions(metrics, goal, { excluded, offsets });
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
        Des plats tirés au sort parmi {RECIPES.length}, choisis pour tomber près de vos{' '}
        {kcal(metrics.target)} kcal et de vos besoins en protéines. Les valeurs sont des ordres de
        grandeur pour une portion courante. Touchez un plat pour en voir les recettes, ou « changer
        » pour une autre proposition.
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
 * Le lien s'ouvre dans un onglet in-app plutôt que dans le navigateur du système : l'utilisateur
 * revient à l'application d'un geste, sans passer par le sélecteur d'applications, et Apple
 * comme Google considèrent cela comme le comportement attendu.
 */
function RecipeLink({ recipe, onChange }: { recipe: Suggestion; onChange: () => void }) {
  const palette = usePalette();
  const portions = `${fmtPortions(recipe.portions)} portion${recipe.portions > 1 ? 's' : ''}`;

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${recipe.title} — voir les recettes sur ${recipe.source}`}
      onPress={() => WebBrowser.openBrowserAsync(recipe.url)}
      className="gap-[6px] rounded-xl border border-line p-[14px] active:border-primary-ink active:bg-surface2"
    >
      <View className="flex-row items-start gap-2">
        <Text className="flex-1 text-base font-sans-medium leading-[20px] text-primary-ink">
          {recipe.title}
        </Text>
        <View className="mt-[2px] flex-none">
          <Icon name="lienExterne" size={15} color={palette.muted2} />
        </View>
      </View>

      <Text className="text-caption text-muted2">{recipe.source}</Text>

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
