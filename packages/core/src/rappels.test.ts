/**
 * Rappels anti-sédentarité : plages, créneaux, bornes et lecture tolérante.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  formatHeure,
  formatPlage,
  INTERVALLES,
  JOUR,
  MAX_PLAGES,
  MAX_RAPPELS,
  nomDePlage,
  normaliser,
  PLAGES_PRETES,
  plageSuivante,
  planifierRappels,
  RAPPELS_DEFAUT,
  resumeRappels,
} from './rappels';

const actif = { ...RAPPELS_DEFAUT, actif: true };
const h = (heures: number, minutes = 0) => heures * 60 + minutes;

describe('créneaux de rappel', () => {
  test('rien tant que les rappels sont éteints', () => {
    expect(planifierRappels(RAPPELS_DEFAUT)).toEqual([]);
  });

  test('le réglage par défaut couvre la matinée et l’après-midi, pas le déjeuner', () => {
    const rappels = planifierRappels(actif);
    // 9 h → 12 h puis 14 h → 19 h, toutes les 45 min, bornes incluses : 5 + 7.
    expect(rappels.length).toBe(12);
    expect(rappels[0]).toMatchObject({ hour: 9, minute: 0 });
    expect(rappels[4]).toMatchObject({ hour: 12, minute: 0 });
    // La coupure de midi est bien vide : rien entre 12 h et 14 h.
    expect(rappels[5]).toMatchObject({ hour: 14, minute: 0 });
    expect(rappels[rappels.length - 1]).toMatchObject({ hour: 18, minute: 30 });
  });

  test('les deux bornes d’une plage sont incluses quand l’intervalle tombe juste', () => {
    const rappels = planifierRappels({
      ...actif,
      intervalleMinutes: 60,
      plages: [{ debut: h(9), fin: h(12) }],
    });
    expect(rappels.length).toBe(4); // 9, 10, 11, 12
    expect(rappels[3]).toMatchObject({ hour: 12, minute: 0 });
  });

  test('les demi-heures sont respectées', () => {
    const rappels = planifierRappels({
      ...actif,
      intervalleMinutes: 30,
      plages: [{ debut: h(9, 30), fin: h(10, 30) }],
    });
    expect(rappels.map((r) => `${r.hour}:${r.minute}`)).toEqual(['9:30', '10:0', '10:30']);
  });

  test('chaque plage produit ses propres créneaux', () => {
    const rappels = planifierRappels({
      ...actif,
      intervalleMinutes: 60,
      plages: [
        { debut: h(8), fin: h(9) },
        { debut: h(20), fin: h(21) },
      ],
    });
    expect(rappels.length).toBe(4);
    expect(rappels.map((r) => r.hour)).toEqual([8, 9, 20, 21]);
  });

  test('aucun rappel ne sort de la journée', () => {
    const rappels = planifierRappels({
      ...actif,
      intervalleMinutes: 30,
      plages: [{ debut: h(22), fin: JOUR }],
    });
    for (const r of rappels) {
      expect(r.hour).toBeGreaterThanOrEqual(0);
      expect(r.hour).toBeLessThanOrEqual(23);
      expect(r.minute).toBeGreaterThanOrEqual(0);
      expect(r.minute).toBeLessThan(60);
    }
    // 22 h 00, 22 h 30, 23 h 00, 23 h 30 : minuit n'est pas une heure de la journée.
    expect(rappels.length).toBe(4);
  });

  test('le plafond d’iOS n’est jamais dépassé, plages cumulées', () => {
    const rappels = planifierRappels({
      actif: true,
      intervalleMinutes: 30,
      plages: [
        { debut: 0, fin: h(6) },
        { debut: h(7), fin: h(13) },
        { debut: h(14), fin: h(20) },
        { debut: h(21), fin: JOUR },
      ],
    });
    expect(rappels.length).toBeLessThanOrEqual(MAX_RAPPELS);
  });

  test('deux rappels voisins ne disent pas la même chose, y compris entre deux plages', () => {
    const rappels = planifierRappels(actif);
    for (let i = 1; i < rappels.length; i++) {
      expect(rappels[i].titre).not.toBe(rappels[i - 1].titre);
    }
  });

  test('chaque rappel porte un titre et un corps', () => {
    for (const r of planifierRappels(actif)) {
      expect(r.titre.length).toBeGreaterThan(0);
      expect(r.corps.length).toBeGreaterThan(0);
    }
  });
});

describe('normalisation des plages', () => {
  test('un intervalle inconnu revient à celui par défaut', () => {
    expect(normaliser({ ...actif, intervalleMinutes: 7 }).intervalleMinutes).toBe(45);
  });

  test('tous les intervalles proposés sont acceptés', () => {
    for (const i of INTERVALLES) {
      expect(normaliser({ ...actif, intervalleMinutes: i }).intervalleMinutes).toBe(i);
    }
  });

  test('les plages sont remises dans l’ordre', () => {
    const c = normaliser({
      ...actif,
      plages: [
        { debut: h(14), fin: h(19) },
        { debut: h(9), fin: h(12) },
      ],
    });
    expect(c.plages).toEqual([
      { debut: h(9), fin: h(12) },
      { debut: h(14), fin: h(19) },
    ]);
  });

  test('deux plages qui se chevauchent n’en font qu’une', () => {
    const c = normaliser({
      ...actif,
      plages: [
        { debut: h(9), fin: h(13) },
        { debut: h(11), fin: h(16) },
      ],
    });
    expect(c.plages).toEqual([{ debut: h(9), fin: h(16) }]);
  });

  test('deux plages qui se touchent n’en font qu’une', () => {
    const c = normaliser({
      ...actif,
      plages: [
        { debut: h(9), fin: h(12) },
        { debut: h(12), fin: h(14) },
      ],
    });
    expect(c.plages).toEqual([{ debut: h(9), fin: h(14) }]);
  });

  test('une plage incluse dans une autre disparaît sans la raccourcir', () => {
    const c = normaliser({
      ...actif,
      plages: [
        { debut: h(9), fin: h(18) },
        { debut: h(10), fin: h(11) },
      ],
    });
    expect(c.plages).toEqual([{ debut: h(9), fin: h(18) }]);
  });

  test('la fin reste après le début', () => {
    const c = normaliser({ ...actif, plages: [{ debut: h(18), fin: h(8) }] });
    expect(c.plages[0].fin).toBeGreaterThan(c.plages[0].debut);
  });

  test('les heures hors bornes sont ramenées dedans', () => {
    const c = normaliser({ ...actif, plages: [{ debut: -300, fin: 9999 }] });
    expect(c.plages[0].debut).toBe(0);
    expect(c.plages[0].fin).toBe(JOUR);
  });

  test('les minutes sont arrondies au pas de réglage', () => {
    const c = normaliser({ ...actif, plages: [{ debut: h(9, 7), fin: h(12, 22) }] });
    expect(c.plages[0]).toEqual({ debut: h(9), fin: h(12, 30) });
  });

  test('une valeur qui n’est pas un nombre ne casse rien', () => {
    const c = normaliser({ ...actif, plages: [{ debut: Number.NaN, fin: Number.NaN }] });
    expect(Number.isFinite(c.plages[0].debut)).toBe(true);
    expect(Number.isFinite(c.plages[0].fin)).toBe(true);
  });

  test('aucune plage ramène celles par défaut : un interrupteur allumé doit sonner', () => {
    expect(normaliser({ ...actif, plages: [] }).plages).toEqual(RAPPELS_DEFAUT.plages);
    expect(normaliser({ ...actif, plages: undefined as never }).plages).toEqual(
      RAPPELS_DEFAUT.plages,
    );
  });

  test('le nombre de plages est plafonné', () => {
    const trop = Array.from({ length: 8 }, (_, i) => ({ debut: h(i * 2), fin: h(i * 2 + 1) }));
    expect(normaliser({ ...actif, plages: trop }).plages.length).toBe(MAX_PLAGES);
  });

  test('normaliser ne modifie pas ce qu’on lui donne', () => {
    const plages = [{ debut: h(9), fin: h(12) }];
    normaliser({ ...actif, plages });
    expect(plages).toEqual([{ debut: h(9), fin: h(12) }]);
  });
});

describe('plage proposée', () => {
  test('elle se pose après la dernière, sans la toucher', () => {
    const suivante = plageSuivante([{ debut: h(9), fin: h(12) }]);
    expect(suivante).toEqual({ debut: h(13), fin: h(15) });
  });

  test('elle ne déborde pas de la journée', () => {
    const suivante = plageSuivante([{ debut: h(19), fin: h(21) }]);
    expect(suivante).toEqual({ debut: h(22), fin: JOUR });
  });

  test('rien à proposer quand il ne reste pas la place', () => {
    expect(plageSuivante([{ debut: h(20), fin: h(23) }])).toBeNull();
  });

  test('rien à proposer une fois le plafond atteint', () => {
    const pleines = Array.from({ length: MAX_PLAGES }, (_, i) => ({
      debut: h(i * 2),
      fin: h(i * 2 + 1),
    }));
    expect(plageSuivante(pleines)).toBeNull();
  });

  test('la première plage démarre le matin', () => {
    expect(plageSuivante([])).toEqual({ debut: h(9), fin: h(11) });
  });
});

describe('écriture des heures', () => {
  test('les heures rondes n’affichent pas de minutes', () => {
    expect(formatHeure(h(9))).toBe('9 h');
  });

  test('les demi-heures s’écrivent en toutes lettres', () => {
    expect(formatHeure(h(13, 30))).toBe('13 h 30');
  });

  test('la fin de journée se dit minuit', () => {
    expect(formatHeure(JOUR)).toBe('minuit');
  });

  test('une plage se lit comme une phrase', () => {
    expect(formatPlage({ debut: h(9), fin: h(12, 30) })).toBe('de 9 h à 12 h 30');
  });

  test('chaque plage porte le nom du moment où elle commence', () => {
    expect(nomDePlage({ debut: h(9), fin: h(12) })).toBe('Matinée');
    expect(nomDePlage({ debut: h(14), fin: h(19) })).toBe('Après-midi');
    expect(nomDePlage({ debut: h(20), fin: h(22) })).toBe('Soirée');
    expect(nomDePlage({ debut: h(3), fin: h(4) })).toBe('Nuit');
  });

  test('les plages toutes faites sont valides telles quelles', () => {
    for (const { plage } of PLAGES_PRETES) {
      expect(normaliser({ ...actif, plages: [plage] }).plages).toEqual([plage]);
    }
  });
});

describe('résumé lisible', () => {
  test('éteint, il le dit', () => {
    expect(resumeRappels(RAPPELS_DEFAUT)).toContain('Aucun rappel');
  });

  test('allumé, il annonce le compte et toutes les plages', () => {
    expect(resumeRappels(actif)).toBe(
      '12 rappels par jour, toutes les 45 min, de 9 h à 12 h et de 14 h à 19 h.',
    );
  });

  test('les intervalles ronds s’écrivent en heures', () => {
    expect(resumeRappels({ ...actif, intervalleMinutes: 60 })).toContain('toutes les 1 h');
  });
});
