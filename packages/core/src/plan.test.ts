/**
 * Cohérence des recommandations : macros, journée alimentaire et semaine d'entraînement.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  buildMacros,
  computeMetrics,
  energyBreakdown,
  type Metrics,
  proteinReferenceWeight,
  rateAssessment,
} from './calc';
import type { GoalKey } from './constants';
import {
  buildRecipeSuggestions,
  EXCLUSIONS,
  MAX_PORTIONS,
  platMaison,
  RECIPES,
  snackKcal,
} from './recipes';
import { buildWeek } from './training';

/** Éventail de profils : léger / lourd, sédentaire / très actif, les quatre objectifs. */
const PROFILS: {
  nom: string;
  sexe: 'femme' | 'homme';
  age: string;
  taille: string;
  poids: string;
}[] = [
  { nom: 'femme mince', sexe: 'femme', age: '25', taille: '160', poids: '50' },
  { nom: 'femme moyenne', sexe: 'femme', age: '35', taille: '167', poids: '65' },
  { nom: 'homme moyen', sexe: 'homme', age: '30', taille: '178', poids: '80' },
  { nom: 'homme en surpoids', sexe: 'homme', age: '45', taille: '175', poids: '105' },
  { nom: 'femme obésité', sexe: 'femme', age: '50', taille: '162', poids: '100' },
];

const COLORS = { prot: '#2e7d54', fat: '#b06f10', carb: '#3a6ea5' };

const GOALS: GoalKey[] = ['seche', 'recomp', 'masse', 'maintien'];

function metricsFor(
  p: (typeof PROFILS)[number],
  daily: number,
  sessions: number,
  goal: GoalKey,
): Metrics {
  const m = computeMetrics({ ...p, daily, sessions, goal });
  if (!m) throw new Error('métriques attendues');
  return m;
}

/** Bas, milieu et haut de l'échelle d'activité : facteurs 1,2 · 1,42 · 1,86. */
const NIVEAUX = [
  { daily: 0, sessions: 0 },
  { daily: 1, sessions: 2 },
  { daily: 3, sessions: 4 },
];

function forEachProfile(
  fn: (m: Metrics, daily: number, sessions: number, goal: GoalKey, nom: string) => void,
) {
  for (const p of PROFILS) {
    for (const { daily, sessions } of NIVEAUX) {
      for (const goal of GOALS) {
        fn(
          metricsFor(p, daily, sessions, goal),
          daily,
          sessions,
          goal,
          `${p.nom} / act ${daily}-${sessions} / ${goal}`,
        );
      }
    }
  }
}

describe('macronutriments', () => {
  test('les trois macros couvrent l’apport visé, sans valeur négative', () => {
    forEachProfile((m, _d, _s, _g, nom) => {
      const macros = buildMacros(m, COLORS);
      const total = macros.reduce((sum, x) => sum + x.kcal, 0);
      for (const macro of macros) {
        expect(macro.grams).toBeGreaterThanOrEqual(0);
      }
      // Les arrondis au gramme laissent quelques kcal d'écart.
      expect(Math.abs(total - m.target)).toBeLessThanOrEqual(12);
      expect(nom).toBeTruthy();
    });
  });

  test('les protéines se calculent sur un poids ajusté au-delà d’un IMC de 30', () => {
    const obese = metricsFor(PROFILS[4], 1, 2, 'seche');
    expect(obese.bmi).toBeGreaterThan(30);
    const ref = proteinReferenceWeight(obese);
    expect(ref).toBeLessThan(obese.poids);
    expect(ref).toBeGreaterThan(obese.healthyMax);

    const normal = metricsFor(PROFILS[2], 1, 2, 'seche');
    expect(proteinReferenceWeight(normal)).toBe(normal.poids);
  });

  test('les protéines restent dans une fourchette utilisable (1,2 à 2,4 g/kg de référence)', () => {
    forEachProfile((m, _d, _s, _g, nom) => {
      const [prot] = buildMacros(m, COLORS);
      const gParKg = prot.grams / proteinReferenceWeight(m);
      expect(gParKg).toBeGreaterThanOrEqual(1.2);
      expect(gParKg).toBeLessThanOrEqual(2.4);
      expect(nom).toBeTruthy();
    });
  });

  test('les lipides ne descendent jamais sous 0,6 g par kg de référence', () => {
    forEachProfile((m) => {
      const [, fat] = buildMacros(m, COLORS);
      expect(fat.grams).toBeGreaterThanOrEqual(Math.round(0.6 * proteinReferenceWeight(m)) - 1);
    });
  });

  test('il reste toujours des glucides, même en déficit serré', () => {
    forEachProfile((m) => {
      const [, , carb] = buildMacros(m, COLORS);
      expect(carb.grams).toBeGreaterThan(0);
    });
  });
});

/**
 * Les trois recettes de l'application, recopiées ici plutôt qu'importées.
 *
 * `packages/content` dépend de ce module ; l'importer en retour fermerait le cycle. Et ces tests
 * portent sur le moteur, pas sur le contenu : ils doivent rester vrais quel que soit le catalogue
 * publié. C'est le script de compilation du contenu qui vérifie, lui, que les Markdown déclarent
 * bien un `moment` et une `base` connus.
 */
const MAISON = [
  {
    slug: 'omelette-aux-champignons',
    title: 'Omelette aux champignons',
    kcal: 300,
    prot: 22,
    slot: 'matin',
    base: 'oeufs',
  },
  {
    slug: 'curry-de-poulet-aux-legumes',
    title: 'Curry de poulet aux légumes',
    kcal: 400,
    prot: 34,
    slot: 'plat',
    base: 'volaille',
  },
  {
    slug: 'dahl-de-lentilles-corail',
    title: 'Dahl de lentilles corail',
    kcal: 380,
    prot: 18,
    slot: 'plat',
    base: 'legumineuse',
  },
].map((r) => platMaison({ ...r, slot: r.slot as 'matin' | 'plat', base: r.base as 'oeufs' }));

describe('recettes proposées', () => {
  test('chaque repas propose deux recettes, sans jamais répéter la même', () => {
    forEachProfile((m, _d, _s, goal, nom) => {
      const meals = buildRecipeSuggestions(m, goal);
      expect(meals).toHaveLength(3);
      const urls = meals.flatMap((meal) => meal.recipes.map((r) => r.url));
      expect(urls).toHaveLength(6);
      expect(new Set(urls).size).toBe(6);
      expect(nom).toBeTruthy();
    });
  });

  test('les deux recettes d’un même repas ne reposent jamais sur le même ingrédient', () => {
    forEachProfile((m, _d, _s, goal, nom) => {
      for (const meal of buildRecipeSuggestions(m, goal)) {
        const bases = meal.recipes.map((r) => r.base);
        expect(new Set(bases).size).toBe(bases.length);
        expect(nom).toBeTruthy();
      }
    });
  });

  test('les plats de midi et du soir se répartissent sur quatre ingrédients distincts', () => {
    forEachProfile((m, _d, _s, goal) => {
      const bases = buildRecipeSuggestions(m, goal)
        .filter((meal) => meal.name !== 'Petit-déjeuner')
        .flatMap((meal) => meal.recipes.map((r) => r.base));
      expect(new Set(bases).size).toBe(4);
    });
  });

  test('aucun plat du catalogue extérieur ne double une recette de l’application', () => {
    // Le doublon exact qui a motivé le changement : « Omelette aux champignons » existait en lien
    // de recherche et en recette rédigée.
    const titres = MAISON.map((r) => r.title.toLowerCase());
    for (const plat of RECIPES) {
      expect(titres).not.toContain(plat.title.toLowerCase());
    }
  });

  test('une recette de l’application est toujours la première proposition de son repas', () => {
    forEachProfile((m, _d, _s, goal, nom) => {
      const proposes = buildRecipeSuggestions(m, goal, { maison: MAISON }).flatMap(
        (meal) => meal.recipes,
      );
      const maison = proposes.filter((r) => r.slug);

      expect(maison.length).toBeGreaterThan(0);
      // Jamais reléguée en seconde proposition, quel que soit le profil.
      for (const r of maison) expect(r.slotKey.endsWith('-0')).toBe(true);
      expect(nom).toBeTruthy();
    });
  });

  test('hors déficit, les trois recettes de l’application sont proposées', () => {
    forEachProfile((m, _d, _s, goal) => {
      if (goal === 'seche' || goal === 'recomp') return;
      const slugs = buildRecipeSuggestions(m, goal, { maison: MAISON })
        .flatMap((meal) => meal.recipes)
        .filter((r) => r.slug)
        .map((r) => r.slug);
      expect(new Set(slugs).size).toBe(MAISON.length);
    });
  });

  test('en déficit, le plancher de densité protéique s’applique aussi à nos recettes', () => {
    // Le dahl tombe à 4,7 g de protéines pour 100 kcal, sous le plancher de 7. Le faire passer
    // devant parce qu'il est « maison » reviendrait à conseiller moins bien pour se citer soi-même :
    // la priorité joue à l'intérieur de ce qui convient à l'objectif, jamais contre.
    forEachProfile((m, _d, _s, goal) => {
      if (goal !== 'seche' && goal !== 'recomp') return;
      const slugs = buildRecipeSuggestions(m, goal, { maison: MAISON })
        .flatMap((meal) => meal.recipes)
        .filter((r) => r.slug)
        .map((r) => r.slug);
      expect(slugs).toContain('omelette-aux-champignons');
      expect(slugs).toContain('curry-de-poulet-aux-legumes');
      expect(slugs).not.toContain('dahl-de-lentilles-corail');
    });
  });

  test('une recette de l’application ouvre l’application, pas un site tiers', () => {
    forEachProfile((m, _d, _s, goal) => {
      for (const meal of buildRecipeSuggestions(m, goal, { maison: MAISON })) {
        for (const r of meal.recipes) {
          if (r.slug) {
            expect(r.url).toBe(`/recettes/${r.slug}`);
            expect(r.source).toBe('Nos recettes');
          } else {
            expect(r.url.startsWith('https://')).toBe(true);
          }
        }
      }
    });
  });

  test('les filtres d’ingrédients s’appliquent aussi aux recettes de l’application', () => {
    forEachProfile((m, _d, _s, goal) => {
      const proposes = buildRecipeSuggestions(m, goal, {
        maison: MAISON,
        excluded: ['oeufs', 'vegetarien'],
      }).flatMap((meal) => meal.recipes);

      // L'omelette est écartée par « sans œufs », le curry par « végétarien » : reste le dahl.
      const slugs = proposes.filter((r) => r.slug).map((r) => r.slug);
      expect(slugs).toEqual(['dahl-de-lentilles-corail']);
    });
  });

  test('sans catalogue maison, les propositions restent celles d’avant', () => {
    forEachProfile((m, _d, _s, goal) => {
      const proposes = buildRecipeSuggestions(m, goal).flatMap((meal) => meal.recipes);
      expect(proposes.every((r) => !r.slug)).toBe(true);
      expect(proposes).toHaveLength(6);
    });
  });

  test('les budgets des repas couvrent 90 % de l’apport visé', () => {
    forEachProfile((m, _d, _s, goal) => {
      const total = buildRecipeSuggestions(m, goal).reduce((sum, meal) => sum + meal.budget, 0);
      // Somme des parts (25 + 35 + 30 %), aux arrondis près.
      expect(Math.abs(total - m.target * 0.9)).toBeLessThanOrEqual(3);
      expect(snackKcal(m)).toBeGreaterThan(0);
    });
  });

  test('les portions rapprochent chaque recette du budget de son repas', () => {
    forEachProfile((m, _d, _s, goal) => {
      for (const meal of buildRecipeSuggestions(m, goal)) {
        for (const recipe of meal.recipes) {
          expect(recipe.portions).toBeGreaterThanOrEqual(0.5);
          expect(recipe.portions).toBeLessThanOrEqual(MAX_PORTIONS);
          // Sauf butée de portions, l'écart au budget reste sous une demi-portion.
          if (recipe.portions > 0.5 && recipe.portions < MAX_PORTIONS) {
            expect(Math.abs(recipe.totalKcal - meal.budget)).toBeLessThan(recipe.kcal * 0.5 + 1);
          }
          // Le manque est annoncé dès qu'il dépasse le bruit des tables, jamais passé sous silence.
          const manque = meal.budget - recipe.totalKcal;
          expect(recipe.missingKcal).toBe(manque >= 80 ? manque : 0);
        }
      }
    });
  });

  test('en déficit, les recettes retenues sont les plus denses en protéines', () => {
    const m = metricsFor(PROFILS[2], 1, 2, 'seche');
    const plats = buildRecipeSuggestions(m, 'seche')
      .filter((meal) => meal.name !== 'Petit-déjeuner')
      .flatMap((meal) => meal.recipes);
    for (const recipe of plats) {
      expect(recipe.prot / recipe.kcal).toBeGreaterThan(0.07);
    }
  });

  test('en prise de masse, les recettes retenues sont les plus caloriques', () => {
    const m = metricsFor(PROFILS[2], 1, 2, 'masse');
    const plats = buildRecipeSuggestions(m, 'masse')
      .filter((meal) => meal.name !== 'Petit-déjeuner')
      .flatMap((meal) => meal.recipes);
    for (const recipe of plats) {
      expect(recipe.kcal).toBeGreaterThanOrEqual(350);
    }
  });

  test('le catalogue ne contient que des liens https exploitables', () => {
    expect(RECIPES.length).toBeGreaterThanOrEqual(60);
    for (const recipe of RECIPES) {
      expect(recipe.url.startsWith('https://')).toBe(true);
      expect(recipe.title.length).toBeGreaterThan(0);
      expect(recipe.source.length).toBeGreaterThan(0);
      expect(recipe.kcal).toBeGreaterThan(0);
      expect(recipe.prot).toBeGreaterThan(0);
    }
    // Chaque URL n'apparaît qu'une fois : un doublon fausserait la déduplication par repas.
    expect(new Set(RECIPES.map((r) => r.url)).size).toBe(RECIPES.length);
  });

  test('le tirage est stable à profil égal : le serveur et le client voient la même chose', () => {
    forEachProfile((m, _d, _s, goal) => {
      const a = buildRecipeSuggestions(m, goal).flatMap((r) => r.recipes.map((x) => x.title));
      const b = buildRecipeSuggestions(m, goal).flatMap((r) => r.recipes.map((x) => x.title));
      expect(a).toEqual(b);
    });
  });

  test('« changer » propose un autre plat, sans toucher aux cinq autres', () => {
    const m = metricsFor(PROFILS[2], 1, 2, 'seche');
    const avant = buildRecipeSuggestions(m, 'seche');
    const cle = avant[1].recipes[0].slotKey;
    const apres = buildRecipeSuggestions(m, 'seche', { offsets: { [cle]: 1 } });

    expect(apres[1].recipes[0].title).not.toBe(avant[1].recipes[0].title);
    // Les autres créneaux ne bougent pas : changer un plat n'est pas rebattre la journée.
    expect(apres[0].recipes.map((r) => r.title)).toEqual(avant[0].recipes.map((r) => r.title));
    expect(apres[2].recipes.map((r) => r.title)).toEqual(avant[2].recipes.map((r) => r.title));
  });

  test('« changer » plusieurs fois de suite ne repropose jamais le même plat', () => {
    const m = metricsFor(PROFILS[1], 1, 2, 'maintien');
    const cle = buildRecipeSuggestions(m, 'maintien')[1].recipes[0].slotKey;
    const vus = new Set<string>();
    for (let i = 0; i < 6; i++) {
      const meal = buildRecipeSuggestions(m, 'maintien', { offsets: { [cle]: i } })[1];
      vus.add(meal.recipes[0].title);
    }
    expect(vus.size).toBe(6);
  });

  test('un filtre coché écarte vraiment l’ingrédient, à chaque repas', () => {
    const m = metricsFor(PROFILS[2], 1, 2, 'seche');
    for (const { key } of EXCLUSIONS) {
      for (const meal of buildRecipeSuggestions(m, 'seche', { excluded: [key] })) {
        expect(meal.recipes.length).toBeGreaterThan(0);
        for (const r of meal.recipes) {
          if (key === 'vegetarien') {
            expect(r.contient).not.toContain('viande');
            expect(r.contient).not.toContain('poisson');
          } else {
            expect(r.contient).not.toContain(key);
          }
        }
      }
    }
  });

  test('même tous les filtres cochés, la journée reste complète', () => {
    const m = metricsFor(PROFILS[0], 0, 0, 'seche');
    const tous = EXCLUSIONS.map((e) => e.key);
    for (const meal of buildRecipeSuggestions(m, 'seche', { excluded: tous })) {
      expect(meal.recipes).toHaveLength(2);
      for (const r of meal.recipes) {
        expect(r.contient).not.toContain('viande');
        expect(r.contient).not.toContain('poisson');
        expect(r.contient).not.toContain('oeufs');
      }
    }
  });

  test('le catalogue est assez large pour que deux profils ne voient pas la même chose', () => {
    const titres = new Set<string>();
    forEachProfile((m, _d, _s, goal) => {
      for (const meal of buildRecipeSuggestions(m, goal)) {
        for (const r of meal.recipes) titres.add(r.title);
      }
    });
    // 60 combinaisons de profils et d'objectifs : si le tirage était figé, on verrait 6 titres.
    expect(titres.size).toBeGreaterThanOrEqual(30);
  });

  test('le catalogue couvre les deux moments de la journée', () => {
    expect(RECIPES.filter((r) => r.slot === 'matin').length).toBeGreaterThanOrEqual(12);
    expect(RECIPES.filter((r) => r.slot === 'plat').length).toBeGreaterThanOrEqual(40);
    // Plus aucun lien vers un blog : uniquement les deux sites demandés.
    for (const r of RECIPES) {
      expect(['Marmiton', 'Femme Actuelle']).toContain(r.source);
    }
  });
});

describe('semaine d’entraînement', () => {
  test('toujours au moins deux séances, quatre au maximum', () => {
    forEachProfile((m, daily, sessions, goal) => {
      const week = buildWeek(m, daily, sessions, goal);
      expect(week.strengthPerWeek).toBeGreaterThanOrEqual(2);
      expect(week.strengthPerWeek).toBeLessThanOrEqual(4);
      expect(week.sessions).toHaveLength(week.strengthPerWeek);
    });
  });

  test('les séances portent des titres distincts, même quand la rotation se répète', () => {
    const m = metricsFor(PROFILS[2], 3, 4, 'masse');
    const week = buildWeek(m, 3, 4, 'masse');
    expect(week.strengthPerWeek).toBe(4);
    expect(new Set(week.sessions.map((s) => s.title)).size).toBe(4);
  });

  test('chaque exercice propose une version plus facile et une plus difficile', () => {
    const m = metricsFor(PROFILS[0], 0, 0, 'seche');
    for (const session of buildWeek(m, 0, 0, 'seche').sessions) {
      expect(session.exercises.length).toBeGreaterThanOrEqual(4);
      for (const ex of session.exercises) {
        expect(ex.easier.length).toBeGreaterThan(0);
        expect(ex.harder.length).toBeGreaterThan(0);
      }
    }
  });

  test('le cardio n’est proposé que là où il a du sens', () => {
    const m = metricsFor(PROFILS[3], 0, 0, 'seche');
    expect(buildWeek(m, 0, 0, 'seche').cardio.join(' ')).toContain('marches rapides');
    const masse = metricsFor(PROFILS[2], 1, 2, 'masse');
    expect(buildWeek(masse, 1, 2, 'masse').cardio.join(' ')).toContain('sans creuser');
  });
});

describe('lecture du rythme et de la dépense', () => {
  test('au-delà de 1 % du poids par semaine, le rythme est signalé comme rapide', () => {
    const m = metricsFor(PROFILS[2], 1, 2, 'seche'); // 80 kg
    expect(rateAssessment(m, -0.5).level).toBe('bon');
    expect(rateAssessment(m, -1.2).level).toBe('rapide');
    expect(rateAssessment(m, -0.1).level).toBe('lent');
  });

  test('la décomposition de la dépense fait 100 % et reste cohérente', () => {
    forEachProfile((m) => {
      const e = energyBreakdown(m);
      expect(e.bmr + e.movement).toBe(m.tdee);
      expect(e.bmrPct + e.movementPct).toBeGreaterThanOrEqual(99);
      expect(e.bmrPct + e.movementPct).toBeLessThanOrEqual(101);
    });
  });
});
