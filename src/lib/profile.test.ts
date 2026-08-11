/**
 * Profil persisté : âge calculé dynamiquement et fraîcheur du poids.
 * `bun test`
 */

import { describe, expect, test } from 'bun:test';
import {
  ageFrom,
  daysSince,
  formatLongDate,
  isWeightStale,
  STALE_WEIGHT_DAYS,
  todayISO,
} from './date';
import { PROFILE_VERSION, parseProfile, type StoredProfile } from './storage';

const NOW = new Date(2026, 7, 10); // 10 août 2026

describe('âge calculé depuis la date de naissance', () => {
  test('années révolues', () => {
    expect(ageFrom('1992-03-15', NOW)).toBe(34); // anniversaire passé
    expect(ageFrom('1992-11-02', NOW)).toBe(33); // anniversaire à venir
    expect(ageFrom('1992-08-10', NOW)).toBe(34); // anniversaire aujourd'hui
    expect(ageFrom('1992-08-11', NOW)).toBe(33); // anniversaire demain
  });

  test('bascule toute seule le jour de l’anniversaire', () => {
    const veille = new Date(2026, 7, 9);
    const jour = new Date(2026, 7, 10);
    expect(ageFrom('2000-08-10', veille)).toBe(25);
    expect(ageFrom('2000-08-10', jour)).toBe(26);
  });

  test('null si la date est inutilisable', () => {
    expect(ageFrom('', NOW)).toBeNull();
    expect(ageFrom('15/03/1992', NOW)).toBeNull();
    expect(ageFrom('2026-02-31', NOW)).toBeNull(); // date inexistante
    expect(ageFrom('2030-01-01', NOW)).toBeNull(); // futur
  });

  test('todayISO borne le champ de saisie', () => {
    expect(todayISO(NOW)).toBe('2026-08-10');
  });
});

describe('fraîcheur du poids', () => {
  const at = (days: number) => new Date(NOW.getTime() - days * 86_400_000).toISOString();

  test('périmé à partir d’une semaine', () => {
    expect(STALE_WEIGHT_DAYS).toBe(7);
    expect(isWeightStale(at(0), NOW)).toBe(false);
    expect(isWeightStale(at(6), NOW)).toBe(false);
    expect(isWeightStale(at(7), NOW)).toBe(true);
    expect(isWeightStale(at(30), NOW)).toBe(true);
  });

  test('un horodatage illisible est traité comme périmé', () => {
    expect(daysSince('pas une date', NOW)).toBeNull();
    expect(isWeightStale('pas une date', NOW)).toBe(true);
  });

  test('date affichée à l’utilisateur', () => {
    expect(formatLongDate('2026-08-03T09:30:00.000Z')).toBe('3 août 2026');
    expect(formatLongDate('pas une date')).toBe('');
  });
});

describe('lecture du profil enregistré', () => {
  const valide: StoredProfile = {
    v: PROFILE_VERSION,
    sexe: 'homme',
    naissance: '1992-03-15',
    taille: '178',
    poids: '86',
    daily: 1,
    sessions: 1,
    goal: 'seche',
    updatedAt: '2026-08-03T09:30:00.000Z',
  };

  test('relit ce qui a été écrit', () => {
    expect(parseProfile(JSON.stringify(valide))).toEqual(valide);
  });

  test('rejette tout ce qui est douteux plutôt que de casser l’app', () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile('')).toBeNull();
    expect(parseProfile('{pas du json')).toBeNull();
    expect(parseProfile('"une chaîne"')).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valide, v: 99 }))).toBeNull(); // version inconnue
    expect(parseProfile(JSON.stringify({ ...valide, sexe: 'autre' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valide, goal: 'inconnu' }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valide, daily: 9 }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valide, sessions: 1.5 }))).toBeNull();
    expect(parseProfile(JSON.stringify({ ...valide, poids: 86 }))).toBeNull(); // nombre, pas chaîne
    const { updatedAt: _, ...sansDate } = valide;
    expect(parseProfile(JSON.stringify(sansDate))).toBeNull();
  });

  test('un profil v1 est migré vers les deux axes plutôt que perdu', () => {
    const v1 = {
      v: 1,
      sexe: 'homme',
      naissance: '1992-03-15',
      taille: '178',
      poids: '86',
      activity: 3, // « très actif » sur l'ancienne échelle unique
      goal: 'seche',
      updatedAt: '2026-08-03T09:30:00.000Z',
    };

    const migré = parseProfile(JSON.stringify(v1));
    expect(migré).not.toBeNull();
    expect(migré?.v).toBe(PROFILE_VERSION);
    expect(migré?.daily).toBe(2);
    expect(migré?.sessions).toBe(3);
    expect(migré?.poids).toBe('86');

    // Les cinq anciens niveaux sont couverts, et un index hors échelle reste rejeté.
    for (const activity of [0, 1, 2, 3, 4]) {
      expect(parseProfile(JSON.stringify({ ...v1, activity }))).not.toBeNull();
    }
    expect(parseProfile(JSON.stringify({ ...v1, activity: 5 }))).toBeNull();
  });
});
