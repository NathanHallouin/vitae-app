/**
 * Rappels anti-sédentarité : créneaux, bornes et lecture tolérante.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  INTERVALLES,
  MAX_RAPPELS,
  normaliser,
  planifierRappels,
  RAPPELS_DEFAUT,
  resumeRappels,
} from './rappels';

const actif = { ...RAPPELS_DEFAUT, actif: true };

describe('créneaux de rappel', () => {
  test('rien tant que les rappels sont éteints', () => {
    expect(planifierRappels(RAPPELS_DEFAUT)).toEqual([]);
  });

  test('le réglage par défaut couvre la journée de travail', () => {
    const rappels = planifierRappels(actif);
    // 9 h → 19 h, toutes les 45 min, bornes incluses.
    expect(rappels.length).toBe(14);
    expect(rappels[0]).toMatchObject({ hour: 9, minute: 0 });
    expect(rappels[1]).toMatchObject({ hour: 9, minute: 45 });
    expect(rappels[2]).toMatchObject({ hour: 10, minute: 30 });
    expect(rappels[rappels.length - 1]).toMatchObject({ hour: 18, minute: 45 });
  });

  test('les deux bornes sont incluses quand l’intervalle tombe juste', () => {
    const rappels = planifierRappels({ ...actif, intervalleMinutes: 60 });
    expect(rappels.length).toBe(11); // 9 h à 19 h inclus
    expect(rappels[0]).toMatchObject({ hour: 9, minute: 0 });
    expect(rappels[10]).toMatchObject({ hour: 19, minute: 0 });
  });

  test('aucun rappel ne sort de la journée', () => {
    const rappels = planifierRappels({
      ...actif,
      debutHeure: 22,
      finHeure: 24,
      intervalleMinutes: 30,
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

  test('le plafond d’iOS n’est jamais dépassé', () => {
    const rappels = planifierRappels({
      actif: true,
      intervalleMinutes: 30,
      debutHeure: 0,
      finHeure: 24,
    });
    expect(rappels.length).toBeLessThanOrEqual(MAX_RAPPELS);
  });

  test('deux rappels voisins ne disent pas la même chose', () => {
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

describe('normalisation', () => {
  test('un intervalle inconnu revient à celui par défaut', () => {
    expect(normaliser({ ...actif, intervalleMinutes: 7 }).intervalleMinutes).toBe(45);
  });

  test('tous les intervalles proposés sont acceptés', () => {
    for (const i of INTERVALLES) {
      expect(normaliser({ ...actif, intervalleMinutes: i }).intervalleMinutes).toBe(i);
    }
  });

  test('la fin reste après le début', () => {
    const c = normaliser({ ...actif, debutHeure: 18, finHeure: 8 });
    expect(c.finHeure).toBeGreaterThan(c.debutHeure);
  });

  test('les heures hors bornes sont ramenées dedans', () => {
    expect(normaliser({ ...actif, debutHeure: -5 }).debutHeure).toBe(0);
    expect(normaliser({ ...actif, debutHeure: 99 }).debutHeure).toBe(23);
    expect(normaliser({ ...actif, debutHeure: 8, finHeure: 99 }).finHeure).toBe(24);
  });

  test('une valeur qui n’est pas un nombre ne casse rien', () => {
    const c = normaliser({ ...actif, debutHeure: Number.NaN, finHeure: Number.NaN });
    expect(Number.isFinite(c.debutHeure)).toBe(true);
    expect(Number.isFinite(c.finHeure)).toBe(true);
  });
});

describe('résumé lisible', () => {
  test('éteint, il le dit', () => {
    expect(resumeRappels(RAPPELS_DEFAUT)).toContain('Aucun rappel');
  });

  test('allumé, il annonce le compte et la plage', () => {
    expect(resumeRappels(actif)).toBe('14 rappels par jour, toutes les 45 min, de 9 h à 19 h.');
  });

  test('les intervalles ronds s’écrivent en heures', () => {
    expect(resumeRappels({ ...actif, intervalleMinutes: 60 })).toContain('toutes les 1 h');
  });
});
