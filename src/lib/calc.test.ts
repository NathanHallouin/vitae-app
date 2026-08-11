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
import { DAILY, SESSIONS } from './constants';
import { fmtGap, fmtKg, fmtWeekly, kcal } from './format';
import { emptyForm, formFromProfile, profileFromForm, reducer, validate } from './state';

const HOMME = {
  sexe: 'homme',
  age: '30',
  taille: '175',
  poids: '70',
  // « assis mais je marche » + 3 à 4 séances : facteur 1,42
  daily: 1,
  sessions: 2,
  goal: 'seche',
} as const;

const COLORS = { prot: '#2e7d54', fat: '#b06f10', carb: '#3a6ea5' };

describe('computeMetrics', () => {
  test('Mifflin-St Jeor, DET et fourchette (homme 30 ans, 175 cm, 70 kg, ×1,42, sèche)', () => {
    const m = computeMetrics(HOMME);
    expect(m).not.toBeNull();
    if (!m) return;
    expect(m.bmr).toBe(1649);
    expect(m.tdee).toBe(2341); // 1 648,75 × 1,42
    expect(m.min).toBe(1756);
    expect(m.max).toBe(2107);
    expect(m.target).toBe(1920);
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
      daily: 0,
      sessions: 0,
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
      for (let daily = 0; daily < DAILY.length; daily++) {
        for (let sessions = 0; sessions < SESSIONS.length; sessions++) {
          const m = computeMetrics({ ...HOMME, goal, daily, sessions });
          if (!m) throw new Error('métriques attendues');
          expect(m.target).toBeGreaterThanOrEqual(m.min);
          expect(m.target).toBeLessThanOrEqual(m.max);
        }
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
    expect(p.weeks).toBe(10); // 3,5 kg à −0,38 kg / semaine
    expect(p.points).toHaveLength(11); // horizon = 10 semaines, un point par semaine
    expect(p.ticks.map((t) => t.label)).toEqual(['S0', 'S2', 'S4', 'S6', 'S8', 'S10']);
  });

  test('pas de projection si la cible va contre l’objectif calorique', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const p = buildProjection(m, 'seche', 'gain');
    expect(p.coherent).toBe(false);
    expect(p.note).toContain('sens inverse');
  });

  test('pas de projection en maintien : le poids est stable', () => {
    const m = computeMetrics({ ...HOMME, goal: 'maintien' });
    if (!m) throw new Error('métriques attendues');
    const p = buildProjection(m, 'maintien', null);
    expect(p.coherent).toBe(false);
    expect(p.note).toContain('votre poids ne bouge pas');
  });
});

describe('macros et plan', () => {
  test('répartition indicative', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const [prot, fat, carb] = buildMacros(m, COLORS);
    expect(prot.grams).toBe(140); // 70 kg × 2,0 g/kg
    expect(fat.grams).toBe(60); // 28 % des kcal / 9
    expect(carb.grams).toBe(205);
    expect(prot.kcal + fat.kcal + carb.kcal).toBeLessThanOrEqual(m.target + 4);
  });

  test('répartition de l’écart mouvement / assiette', () => {
    const m = computeMetrics(HOMME);
    if (!m) throw new Error('métriques attendues');
    const plan = buildPlan(m, 1, 2, 'seche');
    expect(plan.title).toBe('Comment créer cet écart');
    expect(plan.movePct).toBe(25);
    expect(plan.foodPct).toBe(75);
    expect(plan.moveKcal + plan.foodKcal).toBe(m.tdee - m.target);
  });

  test('prise de masse : surplus et libellés inversés', () => {
    const m = computeMetrics({ ...HOMME, goal: 'masse' });
    if (!m) throw new Error('métriques attendues');
    const plan = buildPlan(m, 1, 2, 'masse');
    expect(plan.title).toBe('Comment utiliser ce surplus');
    expect(plan.splitLabel).toBe('Où mettre ce surplus chaque jour');
    expect(plan.foodLabel).toBe('En mangeant un peu plus');
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
    expect(kcal(2096)).toBe('2\u00a0096'); // espace insécable, dessinée par toutes les polices
    expect(fmtGap(-460)).toBe('−460 kcal');
    expect(fmtGap(0)).toBe('équilibre');
    expect(fmtKg(-3.5)).toBe('−3,5 kg');
    expect(fmtKg(0.04)).toBe('poids actuel'); // arrondi à 0,0 kg
    expect(fmtKg(0.05)).toBe('+0,1 kg');
    expect(fmtWeekly(-460)).toBe('−0,42 kg / semaine');
    expect(fmtWeekly(-10)).toBe('poids stable');
  });
});

describe('formulaire et validation', () => {
  const NOW = new Date(2026, 7, 10); // 10 août 2026

  const PROFIL = {
    v: 2,
    sexe: 'homme' as const,
    naissance: '1992-03-15',
    taille: '178',
    poids: '86',
    daily: 1,
    sessions: 1,
    goal: 'seche' as const,
    updatedAt: '2026-08-09T10:00:00.000Z',
  };

  test('messages de validation, en langage courant', () => {
    const form = { ...emptyForm, mode: 'form' as const };
    const rempli = { ...form, sexe: 'homme' as const, taille: '175', poids: '70' };

    expect(validate(form, NOW)).toBe('Choisissez femme ou homme : le calcul n’est pas le même.');
    expect(validate({ ...form, sexe: 'homme' }, NOW)).toBe(
      'Renseignez la date de naissance, la taille et le poids.',
    );
    expect(validate({ ...rempli, naissance: '2018-01-01' }, NOW)).toBe(
      'Ce calcul est prévu pour les 15 à 100 ans.',
    );
    expect(validate({ ...rempli, naissance: '1992-03-15' }, NOW)).toBe('');
  });

  test('une date de naissance invalide est traitée comme absente', () => {
    const form = {
      ...emptyForm,
      mode: 'form' as const,
      sexe: 'homme' as const,
      taille: '175',
      poids: '70',
    };
    for (const naissance of ['', '2026-02-31', '15/03/1992', '2030-01-01']) {
      expect(validate({ ...form, naissance }, NOW)).toBe(
        'Renseignez la date de naissance, la taille et le poids.',
      );
    }
  });

  test('le mode guidé ne valide que les champs de l’étape courante', () => {
    const wizard = { ...emptyForm, sexe: 'homme' as const };
    expect(validate(wizard, NOW)).toBe(''); // étape 0 : le sexe suffit
    expect(reducer(wizard, { type: 'next' }).step).toBe(1);
    expect(validate(reducer(wizard, { type: 'next' }), NOW)).toBe(
      'Renseignez la date de naissance, la taille et le poids.',
    );
  });

  test('poids périmé : le champ est vidé et le rappel affiché', () => {
    const staleWeight = { previous: '86', updatedAt: PROFIL.updatedAt };
    const form = formFromProfile(PROFIL, staleWeight, 'form');

    expect(form.poids).toBe('');
    expect(form.taille).toBe('178');
    expect(form.staleWeight).toEqual(staleWeight);

    const retapé = reducer(form, { type: 'setField', field: 'poids', value: '84' });
    expect(retapé.poids).toBe('84');
    expect(retapé.staleWeight).toBeNull();
  });

  test('poids récent : conservé tel quel', () => {
    const form = formFromProfile(PROFIL, null, 'form');
    expect(form.poids).toBe('86');
    expect(form.staleWeight).toBeNull();
  });

  test('la date de naissance restaurée n’est plus modifiable', () => {
    const form = formFromProfile(PROFIL, null, 'form');
    expect(form.naissanceLocked).toBe(true);

    const tentative = reducer(form, { type: 'setField', field: 'naissance', value: '2000-01-01' });
    expect(tentative.naissance).toBe('1992-03-15');

    // Les autres champs restent modifiables.
    expect(reducer(form, { type: 'setField', field: 'taille', value: '179' }).taille).toBe('179');
    // Un profil vidé rend la saisie de nouveau possible.
    expect(formFromProfile(null, null).naissanceLocked).toBe(false);
  });

  test('le formulaire ne produit un profil que s’il est utilisable', () => {
    expect(profileFromForm(emptyForm)).toBeNull();
    const form = formFromProfile(PROFIL, null, 'form');
    expect(profileFromForm(form)).toEqual({
      sexe: 'homme',
      naissance: '1992-03-15',
      taille: '178',
      poids: '86',
      daily: 1,
      sessions: 1,
      goal: 'seche',
    });
  });
});
