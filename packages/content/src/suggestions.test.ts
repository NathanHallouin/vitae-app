/**
 * Le catalogue de recettes couvre-t-il encore une journée entière ?
 *
 * Ce test ne porte pas sur le moteur de suggestions — celui-là est couvert dans `packages/core` —
 * mais sur le contenu publié. Il répond à une seule question, et c'est celle qui a motivé
 * l'écriture de neuf recettes supplémentaires : reste-t-il des propositions renvoyant vers un site
 * extérieur alors que l'application publie les siennes ?
 *
 * Il vit ici parce que `packages/content` peut importer `@vitae/core`, l'inverse fermerait le
 * cycle. Il échouera le jour où l'on retirera une recette sans regarder ce que ça découvre.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import { computeMetrics, type Metrics } from '@vitae/core/calc';
import type { GoalKey } from '@vitae/core/constants';
import { buildRecipeSuggestions, type Exclusion, RECIPES } from '@vitae/core/recipes';
import { platsMaison } from './index';

const MAISON = platsMaison();

const PROFILS = [
  { nom: 'homme actif', sexe: 'homme' as const, age: '34', taille: '178', poids: '86' },
  { nom: 'femme menue', sexe: 'femme' as const, age: '28', taille: '165', poids: '58' },
  { nom: 'homme corpulent', sexe: 'homme' as const, age: '55', taille: '170', poids: '95' },
];

const GOALS: GoalKey[] = ['seche', 'recomp', 'masse', 'maintien'];
const NIVEAUX = [
  { daily: 0, sessions: 0 },
  { daily: 1, sessions: 2 },
  { daily: 3, sessions: 4 },
];

function pourChaqueProfil(fn: (m: Metrics, goal: GoalKey, nom: string) => void) {
  for (const p of PROFILS) {
    for (const { daily, sessions } of NIVEAUX) {
      for (const goal of GOALS) {
        const m = computeMetrics({ ...p, daily, sessions, goal });
        if (!m) throw new Error('métriques attendues');
        fn(m, goal, `${p.nom} / act ${daily}-${sessions} / ${goal}`);
      }
    }
  }
}

function externes(m: Metrics, goal: GoalKey, excluded: Exclusion[] = []) {
  return buildRecipeSuggestions(m, goal, { maison: MAISON, excluded })
    .flatMap((meal) => meal.recipes)
    .filter((r) => !r.slug);
}

describe('couverture du catalogue', () => {
  test('les bases couvrent une journée entière', () => {
    const matin = new Set(MAISON.filter((r) => r.slot === 'matin').map((r) => r.base));
    const plat = new Set(MAISON.filter((r) => r.slot === 'plat').map((r) => r.base));

    // Deux propositions au petit-déjeuner, quatre entre midi et soir, jamais deux fois le même
    // ingrédient dominant : c'est le minimum pour ne dépendre d'aucun site extérieur.
    expect(matin.size).toBeGreaterThanOrEqual(2);
    expect(plat.size).toBeGreaterThanOrEqual(4);
  });

  test('assez de recettes tiennent le plancher de densité protéique', () => {
    // En déficit, le moteur écarte tout ce qui descend sous 7 g de protéines pour 100 kcal. Une
    // couverture qui ne tiendrait qu'en maintien ne servirait pas les deux objectifs les plus
    // demandés.
    const dense = (r: (typeof MAISON)[number]) => r.prot / r.kcal >= 0.07;
    const matin = new Set(MAISON.filter((r) => r.slot === 'matin' && dense(r)).map((r) => r.base));
    const plat = new Set(MAISON.filter((r) => r.slot === 'plat' && dense(r)).map((r) => r.base));

    expect(matin.size).toBeGreaterThanOrEqual(2);
    expect(plat.size).toBeGreaterThanOrEqual(4);
  });

  test('aucune proposition ne renvoie vers un site extérieur', () => {
    pourChaqueProfil((m, goal, nom) => {
      const dehors = externes(m, goal);
      expect(`${nom} → ${dehors.map((r) => r.title).join(', ')}`).toBe(`${nom} → `);
    });
  });

  test('chaque filtre d’ingrédients reste couvert par nos seules recettes', () => {
    const filtres: Exclusion[][] = [['poisson'], ['porc'], ['oeufs'], ['vegetarien']];
    for (const excluded of filtres) {
      pourChaqueProfil((m, goal, nom) => {
        const dehors = externes(m, goal, excluded);
        expect(`${excluded.join('+')} · ${nom} → ${dehors.length}`).toBe(
          `${excluded.join('+')} · ${nom} → 0`,
        );
      });
    }
  });

  test('aucune recette ne double un plat du catalogue extérieur', () => {
    /**
     * Le doublon est invisible à l'usage et coûteux : le même plat proposé deux fois, une fois en
     * recette rédigée et une fois en lien de recherche. Quatre sont passés en écrivant les
     * cinquante dernières recettes, parce que le test d'alors comparait à une liste figée de trois.
     * Celui-ci lit le catalogue publié.
     */
    const dehors = new Set(RECIPES.map((r) => r.title.toLowerCase()));
    const doublons = MAISON.filter((r) => dehors.has(r.title.toLowerCase())).map((r) => r.title);
    expect(doublons).toEqual([]);
  });

  test('les titres de nos recettes sont uniques', () => {
    const vus = new Set<string>();
    const doublons: string[] = [];
    for (const r of MAISON) {
      const cle = r.title.toLowerCase();
      if (vus.has(cle)) doublons.push(r.title);
      vus.add(cle);
    }
    expect(doublons).toEqual([]);
  });

  test('les valeurs annoncées sont cohérentes', () => {
    for (const r of MAISON) {
      // Une portion de repas plausible, et des protéines qui ne dépassent pas ce que le plat pèse.
      expect(r.kcal).toBeGreaterThanOrEqual(250);
      expect(r.kcal).toBeLessThanOrEqual(700);
      expect(r.prot).toBeGreaterThan(0);
      // 4 kcal par gramme de protéine : elles ne peuvent pas dépasser l'apport total du plat.
      expect(r.prot * 4).toBeLessThanOrEqual(r.kcal);
    }
  });
});
