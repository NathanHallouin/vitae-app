/**
 * Valeurs de référence issues du prototype (`maquette/Calculateur MB.dc.html`).
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  bmiGaugePosition,
  buildMacros,
  buildPlan,
  buildProjection,
  computeMetrics,
  rangeBar,
} from './calc';
import { fmtGap, fmtKg, fmtWeekly, kcal } from './format';
import { initialState, reducer, validate } from './state';

const HOMME = {
  sexe: 'homme',
  age: '30',
  taille: '175',
  poids: '70',
  activity: 2,
  goal: 'seche',
} as const;

describe('computeMetrics', () => {
  test('Mifflin-St Jeor, DET et fourchette (homme 30 ans, 175 cm, 70 kg, modéré, sèche)', () => {
    const m = computeMetrics(HOMME);
    expect(m).not.toBeNull();
    if (!m) return;
    expect(m.bmr).toBe(1649);
    expect(m.tdee).toBe(2556);
    expect(m.min).toBe(1917);
    expect(m.max).toBe(2300);
    expect(m.target).toBe(2096);
    expect(m.healthyMin).toBe(57);
    expect(m.healthyMax).toBe(76);
    expect(m.band.label).toBe('Corpulence normale');
  });

  test('renvoie null tant que le profil est incomplet', () => {
    expect(computeMetrics({ ...HOMME, sexe: '' })).toBeNull();
    expect(computeMetrics({ ...HOMME, poids: '' })).toBeNull();
  });

  test('la fourchette ne descend jamais sous le métabolisme de base', () => {
    const m = computeMetrics({
      sexe: 'femme',
      age: '25',
      taille: '160',
      poids: '50',
      activity: 0,
      goal: 'seche',
    });
    if (!m) throw new Error('métriques attendues');
    expect(m.min).toBeGreaterThanOrEqual(m.bmr);
    expect(m.clamped).toBe(true);
    expect(m.belowFloor).toBe(true);
    expect(m.floor).toBe(1200);
  });

  test('le recommandé reste borné dans [min, max] pour chaque objectif', () => {
    for (const goal of ['seche', 'recomp', 'masse', 'maintien'] as const) {
      for (const activity of [0, 1, 2, 3, 4]) {
        const m = computeMetrics({ ...HOMME, goal, activity });
        if (!m) throw new Error('métriques attendues');
        expect(m.target).toBeGreaterThanOrEqual(m.min);
        expect(m.target).toBeLessThanOrEqual(m.max);
      }
    }
  });
});

describe('jauge IMC', () => {
  test('le curseur tombe dans la bande annoncée', () => {
    expect(bmiGaugePosition(17)).toBeLessThan(25); // < 18,5
    expect(bmiGaugePosition(22.857)).toBeCloseTo(41.76, 2); // 18,5 – 25
    expect(bmiGaugePosition(27)).toBeGreaterThanOrEqual(50); // 25 – 30
    expect(bmiGaugePosition(27)).toBeLessThan(75);
    expect(bmiGaugePosition(34)).toBeGreaterThanOrEqual(75); // > 30
  });

  test('reste dans les bornes 2 – 98 %', () => {
    expect(bmiGaugePosition(10)).toBe(2);
    expect(bmiGaugePosition(60)).toBe(98);
  });
});

describe('projection', () => {
  test('cible par défaut et durée (sèche, IMC normal)', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const p = buildProjection(m, 'seche', null);
    expect(p.key).toBe('cut');
    expect(p.selected.w).toBe(66.5);
    expect(p.coherent).toBe(true);
    expect(p.weeks).toBe(9);
    expect(p.points).toHaveLength(10); // horizon = 9 semaines, un point par semaine
    expect(p.ticks.map((t) => t.label)).toEqual(['S0', 'S2', 'S4', 'S6', 'S8']);
  });

  test('pas de projection si la cible va contre l’objectif calorique', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const p = buildProjection(m, 'seche', 'gain');
    expect(p.coherent).toBe(false);
    expect(p.note).toContain('sens opposé');
  });

  test('pas de projection en maintien : le poids est stable', () => {
    const m = computeMetrics({ ...HOMME, goal: 'maintien' });
    if (!m) throw new Error('métriques attendues');
    const p = buildProjection(m, 'maintien', null);
    expect(p.coherent).toBe(false);
    expect(p.note).toContain('le poids reste stable');
  });
});

describe('macros et plan', () => {
  test('répartition indicative', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const [prot, fat, carb] = buildMacros(m, '#1976d2');
    expect(prot.grams).toBe(140); // 70 kg × 2,0 g/kg
    expect(fat.grams).toBe(65); // 28 % des kcal / 9
    expect(carb.grams).toBe(238);
    expect(prot.kcal + fat.kcal + carb.kcal).toBeLessThanOrEqual(m.target + 4);
  });

  test('répartition de l’écart mouvement / assiette', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const plan = buildPlan(m, 2, 'seche');
    expect(plan.title).toBe("Construire l'écart");
    expect(plan.movePct).toBe(25);
    expect(plan.foodPct).toBe(75);
    expect(plan.moveKcal + plan.foodKcal).toBe(m.tdee - m.target);
    expect(plan.moves).toHaveLength(4); // 5 exercices seulement si activité ≤ 1
  });

  test('5 exercices et conseils NEAT pour les profils sédentaires', () => {
    const m = computeMetrics({ ...HOMME, activity: 0 });
    if (!m) throw new Error('métriques attendues');
    const plan = buildPlan(m, 0, 'seche');
    expect(plan.moves).toHaveLength(5);
    expect(plan.tips[0]).toContain('Levez-vous 3 min par heure');
  });

  test('prise de masse : surplus et libellés inversés', () => {
    const m = computeMetrics({ ...HOMME, goal: 'masse' });
    if (!m) throw new Error('métriques attendues');
    const plan = buildPlan(m, 2, 'masse');
    expect(plan.title).toBe('Construire le surplus');
    expect(plan.splitLabel).toBe('Surplus quotidien à répartir');
    expect(plan.foodLabel).toBe("En plus dans l'assiette");
  });
});

describe('barre de fourchette', () => {
  test('le repère DET et la fourchette sont dans l’échelle', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const bar = rangeBar(m);
    expect(bar.low).toBeGreaterThanOrEqual(0);
    expect(bar.low + bar.width).toBeLessThanOrEqual(100);
    expect(bar.tdee).toBeLessThanOrEqual(100);
  });
});

describe('formats français', () => {
  test('espace insécable, virgule décimale et signe moins U+2212', () => {
    expect(kcal(2096)).toBe((2096).toLocaleString('fr-FR'));
    expect(fmtGap(-460)).toBe('−460 kcal');
    expect(fmtGap(0)).toBe('équilibre');
    expect(fmtKg(-3.5)).toBe('−3,5 kg');
    expect(fmtKg(0.04)).toBe('poids actuel'); // arrondi à 0,0 kg
    expect(fmtKg(0.05)).toBe('+0,1 kg');
    expect(fmtWeekly(-460)).toBe('−0,42 kg / semaine');
    expect(fmtWeekly(-10)).toBe('poids stable');
  });
});

describe('état et validation', () => {
  test('messages de validation du formulaire', () => {
    const form = { ...initialState, mode: 'form' as const };
    expect(validate(form)).toBe(
      'Sélectionnez un sexe biologique pour appliquer la bonne équation.',
    );
    expect(validate({ ...form, sexe: 'homme' })).toBe("Renseignez l'âge, la taille et le poids.");
    expect(validate({ ...form, sexe: 'homme', age: '8', taille: '175', poids: '70' })).toBe(
      "L'âge doit être compris entre 15 et 100 ans.",
    );
    expect(validate({ ...form, sexe: 'homme', age: '30', taille: '175', poids: '70' })).toBe('');
  });

  test('le mode guidé ne valide que les champs de l’étape courante', () => {
    const wizard = { ...initialState, screen: 'input' as const, sexe: 'homme' as const };
    expect(reducer(wizard, { type: 'submit' }).step).toBe(1); // étape 0 : sexe seul
  });

  test('changer d’objectif réinitialise le poids cible choisi', () => {
    const withTarget = { ...initialState, targetKey: 'mid' };
    expect(reducer(withTarget, { type: 'setGoal', value: 'masse' }).targetKey).toBeNull();
  });

  test('« Recommencer » remet l’état initial', () => {
    const dirty = { ...initialState, screen: 'result' as const, poids: '86', error: 'oups' };
    expect(reducer(dirty, { type: 'reset' })).toEqual(initialState);
  });
});
