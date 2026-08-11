/**
 * Recettes publiées sur des sites de cuisine, proposées en face des repères de la journée.
 *
 * Pourquoi un catalogue en dur plutôt qu'une recherche en direct : l'app ne parle à aucun serveur
 * et n'a pas de clé d'API. Les valeurs ci-dessous sont celles annoncées par chaque site, relevées
 * à la main sur la page de la recette ; le lien renvoie toujours vers l'auteur, qui reste le seul
 * à publier le contenu. Une valeur nutritionnelle n'est pas un secret de fabrication : c'est une
 * donnée factuelle, et elle sert ici à trier, pas à remplacer la recette.
 *
 * Pour ajouter une recette : ouvrir la page, relever le titre exact, le nombre de kcal et de
 * protéines *par portion*, et vérifier que le lien répond. Rien d'automatique ici, volontairement.
 */

import type { Metrics } from './calc';
import type { GoalKey } from './constants';

/** Moment de la journée auquel la recette se prête. */
export type Slot = 'matin' | 'plat';

/**
 * Ingrédient dominant. Sert uniquement à éviter de proposer deux fois la même chose dans une
 * journée : sans ça, le classement par densité protéique remonte trois plats de saumon d'affilée.
 */
export type Base = 'oeufs' | 'laitier' | 'poulet' | 'saumon' | 'boeuf' | 'vegetarien';

export interface Recipe {
  title: string;
  /** site qui publie la recette, affiché sous le titre */
  source: string;
  url: string;
  /** kcal par portion, telles qu'annoncées par la source */
  kcal: number;
  /** protéines par portion, en g */
  prot: number;
  slot: Slot;
  base: Base;
}

/**
 * Catalogue vérifié en août 2026. Chaque entrée a été ouverte pour relever titre, kcal et
 * protéines par portion.
 */
export const RECIPES: Recipe[] = [
  // Petit-déjeuner
  {
    title: 'Assiette petit-déjeuner : œufs brouillés, bacon, fromage et clémentine',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/assiette-petit-dejeuner-oeufs-brouilles-bacon-fromage-clementine',
    kcal: 441,
    prot: 41,
    slot: 'matin',
    base: 'oeufs',
  },
  {
    title: 'Pancake protéiné à l’avoine et à la banane',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/pancake-proteine-avoine-banane',
    kcal: 332,
    prot: 27,
    slot: 'matin',
    base: 'laitier',
  },
  {
    title: 'Smoothie bowl protéiné',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/smoothie-bowl-proteine',
    kcal: 322,
    prot: 28,
    slot: 'matin',
    base: 'vegetarien',
  },

  // Plats
  {
    title: 'Curry de poulet, carottes et pommes de terre',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/curry-de-poulet-carottes-pommes-de-terre',
    kcal: 355,
    prot: 32,
    slot: 'plat',
    base: 'poulet',
  },
  {
    title: 'Curry Massaman poulet',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/curry-massaman-poulet',
    kcal: 334,
    prot: 31,
    slot: 'plat',
    base: 'poulet',
  },
  {
    title: 'Poulet au curry léger',
    source: 'Délizioso',
    url: 'https://www.delizioso.fr/recettes-minceur-legeres/poulet-au-curry-leger',
    kcal: 452,
    prot: 38,
    slot: 'plat',
    base: 'poulet',
  },
  {
    title: 'Saumon à la Toscane',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/saumon-a-la-toscane',
    kcal: 313,
    prot: 29,
    slot: 'plat',
    base: 'saumon',
  },
  {
    title: 'Galettes de saumon',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/galettes-saumon',
    kcal: 268,
    prot: 29,
    slot: 'plat',
    base: 'saumon',
  },
  {
    title: 'One pot pasta, brocolis et saumon frais',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/one-pot-pasta-brocolis-saumon',
    kcal: 470,
    prot: 41,
    slot: 'plat',
    base: 'saumon',
  },
  {
    title: 'Pâtes au saumon fumé, sauce béchamel et courgettes râpées',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/pates-au-saumon-fume-bechamel-courgettes-rapees',
    kcal: 350,
    prot: 27,
    slot: 'plat',
    base: 'saumon',
  },
  {
    title: 'Bœuf à la grecque',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/boeuf-a-la-grecque',
    kcal: 356,
    prot: 36,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Gratin de pâtes à la bolognaise',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/gratin-de-pates-a-la-bolognaise',
    kcal: 350,
    prot: 37,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Pâtes au bœuf épicé et tomates cerises',
    source: 'Délizioso',
    url: 'https://www.delizioso.fr/mon-regime-facile/recette-minceur/pates-boeuf-epices-tomates',
    kcal: 431,
    prot: 41,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Pâtes à la bolognaise légères',
    source: 'Délizioso',
    url: 'https://www.delizioso.fr/recettes-minceur-legeres/pates-bolognaise-legeres',
    kcal: 395,
    prot: 31,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Émincés de soja aux pois chiches, carottes et semoule aux épices',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/eminces-soja-pois-chiches-carottes-semoule-epices',
    kcal: 414,
    prot: 41,
    slot: 'plat',
    base: 'vegetarien',
  },
  {
    title: 'Salade aux lentilles, tofu aux herbes, feta, pomme et betterave',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/salade-lentilles-tofu-herbes-feta-pomme-betterave',
    kcal: 256,
    prot: 20,
    slot: 'plat',
    base: 'vegetarien',
  },
  {
    title: 'Soupe de pois chiches',
    source: 'Jérémy Loreau',
    url: 'https://www.jeremyloreau.com/recette/soupe-pois-chiches',
    kcal: 162,
    prot: 12,
    slot: 'plat',
    base: 'vegetarien',
  },
];

/**
 * Répartition de la journée. Le compte s'arrête volontairement à 90 % : les 10 % restants sont la
 * collation, un fruit ou un yaourt, qu'il serait absurde de faire passer par une recette.
 */
const MEALS: { name: string; share: number; slot: Slot }[] = [
  { name: 'Petit-déjeuner', share: 0.25, slot: 'matin' },
  { name: 'Déjeuner', share: 0.35, slot: 'plat' },
  { name: 'Dîner', share: 0.3, slot: 'plat' },
];

export const MEALS_SHARE = MEALS.reduce((sum, m) => sum + m.share, 0);

export interface Suggestion extends Recipe {
  /** nombre de portions pour atteindre le budget du repas, arrondi au demi */
  portions: number;
  /** kcal et protéines une fois les portions appliquées */
  totalKcal: number;
  totalProt: number;
  /** ce qui manque pour atteindre le repère du repas ; 0 si la recette suffit */
  missingKcal: number;
}

export interface MealSuggestions {
  name: string;
  /** budget calorique du repas */
  budget: number;
  recipes: Suggestion[];
}

/**
 * Priorité de tri, selon l'objectif.
 * En déficit, ce qui compte est la densité protéique : à budget calorique égal, la recette qui
 * apporte le plus de protéines est celle qui protège le mieux le muscle. En prise de masse, c'est
 * l'inverse : le problème est d'avaler assez, donc on remonte les plats les plus denses.
 */
function score(recipe: Recipe, goal: GoalKey, budget: number): number {
  if (goal === 'masse') return recipe.kcal;
  if (goal === 'seche' || goal === 'recomp') return (recipe.prot / recipe.kcal) * 1000;
  // Maintien : la recette dont la portion tombe le plus près du budget, sans redécoupage.
  return -Math.abs(recipe.kcal - budget);
}

/**
 * Portions nécessaires pour couvrir le budget, arrondies au demi.
 *
 * Plafonnées à deux : au-delà, on ne conseille plus une recette, on conseille de se resservir
 * trois fois. Chez qui vise 4 000 kcal, trois portions d'un plat protéiné feraient plus de 120 g
 * de protéines en un repas — l'inverse de ce que dit le conseil affiché juste en dessous. Ce qui
 * manque est annoncé (`missingKcal`) plutôt que noyé dans une portion démesurée.
 */
export const MAX_PORTIONS = 2;

export function portionsFor(kcal: number, budget: number): number {
  const raw = Math.round((budget / kcal) * 2) / 2;
  return Math.min(MAX_PORTIONS, Math.max(0.5, raw));
}

function toSuggestion(recipe: Recipe, budget: number): Suggestion {
  const portions = portionsFor(recipe.kcal, budget);
  const totalKcal = Math.round(recipe.kcal * portions);
  return {
    ...recipe,
    portions,
    totalKcal,
    totalProt: Math.round(recipe.prot * portions),
    // En dessous de 80 kcal, l'écart tient dans l'imprécision des tables : inutile d'en parler.
    missingKcal: budget - totalKcal >= 80 ? budget - totalKcal : 0,
  };
}

/**
 * Deux recettes par repas, jamais deux fois le même ingrédient dominant dans la journée.
 * Sans cette contrainte, le classement par densité protéique propose trois saumons de suite.
 */
export function buildRecipeSuggestions(m: Metrics, goal: GoalKey): MealSuggestions[] {
  // Les bases sont suivies par moment de la journée, pas globalement : un smoothie au petit
  // déjeuner n'a aucune raison d'interdire une salade de lentilles le soir.
  const usedBases: Record<Slot, Set<Base>> = { matin: new Set(), plat: new Set() };
  const usedUrls = new Set<string>();

  return MEALS.map((meal) => {
    const budget = Math.round(m.target * meal.share);
    const seen = usedBases[meal.slot];
    const pool = RECIPES.filter((r) => r.slot === meal.slot && !usedUrls.has(r.url)).sort(
      (a, b) => score(b, goal, budget) - score(a, goal, budget),
    );

    const picked: Recipe[] = [];
    const take = (accept: (r: Recipe) => boolean) => {
      for (const recipe of pool) {
        if (picked.length === 2) break;
        if (picked.includes(recipe) || !accept(recipe)) continue;
        picked.push(recipe);
      }
    };

    // Par ordre de préférence : une base encore inutilisée dans la journée, puis au moins une
    // base différente de l'autre plat du repas, puis n'importe quoi plutôt qu'un repas incomplet.
    take((r) => !seen.has(r.base) && !picked.some((p) => p.base === r.base));
    take((r) => !picked.some((p) => p.base === r.base));
    take(() => true);

    for (const recipe of picked) {
      seen.add(recipe.base);
      usedUrls.add(recipe.url);
    }

    return { name: meal.name, budget, recipes: picked.map((r) => toSuggestion(r, budget)) };
  });
}

/** Ce que les trois repas laissent de côté, à combler par une collation. */
export function snackKcal(m: Metrics): number {
  return Math.round(m.target * (1 - MEALS_SHARE));
}
