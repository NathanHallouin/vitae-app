/**
 * Journée alimentaire type, calculée à partir des macros de l'utilisateur.
 *
 * Valeurs nutritionnelles pour 100 g d'aliment prêt à consommer (cuit quand c'est pertinent),
 * arrondies à partir des tables de composition usuelles (Ciqual / USDA). Elles servent à donner
 * des ordres de grandeur : deux marques de pain ne donnent pas exactement le même chiffre.
 */

import type { Macro, Metrics } from './calc';

export interface Food {
  label: string;
  /** pour 100 g */
  kcal: number;
  prot: number;
  fat: number;
  carb: number;
  /** fibres pour 100 g */
  fibre: number;
  /** portion maximale raisonnable dans une assiette, en g */
  max: number;
  /** repère concret pour se représenter la quantité */
  unit?: string;
  /** équivalent à quantité de protéines comparable */
  swap?: string;
}

/** Sources de protéines : ~20 g de protéines pour 100 g, sauf mention. */
const PROTEINS = {
  oeufs: {
    label: 'Œufs',
    max: 165,
    fibre: 0,
    kcal: 143,
    prot: 12.6,
    fat: 9.5,
    carb: 0.7,
    unit: '1 œuf ≈ 55 g',
    swap: 'ou du fromage blanc',
  },
  fromageBlanc: {
    label: 'Fromage blanc 3 %',
    max: 400,
    fibre: 0,
    kcal: 75,
    prot: 8,
    fat: 3,
    carb: 4,
    unit: '1 pot ≈ 100 g',
    swap: 'ou du skyr, ou un yaourt grec',
  },
  poulet: {
    label: 'Blanc de poulet',
    max: 250,
    fibre: 0,
    kcal: 165,
    prot: 31,
    fat: 3.6,
    carb: 0,
    swap: 'ou de la dinde, du thon au naturel, du tofu ferme',
  },
  poisson: {
    label: 'Filet de poisson (saumon, cabillaud…)',
    max: 250,
    fibre: 0,
    kcal: 180,
    prot: 22,
    fat: 10,
    carb: 0,
    swap: 'ou des œufs, du steak haché 5 %',
  },
  legumineuse: {
    label: 'Lentilles cuites',
    max: 300,
    fibre: 8,
    kcal: 116,
    prot: 9,
    fat: 0.4,
    carb: 20,
    swap: 'ou des pois chiches, des haricots rouges',
  },
} satisfies Record<string, Food>;

const CARBS = {
  avoine: {
    label: "Flocons d'avoine",
    max: 120,
    fibre: 10,
    kcal: 375,
    prot: 13,
    fat: 7,
    carb: 60,
    unit: '40 g ≈ 5 cuillères à soupe',
    swap: 'ou du pain complet',
  },
  riz: {
    label: 'Féculent complet cuit (riz, pâtes, semoule)',
    max: 350,
    fibre: 2,
    kcal: 130,
    prot: 2.7,
    fat: 0.3,
    carb: 28,
    swap: 'ou du quinoa, ou deux fois ce poids en pommes de terre',
  },
  pommeDeTerre: {
    label: 'Pommes de terre cuites',
    max: 400,
    fibre: 2,
    kcal: 87,
    prot: 2,
    fat: 0.1,
    carb: 20,
    swap: 'à quantité de glucides égale, comptez le double du poids de riz',
  },
  pain: {
    label: 'Pain complet',
    max: 160,
    fibre: 7,
    kcal: 247,
    prot: 9,
    fat: 3,
    carb: 42,
    unit: '1 tranche ≈ 40 g',
    swap: 'ou des flocons d’avoine',
  },
} satisfies Record<string, Food>;

const FATS = {
  huile: {
    label: "Huile d'olive",
    max: 40,
    fibre: 0,
    kcal: 900,
    prot: 0,
    fat: 100,
    carb: 0,
    unit: '1 cuillère à soupe ≈ 10 g',
    swap: 'ou de l’huile de colza',
  },
  oleagineux: {
    label: 'Amandes ou noix',
    max: 60,
    fibre: 12,
    kcal: 600,
    prot: 21,
    fat: 52,
    carb: 5,
    unit: '1 poignée ≈ 25 g',
    swap: 'ou du beurre de cacahuète sans sucre ajouté',
  },
} satisfies Record<string, Food>;

const EXTRAS = {
  legumes: {
    label: 'Légumes (crus ou cuits)',
    max: 300,
    fibre: 3,
    kcal: 35,
    prot: 2.5,
    fat: 0.4,
    carb: 4,
    swap: 'variez les couleurs, c’est là que sont les fibres',
  },
  fruit: {
    label: 'Fruit frais',
    max: 200,
    fibre: 2,
    kcal: 60,
    prot: 0.8,
    fat: 0.3,
    carb: 14,
    unit: '1 fruit moyen ≈ 130 g',
  },
} satisfies Record<string, Food>;

export interface PlateItem {
  label: string;
  grams: number;
  kcal: number;
  prot: number;
  /** fibres apportées par cette portion, en g */
  fibre: number;
  unit?: string;
  swap?: string;
}

export interface Meal {
  name: string;
  /** part de l'apport quotidien */
  share: number;
  items: PlateItem[];
  kcal: number;
  prot: number;
}

export interface DayPlan {
  meals: Meal[];
  kcal: number;
  prot: number;
  fat: number;
  carb: number;
  /** écart entre le total du menu et l'apport visé, en kcal */
  gap: number;
  /** fibres estimées, en g */
  fibre: number;
}

interface MealTemplate {
  name: string;
  share: number;
  protein: Food;
  carb: Food;
  fat?: Food;
  extras: Food[];
}

/** Répartition classique en France : trois repas et une collation. */
const TEMPLATES: MealTemplate[] = [
  {
    name: 'Petit-déjeuner',
    share: 0.25,
    protein: PROTEINS.fromageBlanc,
    carb: CARBS.avoine,
    extras: [EXTRAS.fruit],
  },
  {
    name: 'Déjeuner',
    share: 0.35,
    protein: PROTEINS.poulet,
    carb: CARBS.riz,
    fat: FATS.huile,
    extras: [EXTRAS.legumes],
  },
  {
    name: 'Collation',
    share: 0.1,
    protein: PROTEINS.oeufs,
    carb: CARBS.pain,
    extras: [],
  },
  {
    name: 'Dîner',
    share: 0.3,
    protein: PROTEINS.poisson,
    carb: CARBS.riz,
    fat: FATS.oleagineux,
    extras: [EXTRAS.legumes],
  },
];

/** Portions arrondies à 5 g, et plafonnées à ce qui tient dans une assiette. */
const round5 = (g: number) => Math.max(0, Math.round(g / 5) * 5);

function portion(food: Food, grams: number): PlateItem {
  const g = Math.min(round5(grams), food.max);
  return {
    label: food.label,
    grams: g,
    kcal: Math.round((food.kcal * g) / 100),
    prot: Math.round((food.prot * g) / 100),
    fibre: (food.fibre * g) / 100,
    unit: food.unit,
    swap: food.swap,
  };
}

/**
 * Compose une journée qui atteint les macros visées : la source de protéines couvre la part de
 * protéines du repas, le féculent complète les glucides, la matière grasse ajuste les lipides.
 */
interface Slot {
  food: Food;
  grams: number;
  /** le rééquilibrage final peut jouer sur cette portion */
  flexible: boolean;
}

/** Grammes d'aliment nécessaires pour apporter `macroGrams` d'un macronutriment. */
const gramsFor = (macroGrams: number, per100: number) =>
  per100 <= 0 ? 0 : Math.max(0, macroGrams) / (per100 / 100);

const contrib = (slot: Slot, key: 'prot' | 'fat' | 'carb' | 'kcal') =>
  (slot.food[key] * slot.grams) / 100;

/**
 * Compose une journée qui atteint les macros visées.
 *
 * Les légumes et fruits sont posés en premier (quantité fixe), le féculent couvre les glucides
 * restants, la source de protéines ne comble que ce qui manque une fois comptées celles du
 * féculent, et la matière grasse ajuste les lipides. Chaque portion est plafonnée : au-delà, le
 * surplus de glucides part sur le pain. Un dernier passage rattrape l'écart de calories sur les
 * féculents, exactement comme on le ferait dans une vraie assiette.
 */
export function buildDayPlan(metrics: Metrics, macros: Macro[]): DayPlan {
  const target = { prot: macros[0].grams, fat: macros[1].grams, carb: macros[2].grams };

  const mealSlots: Slot[][] = TEMPLATES.map((tpl) => {
    const slots: Slot[] = [];

    const fixed: Slot[] = tpl.extras.map((food) => ({
      food,
      grams: food === EXTRAS.legumes ? 200 : 130,
      flexible: false,
    }));
    const fixedProt = fixed.reduce((sum, s2) => sum + contrib(s2, 'prot'), 0);
    const fixedCarb = fixed.reduce((sum, s2) => sum + contrib(s2, 'carb'), 0);
    const fixedFat = fixed.reduce((sum, s2) => sum + contrib(s2, 'fat'), 0);

    const carbNeed = target.carb * tpl.share - fixedCarb;
    const carbSlot: Slot = {
      food: tpl.carb,
      grams: Math.min(round5(gramsFor(carbNeed, tpl.carb.carb)), tpl.carb.max),
      flexible: true,
    };
    slots.push(carbSlot);

    // Ce que le féculent principal n'a pas pu absorber part sur du pain complet.
    const carbLeft = carbNeed - contrib(carbSlot, 'carb');
    if (carbLeft > 10 && tpl.carb !== CARBS.pain) {
      slots.push({
        food: CARBS.pain,
        grams: Math.min(round5(gramsFor(carbLeft, CARBS.pain.carb)), CARBS.pain.max),
        flexible: true,
      });
    }

    const protFromCarbs = slots.reduce((sum, s2) => sum + contrib(s2, 'prot'), 0);
    const protSlot: Slot = {
      food: tpl.protein,
      grams: Math.min(
        round5(gramsFor(target.prot * tpl.share - protFromCarbs - fixedProt, tpl.protein.prot)),
        tpl.protein.max,
      ),
      flexible: false,
    };
    slots.unshift(protSlot);

    if (tpl.fat) {
      const fatFromOthers = fixedFat + slots.reduce((sum, s2) => sum + contrib(s2, 'fat'), 0);
      slots.push({
        food: tpl.fat,
        grams: Math.min(
          round5(gramsFor(target.fat * tpl.share - fatFromOthers, tpl.fat.fat)),
          tpl.fat.max,
        ),
        flexible: false,
      });
    }

    slots.push(...fixed);
    return slots;
  });

  balance(mealSlots, metrics.target);

  const meals: Meal[] = mealSlots.map((slots, i) => {
    const items = slots.filter((s2) => s2.grams > 0).map((s2) => portion(s2.food, s2.grams));
    return {
      name: TEMPLATES[i].name,
      share: TEMPLATES[i].share,
      items,
      kcal: items.reduce((sum, item) => sum + item.kcal, 0),
      prot: items.reduce((sum, item) => sum + item.prot, 0),
    };
  });

  const kcalTotal = meals.reduce((sum, meal) => sum + meal.kcal, 0);

  return {
    meals,
    kcal: kcalTotal,
    prot: meals.reduce((sum, meal) => sum + meal.prot, 0),
    fat: target.fat,
    carb: target.carb,
    gap: kcalTotal - metrics.target,
    fibre: Math.round(
      meals.reduce((sum, meal) => sum + meal.items.reduce((s2, i) => s2 + i.fibre, 0), 0),
    ),
  };
}

/**
 * Rattrape l'écart de calories en jouant sur les féculents, du repas le plus copieux au plus
 * léger. Sans ce passage, les aliments à quantité fixe (légumes, fruit) et les plafonds de portion
 * décalent le total de 10 % ou plus sur les petits apports.
 */
function balance(mealSlots: Slot[][], targetKcal: number): void {
  const flexible = mealSlots
    .flat()
    .filter((s2) => s2.flexible)
    .sort((a, b) => b.grams - a.grams);
  if (flexible.length === 0) return;

  for (let pass = 0; pass < 6; pass++) {
    const total = mealSlots.flat().reduce((sum, s2) => sum + Math.round(contrib(s2, 'kcal')), 0);
    const gap = total - targetKcal;
    if (Math.abs(gap) <= 25) return;

    let remaining = gap;
    for (const slot of flexible) {
      if (Math.abs(remaining) <= 25) break;
      const perGram = slot.food.kcal / 100;
      const wanted = round5(Math.max(0, slot.grams - remaining / perGram));
      const applied = Math.min(wanted, slot.food.max);
      remaining -= (slot.grams - applied) * perGram;
      slot.grams = applied;
    }
    // Plus rien à ajuster : les portions sont toutes au plancher ou au plafond.
    if (Math.abs(remaining - gap) < 1) return;
  }
}

/** Conseils de mise en pratique, adaptés à l'objectif. */
export function eatingTips(metrics: Metrics): string[] {
  const base = [
    'Répartissez les protéines sur la journée plutôt que tout au dîner : le corps les utilise mieux ainsi.',
    'Visez 25 à 30 g de fibres par jour (légumes, fruits, céréales complètes, légumineuses) : c’est ce qui cale le plus.',
    'Buvez environ 1,5 L d’eau par jour, davantage les jours d’entraînement.',
  ];

  if (metrics.goal.key === 'masse') {
    return [
      'Ajoutez plutôt une collation qu’une portion énorme au dîner : c’est plus facile à digérer et à tenir.',
      ...base.slice(1),
      'Si le poids ne monte pas après deux semaines, ajoutez 150 kcal par jour, pas plus.',
    ];
  }

  return [
    ...base,
    'Le volume compte autant que les calories : légumes et protéines remplissent l’estomac pour peu d’énergie.',
    'Un ou deux repas plus libres par semaine ne compromettent rien, tant que la moyenne de la semaine tient.',
  ];
}
