/**
 * Suggestions de plats, tirées au sort en face des repères de la journée.
 *
 * Pourquoi des plats et un lien de recherche, plutôt qu'une liste d'URL de recettes précises :
 * Marmiton publie bien des valeurs nutritionnelles, mais elles sont calculées automatiquement,
 * absentes sur une partie des recettes et parfois très fausses — 19 g de protéines pour 427 g de
 * poulet rôti, 6 g pour un curry de poulet. Caler un budget calorique là-dessus donnerait de
 * mauvais conseils. Les valeurs ci-dessous sont donc des ordres de grandeur pour une portion
 * courante, contrôlés ici, et le lien renvoie vers la recherche du site : l'utilisateur y choisit
 * la version qui lui plaît parmi des centaines, au lieu de se voir imposer une recette unique.
 *
 * Le tirage est aléatoire mais reproductible : même profil, même proposition d'un rendu à l'autre
 * (sinon le serveur et le navigateur afficheraient deux choses différentes). Ce qui bouge, ce sont
 * les décalages demandés par l'utilisateur via « changer ».
 */

import type { Metrics } from './calc';
import type { GoalKey } from './constants';

/** Moment de la journée auquel le plat se prête. */
export type Slot = 'matin' | 'plat';

/**
 * Ingrédient dominant. Sert à ne pas proposer deux fois la même chose dans une journée : sans ça,
 * le classement par densité protéique remonte trois plats de poisson d'affilée.
 */
export type Base =
  | 'oeufs'
  | 'laitier'
  | 'volaille'
  | 'poisson'
  | 'boeuf'
  | 'porc'
  | 'legumineuse'
  | 'cereale';

/** Ce qu'une recette contient, pour les filtres d'exclusion. */
export type Ingredient = 'viande' | 'poisson' | 'porc' | 'oeufs' | 'laitier';

/** Filtres proposés à l'utilisateur. */
export type Exclusion = 'poisson' | 'porc' | 'oeufs' | 'vegetarien';

export const EXCLUSIONS: { key: Exclusion; label: string }[] = [
  { key: 'poisson', label: 'Sans poisson' },
  { key: 'porc', label: 'Sans porc' },
  { key: 'oeufs', label: 'Sans œufs' },
  { key: 'vegetarien', label: 'Végétarien' },
];

/** Ce que chaque filtre écarte. « Végétarien » couvre aussi le poisson, contrairement à l'usage. */
const ECARTE: Record<Exclusion, Ingredient[]> = {
  poisson: ['poisson'],
  porc: ['porc'],
  oeufs: ['oeufs'],
  vegetarien: ['viande', 'poisson', 'porc'],
};

export type Source = 'Marmiton' | 'Femme Actuelle';

const RECHERCHE: Record<Source, (query: string) => string> = {
  // Les deux URL de recherche répondent et ne sont pas interdites par leur robots.txt (seules
  // les variantes paginées le sont chez Marmiton).
  Marmiton: (q) => `https://www.marmiton.org/recettes/recherche.aspx?aqt=${encodeURIComponent(q)}`,
  'Femme Actuelle': (q) => `https://www.femmeactuelle.fr/recherche?q=${encodeURIComponent(q)}`,
};

export interface Recipe {
  title: string;
  /** site vers lequel pointe la recherche */
  source: Source;
  url: string;
  /** kcal pour une portion courante */
  kcal: number;
  /** protéines pour une portion courante, en g */
  prot: number;
  slot: Slot;
  base: Base;
  contient: Ingredient[];
}

type Entree = Omit<Recipe, 'url' | 'contient'> & { contient?: Ingredient[] };

/** Les viandes et le poisson découlent de la base : inutile de les répéter à chaque ligne. */
const IMPLICITE: Partial<Record<Base, Ingredient[]>> = {
  volaille: ['viande'],
  boeuf: ['viande'],
  porc: ['viande', 'porc'],
  poisson: ['poisson'],
  oeufs: ['oeufs'],
  laitier: ['laitier'],
};

function complet(e: Entree): Recipe {
  const contient = [...new Set([...(IMPLICITE[e.base] ?? []), ...(e.contient ?? [])])];
  return { ...e, contient, url: RECHERCHE[e.source](e.title) };
}

const CATALOGUE: Entree[] = [
  // ─── Petit-déjeuner ────────────────────────────────────────────────────────
  {
    title: 'Œufs brouillés et pain complet',
    source: 'Marmiton',
    kcal: 380,
    prot: 24,
    slot: 'matin',
    base: 'oeufs',
  },
  {
    title: 'Omelette aux champignons',
    source: 'Marmiton',
    kcal: 300,
    prot: 22,
    slot: 'matin',
    base: 'oeufs',
  },
  {
    title: 'Œufs cocotte',
    source: 'Femme Actuelle',
    kcal: 290,
    prot: 19,
    slot: 'matin',
    base: 'oeufs',
    contient: ['laitier'],
  },
  {
    title: 'Œuf poché sur tartine d’avocat',
    source: 'Marmiton',
    kcal: 420,
    prot: 18,
    slot: 'matin',
    base: 'oeufs',
  },
  {
    title: 'Pain perdu',
    source: 'Marmiton',
    kcal: 380,
    prot: 13,
    slot: 'matin',
    base: 'oeufs',
    contient: ['laitier'],
  },
  {
    title: 'Crêpes protéinées',
    source: 'Femme Actuelle',
    kcal: 350,
    prot: 22,
    slot: 'matin',
    base: 'oeufs',
    contient: ['laitier'],
  },
  {
    title: 'Bowl cake au chocolat',
    source: 'Marmiton',
    kcal: 380,
    prot: 20,
    slot: 'matin',
    base: 'oeufs',
    contient: ['laitier'],
  },
  {
    title: 'Pancakes à la banane et à l’avoine',
    source: 'Marmiton',
    kcal: 400,
    prot: 15,
    slot: 'matin',
    base: 'cereale',
    contient: ['oeufs', 'laitier'],
  },
  {
    title: 'Porridge aux flocons d’avoine et fruits rouges',
    source: 'Marmiton',
    kcal: 350,
    prot: 12,
    slot: 'matin',
    base: 'cereale',
    contient: ['laitier'],
  },
  {
    title: 'Granola maison',
    source: 'Femme Actuelle',
    kcal: 340,
    prot: 9,
    slot: 'matin',
    base: 'cereale',
  },
  {
    title: 'Fromage blanc, muesli et fruits',
    source: 'Marmiton',
    kcal: 330,
    prot: 25,
    slot: 'matin',
    base: 'laitier',
  },
  {
    title: 'Skyr, miel et amandes',
    source: 'Femme Actuelle',
    kcal: 300,
    prot: 26,
    slot: 'matin',
    base: 'laitier',
  },
  {
    title: 'Smoothie banane et beurre de cacahuète',
    source: 'Marmiton',
    kcal: 420,
    prot: 18,
    slot: 'matin',
    base: 'laitier',
  },
  {
    title: 'Yaourt grec, compote et noix',
    source: 'Femme Actuelle',
    kcal: 340,
    prot: 18,
    slot: 'matin',
    base: 'laitier',
  },
  { title: 'Riz au lait', source: 'Marmiton', kcal: 320, prot: 10, slot: 'matin', base: 'laitier' },
  {
    title: 'Tartines de fromage frais et saumon fumé',
    source: 'Marmiton',
    kcal: 350,
    prot: 24,
    slot: 'matin',
    base: 'poisson',
    contient: ['laitier'],
  },
  {
    title: 'Œufs au plat et jambon',
    source: 'Marmiton',
    kcal: 350,
    prot: 26,
    slot: 'matin',
    base: 'porc',
    contient: ['oeufs'],
  },
  {
    title: 'Croque-monsieur léger',
    source: 'Femme Actuelle',
    kcal: 420,
    prot: 24,
    slot: 'matin',
    base: 'porc',
    contient: ['laitier'],
  },

  // ─── Volaille ──────────────────────────────────────────────────────────────
  {
    title: 'Poulet basquaise',
    source: 'Marmiton',
    kcal: 380,
    prot: 35,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Curry de poulet aux légumes',
    source: 'Marmiton',
    kcal: 400,
    prot: 34,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Poulet rôti et pommes de terre',
    source: 'Marmiton',
    kcal: 520,
    prot: 42,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Poulet au citron et aux olives',
    source: 'Femme Actuelle',
    kcal: 390,
    prot: 36,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Blanquette de dinde',
    source: 'Marmiton',
    kcal: 420,
    prot: 33,
    slot: 'plat',
    base: 'volaille',
    contient: ['laitier'],
  },
  {
    title: 'Émincé de dinde aux champignons',
    source: 'Femme Actuelle',
    kcal: 340,
    prot: 32,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Poulet tikka massala',
    source: 'Marmiton',
    kcal: 450,
    prot: 35,
    slot: 'plat',
    base: 'volaille',
    contient: ['laitier'],
  },
  {
    title: 'Salade César au poulet',
    source: 'Marmiton',
    kcal: 430,
    prot: 30,
    slot: 'plat',
    base: 'volaille',
    contient: ['laitier'],
  },
  {
    title: 'Wok de poulet aux nouilles et légumes',
    source: 'Marmiton',
    kcal: 480,
    prot: 33,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Poulet à la moutarde',
    source: 'Femme Actuelle',
    kcal: 400,
    prot: 34,
    slot: 'plat',
    base: 'volaille',
    contient: ['laitier'],
  },
  {
    title: 'Cuisses de poulet au four et ratatouille',
    source: 'Marmiton',
    kcal: 450,
    prot: 36,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Chili de dinde',
    source: 'Femme Actuelle',
    kcal: 400,
    prot: 32,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Tajine de poulet aux citrons confits',
    source: 'Marmiton',
    kcal: 430,
    prot: 35,
    slot: 'plat',
    base: 'volaille',
  },
  {
    title: 'Poulet yassa',
    source: 'Marmiton',
    kcal: 460,
    prot: 34,
    slot: 'plat',
    base: 'volaille',
  },

  // ─── Bœuf ──────────────────────────────────────────────────────────────────
  {
    title: 'Chili con carne',
    source: 'Marmiton',
    kcal: 430,
    prot: 30,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Bœuf bourguignon',
    source: 'Marmiton',
    kcal: 480,
    prot: 38,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Steak haché, haricots verts et pommes de terre',
    source: 'Femme Actuelle',
    kcal: 470,
    prot: 38,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Lasagnes à la bolognaise',
    source: 'Marmiton',
    kcal: 550,
    prot: 30,
    slot: 'plat',
    base: 'boeuf',
    contient: ['laitier'],
  },
  {
    title: 'Bœuf aux oignons',
    source: 'Marmiton',
    kcal: 380,
    prot: 33,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Hachis parmentier',
    source: 'Marmiton',
    kcal: 520,
    prot: 28,
    slot: 'plat',
    base: 'boeuf',
    contient: ['laitier'],
  },
  {
    title: 'Tajine de bœuf aux pruneaux',
    source: 'Femme Actuelle',
    kcal: 490,
    prot: 34,
    slot: 'plat',
    base: 'boeuf',
  },
  {
    title: 'Boulettes de bœuf à la sauce tomate',
    source: 'Marmiton',
    kcal: 420,
    prot: 30,
    slot: 'plat',
    base: 'boeuf',
  },
  { title: 'Bœuf carottes', source: 'Marmiton', kcal: 450, prot: 36, slot: 'plat', base: 'boeuf' },
  {
    title: 'Pot-au-feu',
    source: 'Femme Actuelle',
    kcal: 430,
    prot: 35,
    slot: 'plat',
    base: 'boeuf',
  },

  // ─── Porc ──────────────────────────────────────────────────────────────────
  {
    title: 'Sauté de porc au caramel',
    source: 'Marmiton',
    kcal: 450,
    prot: 32,
    slot: 'plat',
    base: 'porc',
  },
  {
    title: 'Rôti de porc et purée maison',
    source: 'Marmiton',
    kcal: 500,
    prot: 36,
    slot: 'plat',
    base: 'porc',
    contient: ['laitier'],
  },
  {
    title: 'Endives au jambon',
    source: 'Marmiton',
    kcal: 380,
    prot: 24,
    slot: 'plat',
    base: 'porc',
    contient: ['laitier'],
  },
  {
    title: 'Petit salé aux lentilles',
    source: 'Marmiton',
    kcal: 520,
    prot: 34,
    slot: 'plat',
    base: 'porc',
  },
  {
    title: 'Quiche lorraine',
    source: 'Marmiton',
    kcal: 480,
    prot: 20,
    slot: 'plat',
    base: 'porc',
    contient: ['oeufs', 'laitier'],
  },
  {
    title: 'Pâtes à la carbonara',
    source: 'Marmiton',
    kcal: 600,
    prot: 25,
    slot: 'plat',
    base: 'porc',
    contient: ['oeufs', 'laitier'],
  },
  {
    title: 'Gratin de pâtes au jambon',
    source: 'Femme Actuelle',
    kcal: 520,
    prot: 26,
    slot: 'plat',
    base: 'porc',
    contient: ['laitier'],
  },

  // ─── Poisson et fruits de mer ──────────────────────────────────────────────
  {
    title: 'Pavé de saumon et riz basmati',
    source: 'Marmiton',
    kcal: 480,
    prot: 38,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Cabillaud au four et légumes rôtis',
    source: 'Marmiton',
    kcal: 340,
    prot: 34,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Papillote de poisson blanc',
    source: 'Femme Actuelle',
    kcal: 300,
    prot: 32,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Pâtes au saumon et aux courgettes',
    source: 'Marmiton',
    kcal: 550,
    prot: 35,
    slot: 'plat',
    base: 'poisson',
    contient: ['laitier'],
  },
  {
    title: 'Thon à la provençale',
    source: 'Marmiton',
    kcal: 380,
    prot: 36,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Gratin de poisson aux poireaux',
    source: 'Femme Actuelle',
    kcal: 420,
    prot: 30,
    slot: 'plat',
    base: 'poisson',
    contient: ['laitier'],
  },
  {
    title: 'Filet de colin, sauce au citron',
    source: 'Marmiton',
    kcal: 320,
    prot: 33,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Moules marinières',
    source: 'Marmiton',
    kcal: 520,
    prot: 30,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Crevettes sautées à l’ail',
    source: 'Marmiton',
    kcal: 300,
    prot: 30,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Tarte au thon',
    source: 'Femme Actuelle',
    kcal: 430,
    prot: 24,
    slot: 'plat',
    base: 'poisson',
    contient: ['oeufs', 'laitier'],
  },
  {
    title: 'Curry de crevettes au lait de coco',
    source: 'Marmiton',
    kcal: 420,
    prot: 28,
    slot: 'plat',
    base: 'poisson',
  },
  {
    title: 'Brandade de morue',
    source: 'Marmiton',
    kcal: 470,
    prot: 29,
    slot: 'plat',
    base: 'poisson',
    contient: ['laitier'],
  },

  // ─── Légumineuses et végétarien ────────────────────────────────────────────
  {
    title: 'Dahl de lentilles corail',
    source: 'Marmiton',
    kcal: 380,
    prot: 18,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Chili sin carne aux haricots rouges',
    source: 'Marmiton',
    kcal: 400,
    prot: 20,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Curry de pois chiches',
    source: 'Marmiton',
    kcal: 400,
    prot: 17,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Salade de lentilles et feta',
    source: 'Femme Actuelle',
    kcal: 380,
    prot: 20,
    slot: 'plat',
    base: 'legumineuse',
    contient: ['laitier'],
  },
  {
    title: 'Soupe de pois cassés',
    source: 'Marmiton',
    kcal: 320,
    prot: 18,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Falafels et houmous',
    source: 'Marmiton',
    kcal: 450,
    prot: 18,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Galettes de pois chiches',
    source: 'Femme Actuelle',
    kcal: 380,
    prot: 17,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Tofu sauté aux légumes',
    source: 'Marmiton',
    kcal: 350,
    prot: 22,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Chili de haricots noirs',
    source: 'Marmiton',
    kcal: 380,
    prot: 19,
    slot: 'plat',
    base: 'legumineuse',
  },
  {
    title: 'Soupe marocaine aux pois chiches',
    source: 'Femme Actuelle',
    kcal: 340,
    prot: 16,
    slot: 'plat',
    base: 'legumineuse',
  },

  // ─── Céréales et légumes ───────────────────────────────────────────────────
  {
    title: 'Buddha bowl quinoa et légumes rôtis',
    source: 'Marmiton',
    kcal: 420,
    prot: 16,
    slot: 'plat',
    base: 'cereale',
  },
  {
    title: 'Risotto aux champignons',
    source: 'Marmiton',
    kcal: 480,
    prot: 14,
    slot: 'plat',
    base: 'cereale',
    contient: ['laitier'],
  },
  {
    title: 'Couscous végétarien',
    source: 'Marmiton',
    kcal: 450,
    prot: 16,
    slot: 'plat',
    base: 'cereale',
  },
  {
    title: 'Lasagnes aux légumes',
    source: 'Femme Actuelle',
    kcal: 450,
    prot: 18,
    slot: 'plat',
    base: 'cereale',
    contient: ['laitier'],
  },
  {
    title: 'Pâtes au pesto et tomates cerises',
    source: 'Marmiton',
    kcal: 520,
    prot: 15,
    slot: 'plat',
    base: 'cereale',
    contient: ['laitier'],
  },
  {
    title: 'Gratin de courgettes au chèvre',
    source: 'Marmiton',
    kcal: 350,
    prot: 18,
    slot: 'plat',
    base: 'cereale',
    contient: ['laitier'],
  },
  {
    title: 'Poêlée de riz aux légumes et œufs',
    source: 'Femme Actuelle',
    kcal: 430,
    prot: 19,
    slot: 'plat',
    base: 'cereale',
    contient: ['oeufs'],
  },
  {
    title: 'Tarte aux légumes et ricotta',
    source: 'Marmiton',
    kcal: 420,
    prot: 16,
    slot: 'plat',
    base: 'cereale',
    contient: ['oeufs', 'laitier'],
  },

  // ─── Œufs et laitiers, en plat ─────────────────────────────────────────────
  {
    title: 'Omelette aux pommes de terre',
    source: 'Marmiton',
    kcal: 400,
    prot: 22,
    slot: 'plat',
    base: 'oeufs',
  },
  {
    title: 'Œufs à la florentine',
    source: 'Femme Actuelle',
    kcal: 360,
    prot: 21,
    slot: 'plat',
    base: 'oeufs',
    contient: ['laitier'],
  },
  { title: 'Shakshuka', source: 'Marmiton', kcal: 340, prot: 20, slot: 'plat', base: 'oeufs' },
  {
    title: 'Gratin de chou-fleur au fromage',
    source: 'Marmiton',
    kcal: 380,
    prot: 20,
    slot: 'plat',
    base: 'laitier',
  },
];

export const RECIPES: Recipe[] = CATALOGUE.map(complet);

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
  /** identifiant du créneau, pour demander un autre tirage à cette place précise */
  slotKey: string;
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

export interface RecipeOptions {
  /** filtres cochés par l'utilisateur */
  excluded?: Exclusion[];
  /** nombre de « changer » demandés, par créneau */
  offsets?: Record<string, number>;
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

function toSuggestion(recipe: Recipe, budget: number, slotKey: string): Suggestion {
  const portions = portionsFor(recipe.kcal, budget);
  const totalKcal = Math.round(recipe.kcal * portions);
  return {
    ...recipe,
    slotKey,
    portions,
    totalKcal,
    totalProt: Math.round(recipe.prot * portions),
    // En dessous de 80 kcal, l'écart tient dans l'imprécision des tables : inutile d'en parler.
    missingKcal: budget - totalKcal >= 80 ? budget - totalKcal : 0,
  };
}

/** Somme de contrôle d'une chaîne, pour dériver une graine par créneau. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Générateur déterministe : à graine égale, même suite. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function melange<T>(list: T[], seed: number): T[] {
  const out = [...list];
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Graine du tirage, dérivée du profil seul.
 *
 * Volontairement stable : le rendu serveur et le premier rendu client doivent tomber sur les mêmes
 * recettes, sinon React signale une divergence d'hydratation. Ce qui varie d'un clic à l'autre,
 * ce sont les décalages de `offsets`, appliqués côté client.
 */
function graine(m: Metrics, goal: GoalKey): number {
  return hash(`${Math.round(m.target)}-${Math.round(m.poids)}-${goal}`);
}

/** Une recette passe si aucun filtre coché ne touche l'un de ses ingrédients. */
function autorisee(recipe: Recipe, excluded: Exclusion[]): boolean {
  return !excluded.some((e) => ECARTE[e].some((i) => recipe.contient.includes(i)));
}

/**
 * Minimum de protéines pour 1 kcal, en déficit : 7 g pour 100 kcal.
 *
 * En dessous, le plat remplit l'assiette sans protéger le muscle, ce qui est précisément ce qu'on
 * cherche à éviter quand on mange moins.
 */
const DENSITE_MIN = 0.07;

/** Nombre de plats sous lequel on ne descend pas, même si la qualité doit en pâtir. */
const VARIETE_MIN = 8;

/**
 * Dans quoi tirer au sort.
 *
 * En déficit, un plancher de densité protéique plutôt qu'une fraction du classement : la fraction
 * laissait passer des plats à 6,5 g pour 100 kcal dès que le catalogue s'allongeait. Si le
 * plancher ne laisse pas assez de choix — au petit-déjeuner, ou filtres à l'appui — on retombe sur
 * les mieux notés, parce qu'un repas sans proposition serait pire qu'un repas moins dense.
 */
function tirage(candidats: Recipe[], goal: GoalKey): Recipe[] {
  if (goal === 'seche' || goal === 'recomp') {
    const denses = candidats.filter((r) => r.prot / r.kcal >= DENSITE_MIN);
    return denses.length >= VARIETE_MIN ? denses : candidats.slice(0, VARIETE_MIN);
  }
  return candidats.slice(0, Math.max(VARIETE_MIN, Math.ceil(candidats.length / 2)));
}

/**
 * Deux plats par repas, jamais deux fois le même ingrédient dominant dans la journée.
 *
 * Le tirage n'est pas le simple sommet du classement : on retient tout ce qui convient à
 * l'objectif, puis on tire au hasard dedans. Sans ça, deux personnes au même objectif voient
 * éternellement les mêmes six plats.
 */
export function buildRecipeSuggestions(
  m: Metrics,
  goal: GoalKey,
  options: RecipeOptions = {},
): MealSuggestions[] {
  const excluded = options.excluded ?? [];
  const offsets = options.offsets ?? {};
  const base = graine(m, goal);

  // Les bases sont suivies par moment de la journée, pas globalement : un smoothie au petit
  // déjeuner n'a aucune raison d'interdire une salade de lentilles le soir.
  const usedBases: Record<Slot, Set<Base>> = { matin: new Set(), plat: new Set() };
  const usedTitles = new Set<string>();

  return MEALS.map((meal) => {
    const budget = Math.round(m.target * meal.share);
    const seen = usedBases[meal.slot];

    const candidats = RECIPES.filter((r) => r.slot === meal.slot && autorisee(r, excluded)).sort(
      (a, b) => score(b, goal, budget) - score(a, goal, budget),
    );
    const pool = tirage(candidats, goal);

    const picked: Recipe[] = [];
    for (let i = 0; i < 2; i++) {
      const slotKey = `${meal.name}-${i}`;
      const ordre = melange(pool.length > 0 ? pool : candidats, base ^ hash(slotKey));
      let saut = offsets[slotKey] ?? 0;

      // Deux passes : d'abord en respectant les ingrédients déjà servis, puis sans, pour ne
      // jamais rendre un repas incomplet quand les filtres réduisent fort le catalogue.
      const choisir = (strict: boolean) => {
        for (const r of ordre) {
          if (usedTitles.has(r.title)) continue;
          if (strict && (seen.has(r.base) || picked.some((p) => p.base === r.base))) continue;
          if (saut > 0) {
            saut--;
            continue;
          }
          return r;
        }
        return undefined;
      };

      const choisi = choisir(true) ?? choisir(false);
      if (!choisi) continue;
      picked.push(choisi);
      usedTitles.add(choisi.title);
      seen.add(choisi.base);
    }

    return {
      name: meal.name,
      budget,
      recipes: picked.map((r, i) => toSuggestion(r, budget, `${meal.name}-${i}`)),
    };
  });
}

/** Ce que les trois repas laissent de côté, à combler par une collation. */
export function snackKcal(m: Metrics): number {
  return Math.round(m.target * (1 - MEALS_SHARE));
}
