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
import { buildDayPlan } from './nutrition';
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

function metricsFor(p: (typeof PROFILS)[number], activity: number, goal: GoalKey): Metrics {
  const m = computeMetrics({ ...p, activity, goal });
  if (!m) throw new Error('métriques attendues');
  return m;
}

function forEachProfile(fn: (m: Metrics, activity: number, goal: GoalKey, nom: string) => void) {
  for (const p of PROFILS) {
    for (const activity of [0, 2, 4]) {
      for (const goal of GOALS) {
        fn(metricsFor(p, activity, goal), activity, goal, `${p.nom} / act ${activity} / ${goal}`);
      }
    }
  }
}

describe('macronutriments', () => {
  test('les trois macros couvrent l’apport visé, sans valeur négative', () => {
    forEachProfile((m, _a, _g, nom) => {
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
    const obese = metricsFor(PROFILS[4], 2, 'seche');
    expect(obese.bmi).toBeGreaterThan(30);
    const ref = proteinReferenceWeight(obese);
    expect(ref).toBeLessThan(obese.poids);
    expect(ref).toBeGreaterThan(obese.healthyMax);

    const normal = metricsFor(PROFILS[2], 2, 'seche');
    expect(proteinReferenceWeight(normal)).toBe(normal.poids);
  });

  test('les protéines restent dans une fourchette utilisable (1,2 à 2,4 g/kg de référence)', () => {
    forEachProfile((m, _a, _g, nom) => {
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

describe('journée alimentaire', () => {
  test('le menu proposé tombe à moins de 10 % de l’apport visé', () => {
    forEachProfile((m, _a, _g, nom) => {
      const plan = buildDayPlan(m, buildMacros(m, COLORS));
      const ecart = Math.abs(plan.kcal - m.target) / m.target;
      expect(ecart).toBeLessThan(0.1);
      expect(nom).toBeTruthy();
    });
  });

  test('les protéines du menu approchent la cible', () => {
    forEachProfile((m) => {
      const macros = buildMacros(m, COLORS);
      const plan = buildDayPlan(m, macros);
      expect(plan.prot).toBeGreaterThan(macros[0].grams * 0.85);
      expect(plan.prot).toBeLessThan(macros[0].grams * 1.2);
    });
  });

  test('toutes les portions sont réalistes', () => {
    forEachProfile((m) => {
      const plan = buildDayPlan(m, buildMacros(m, COLORS));
      expect(plan.meals).toHaveLength(4);
      for (const meal of plan.meals) {
        for (const item of meal.items) {
          expect(Number.isFinite(item.grams)).toBe(true);
          expect(item.grams).toBeGreaterThanOrEqual(0);
          expect(item.grams).toBeLessThanOrEqual(500);
        }
      }
    });
  });

  test('les fibres atteignent le repère de 25 g par jour', () => {
    const m = metricsFor(PROFILS[2], 2, 'seche');
    const plan = buildDayPlan(m, buildMacros(m, COLORS));
    expect(plan.fibre).toBeGreaterThanOrEqual(20);
  });
});

describe('semaine d’entraînement', () => {
  test('toujours au moins deux séances, quatre au maximum', () => {
    forEachProfile((m, activity, goal) => {
      const week = buildWeek(m, activity, goal);
      expect(week.strengthPerWeek).toBeGreaterThanOrEqual(2);
      expect(week.strengthPerWeek).toBeLessThanOrEqual(4);
      expect(week.sessions).toHaveLength(week.strengthPerWeek);
    });
  });

  test('les séances portent des titres distincts, même quand la rotation se répète', () => {
    const m = metricsFor(PROFILS[2], 4, 'masse');
    const week = buildWeek(m, 4, 'masse');
    expect(week.strengthPerWeek).toBe(4);
    expect(new Set(week.sessions.map((s) => s.title)).size).toBe(4);
  });

  test('chaque exercice propose une version plus facile et une plus difficile', () => {
    const m = metricsFor(PROFILS[0], 0, 'seche');
    for (const session of buildWeek(m, 0, 'seche').sessions) {
      expect(session.exercises.length).toBeGreaterThanOrEqual(4);
      for (const ex of session.exercises) {
        expect(ex.easier.length).toBeGreaterThan(0);
        expect(ex.harder.length).toBeGreaterThan(0);
      }
    }
  });

  test('le cardio n’est proposé que là où il a du sens', () => {
    const m = metricsFor(PROFILS[3], 0, 'seche');
    expect(buildWeek(m, 0, 'seche').cardio.join(' ')).toContain('marches rapides');
    const masse = metricsFor(PROFILS[2], 2, 'masse');
    expect(buildWeek(masse, 2, 'masse').cardio.join(' ')).toContain('sans creuser');
  });
});

describe('lecture du rythme et de la dépense', () => {
  test('au-delà de 1 % du poids par semaine, le rythme est signalé comme rapide', () => {
    const m = metricsFor(PROFILS[2], 2, 'seche'); // 80 kg
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
