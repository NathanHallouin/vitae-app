'use client';

import { useState } from 'react';
import type { Metrics } from '@/lib/calc';
import type { GoalKey } from '@/lib/constants';
import { fmtPortions, kcal } from '@/lib/format';
import { eatingTips } from '@/lib/nutrition';
import {
  buildRecipeSuggestions,
  EXCLUSIONS,
  type Exclusion,
  RECIPES,
  type Suggestion,
  snackKcal,
} from '@/lib/recipes';
import { useProfile } from '../ProfileProvider';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';
import { Bullet, cx } from '../ui/primitives';

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
    <div className="card p-6">
      <Overline className="mb-1">Des recettes pour ces repères</Overline>
      <p className="mb-5 max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">
        Des plats tirés au sort parmi {RECIPES.length}, choisis pour tomber près de vos{' '}
        {kcal(metrics.target)} kcal et de vos besoins en protéines. Les valeurs sont des ordres de
        grandeur pour une portion courante. Cliquez sur un plat pour en voir les recettes, ou sur{' '}
        <span className="whitespace-nowrap">« changer »</span> pour une autre proposition.
      </p>

      <fieldset className="mb-5 flex flex-wrap gap-2">
        <legend className="sr-only">Filtrer les ingrédients</legend>
        {EXCLUSIONS.map((filtre) => {
          const actif = excluded.includes(filtre.key);
          return (
            <button
              key={filtre.key}
              type="button"
              aria-pressed={actif}
              onClick={() => basculer(filtre.key)}
              className={cx(
                'cursor-pointer rounded-full border px-[14px] py-[6px] text-small font-medium',
                'transition-colors hover:border-primary-ink hover:text-primary-ink',
                actif
                  ? 'border-primary-ink bg-primary-tint text-primary-ink'
                  : 'border-line text-muted',
              )}
            >
              {filtre.label}
            </button>
          );
        })}
      </fieldset>

      <div className="flex flex-col gap-[22px]">
        {meals.map((meal) => (
          <div key={meal.name}>
            <div className="mb-[10px] flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-option font-medium">{meal.name}</h3>
              <span className="text-small text-muted2 tabular-nums">
                environ {kcal(meal.budget)} kcal
              </span>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
              {meal.recipes.map((recipe) => (
                <RecipeLink
                  key={recipe.slotKey}
                  recipe={recipe}
                  onChange={() => changer(recipe.slotKey)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-5 max-w-[68ch] text-small leading-[1.6] text-muted text-pretty">
        Ces trois repas couvrent environ 90 % de votre journée. Il reste {kcal(collation)} kcal pour
        une collation&nbsp;: un fruit, un yaourt, une poignée d’amandes. Rien à calculer.
      </p>

      <ul className="mt-5 flex flex-col gap-[10px]">
        {tips.map((tip) => (
          <Bullet key={tip}>{tip}</Bullet>
        ))}
      </ul>
    </div>
  );
}

/**
 * Le titre est le lien, pas la carte entière : « changer » est un bouton, et un bouton dans un
 * lien est du HTML invalide. La zone cliquable du titre est étendue à toute la carte par un
 * pseudo-élément, pour garder une cible confortable au doigt sur mobile.
 *
 * `noreferrer` en plus de `noopener` : le site de destination n'a pas à savoir d'où vient le
 * visiteur.
 */
function RecipeLink({ recipe, onChange }: { recipe: Suggestion; onChange: () => void }) {
  const portions = `${fmtPortions(recipe.portions)} portion${recipe.portions > 1 ? 's' : ''}`;

  return (
    <div className="relative flex flex-col gap-[6px] rounded-xl border border-line p-[14px] transition-colors hover:border-primary-ink hover:bg-surface2">
      <div className="flex items-start gap-2">
        <a
          href={recipe.url}
          target="_blank"
          rel="noopener noreferrer"
          // `after` étend le clic à la carte, sans passer sous le bouton « changer », qui est
          // au-dessus dans l'ordre d'empilement.
          className="flex-1 text-base font-medium leading-[1.4] text-primary-ink after:absolute after:inset-0 after:content-['']"
        >
          {recipe.title}
          <span className="sr-only">
            {' '}
            — voir les recettes sur {recipe.source} (ouvre un nouvel onglet)
          </span>
        </a>
        <span aria-hidden className="mt-[2px] flex-none text-muted2">
          <Icon name="lienExterne" size={15} />
        </span>
      </div>

      <p className="text-caption text-muted2">{recipe.source}</p>

      <p className="text-small text-muted tabular-nums">
        environ {kcal(recipe.kcal)} kcal · {recipe.prot} g de protéines par portion
      </p>

      {recipe.portions !== 1 ? (
        <p className="text-caption text-muted2">
          Comptez {portions} pour ce repas, soit {kcal(recipe.totalKcal)} kcal et {recipe.totalProt}{' '}
          g de protéines.
        </p>
      ) : null}

      {recipe.missingKcal > 0 ? (
        <p className="text-caption text-muted2">
          Il manquera {kcal(recipe.missingKcal)} kcal pour le repère de ce repas&nbsp;: ajoutez du
          pain, du riz ou un laitage plutôt qu’une portion de plus.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onChange}
        aria-label={`Proposer un autre plat à la place de « ${recipe.title} »`}
        className="relative z-1 mt-1 flex cursor-pointer items-center gap-[6px] self-start rounded-full border border-line bg-surface px-[10px] py-[5px] text-caption font-medium text-muted hover:border-primary-ink hover:text-primary-ink"
      >
        <Icon name="rotation" size={13} />
        Changer
      </button>
    </div>
  );
}
