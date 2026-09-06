/**
 * Ce que ce fichier protège : que les chiffres affichés soient ceux que les formules donnent.
 *
 * Les attentes ne sont **pas** écrites ici. Elles vivent dans `calc.reference.ts`, redérivées à la
 * main depuis `README.md`, arithmétique à l'appui. La raison est celle qui vaut sur tout projet où
 * le code et ses tests sont écrits par le même auteur, dans le même mouvement : sans source
 * indépendante, ajuster un nombre attendu pour faire passer un test est indiscernable de corriger
 * une erreur, et rien ne dit lequel des deux vient d'arriver.
 *
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  bmiGaugePosition,
  buildMacros,
  buildPlan,
  buildProjection,
  computeMetrics,
  energyBreakdown,
  proteinReferenceWeight,
  rangeBar,
} from './calc';
import { CURSEUR_IMC, PROFILS_DE_REFERENCE } from './calc.reference';
import { activityFactor, DAILY, SESSIONS } from './constants';
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

/**
 * Le cœur du contrat : chaque profil de référence, confronté à sa dérivation manuelle.
 *
 * Un échec ici ne se corrige pas en ajustant le nombre attendu. Soit l'implémentation a dérivé,
 * soit l'arithmétique de `calc.reference.ts` est fausse — et dans le second cas c'est la
 * démonstration écrite à côté de la valeur qu'il faut refaire, pas la valeur.
 */
describe('computeMetrics face aux valeurs dérivées à la main', () => {
  for (const profil of PROFILS_DE_REFERENCE) {
    test(profil.couvre, () => {
      const m = computeMetrics(profil.entree);
      expect(m).not.toBeNull();
      if (!m) return;

      const a = profil.attendu;
      expect(activityFactor(profil.entree.daily, profil.entree.sessions)).toBeCloseTo(
        profil.facteur,
        5,
      );
      expect(m.bmr).toBe(a.bmr);
      expect(m.tdee).toBe(a.tdee);
      expect(m.min).toBe(a.min);
      expect(m.max).toBe(a.max);
      expect(m.target).toBe(a.target);
      expect(m.raised).toBe(a.raised);
      expect(m.clamped).toBe(a.clamped);
      expect(m.belowFloor).toBe(a.belowFloor);
      expect(m.bmi).toBeCloseTo(a.bmi, 3);
      expect(m.healthyMin).toBe(a.healthyMin);
      expect(m.healthyMax).toBe(a.healthyMax);
      expect(m.band.label).toBe(a.bandLabel);
      expect(proteinReferenceWeight(m)).toBeCloseTo(a.poidsReferenceProteines, 3);
    });
  }

  test('les grammes de protéines suivent le poids de référence, pas le poids réel', () => {
    for (const profil of PROFILS_DE_REFERENCE) {
      const m = computeMetrics(profil.entree);
      if (!m) throw new Error(`métriques attendues pour : ${profil.couvre}`);
      const proteines = buildMacros(m, COLORS).find((x) => x.label === 'Protéines');
      expect(proteines?.grams).toBe(profil.attendu.proteines);
    }
  });
});

describe('computeMetrics', () => {
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
  /**
   * Les quatre segments, et les deux bornes.
   *
   * La version précédente n'exigeait une valeur exacte que sur **un** segment sur quatre et se
   * contentait d'encadrements ailleurs. Or le bug que ce test existe pour attraper — un curseur
   * placé sur l'échelle entière au lieu de l'intérieur du segment — donne justement des valeurs
   * qui restent dans le bon quart la moitié du temps. Un encadrement ne l'aurait pas vu.
   */
  for (const cas of CURSEUR_IMC) {
    test(`IMC ${cas.imc} → ${cas.calcul}`, () => {
      expect(bmiGaugePosition(cas.imc)).toBeCloseTo(cas.attendu, 3);
    });
  }

  test('le curseur reste dans la bande de son IMC, jamais dans la voisine', () => {
    // Aux bornes de segment exactement : c'est là que le découpage par morceaux se casse.
    expect(bmiGaugePosition(18.5)).toBeCloseTo(25, 3);
    expect(bmiGaugePosition(25)).toBeCloseTo(50, 3);
    expect(bmiGaugePosition(30)).toBeCloseTo(75, 3);
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
    v: 3,
    sexe: 'homme' as const,
    naissance: '1992-03-15',
    taille: '178',
    poids: '86',
    daily: 1,
    sessions: 1,
    goal: 'seche' as const,
    excluded: [],
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
      excluded: [],
    });
  });
});

describe('décomposition de la dépense', () => {
  // Le défaut réparé ici se voyait à l'écran et nulle part ailleurs : les trois parts se lisaient
  // dans la même colonne, mais la digestion se rapportait à ce qu'on mange et les deux autres à
  // ce qu'on dépense. Additionner la colonne donnait 110 %.
  test('les deux postes qui partagent le total font bien 100 %', () => {
    for (const profil of PROFILS_DE_REFERENCE) {
      const m = computeMetrics(profil.entree);
      if (!m) throw new Error(profil.couvre);
      const e = energyBreakdown(m);
      // Un point d'écart est admis : deux arrondis indépendants sur un même total.
      expect(Math.abs(e.bmrPct + e.movementPct - 100)).toBeLessThanOrEqual(1);
    }
  });

  test('la digestion se rapporte au même dénominateur que les deux autres', () => {
    for (const profil of PROFILS_DE_REFERENCE) {
      const m = computeMetrics(profil.entree);
      if (!m) throw new Error(profil.couvre);
      const e = energyBreakdown(m);
      expect(e.digestionPct).toBe(Math.round((e.digestion / m.tdee) * 100));
    }
  });

  test('et ce n’est pas la même chose que 10 %, ce que l’écran écrivait en dur', () => {
    // Sur un profil en déficit, l'apport est sous la dépense : les deux pourcentages divergent, et
    // c'est exactement le cas nominal de l'application. Un test qui passerait aussi avec « 10 »
    // ne protégerait rien.
    const m = computeMetrics(PROFILS_DE_REFERENCE[0].entree);
    if (!m) throw new Error('profil nominal');
    const e = energyBreakdown(m);
    expect(m.target).toBeLessThan(m.tdee);
    expect(e.digestionPct).toBeLessThan(10);
  });
});

describe('légende de la courbe de projection', () => {
  // Le défaut réparé ici tenait dans un nom : `loLabel` / `hiLabel` étaient les bornes de l'axe,
  // marge de dessin comprise, et l'écran les annonçait comme des poids projetés.
  const m = computeMetrics({
    sexe: 'femme',
    age: '35',
    taille: '178',
    poids: '78.4',
    daily: 1,
    sessions: 1,
    goal: 'seche',
  });

  test('les deux bouts annoncés sont le poids d’aujourd’hui et la cible choisie', () => {
    if (!m) throw new Error('profil');
    const p = buildProjection(m, 'seche', 'cut');
    expect(p.coherent).toBe(true);
    expect(p.departLabel).toBe('78,4 kg');
    // La cible « perdre un peu » vaut −5 % du poids, soit 74,5 kg.
    expect(p.arriveeLabel).toBe('74,5 kg');
  });

  test('et jamais les bornes de l’axe, élargies de 1,5 kg de chaque côté', () => {
    if (!m) throw new Error('profil');
    const p = buildProjection(m, 'seche', 'cut');
    expect(p.departLabel).not.toBe('79,9 kg');
    expect(p.arriveeLabel).not.toBe('73,0 kg');
  });
});
