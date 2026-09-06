/**
 * Ce que ce fichier protège : qu'une écriture qui échoue le dise.
 *
 * Les fonctions d'écriture avalaient leur exception. Le comportement était juste — en navigation
 * privée verrouillée ou sur un quota plein, l'application doit continuer en mémoire plutôt que de
 * planter — mais rien ne remontait, et l'utilisateur qui venait d'enregistrer une pesée croyait
 * l'avoir gardée. Continuer sans le dire n'est pas de la robustesse, c'est une perte de données
 * silencieuse.
 *
 * Le support est injecté (`setProfileStore`), donc l'échec se simule sans navigateur : c'est
 * exactement ce que l'inversion de dépendance de `storage.ts` sert à rendre possible.
 *
 * `bun test`
 */

import { afterEach, describe, expect, test } from 'bun:test';
import {
  clearProfile,
  ecrireCle,
  lireCle,
  loadProfile,
  loadSuivi,
  type ProfileInput,
  type ProfileStore,
  saveProfile,
  saveSuivi,
  setProfileStore,
} from './storage';

const PROFIL: ProfileInput = {
  sexe: 'femme',
  naissance: '1992-03-15',
  taille: '168',
  poids: '64',
  daily: 1,
  sessions: 2,
  goal: 'seche',
  excluded: [],
};

/** Un support qui marche, pour vérifier que le retour n'est pas `false` par principe. */
function supportEnMemoire(): ProfileStore {
  const data = new Map<string, string>();
  return {
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  };
}

/**
 * Un support qui refuse d'écrire, comme Safari en navigation privée verrouillée.
 *
 * La lecture continue de fonctionner : c'est le cas réel, et c'est ce qui rend le défaut sournois —
 * l'application relit sans erreur ce qu'elle croyait avoir écrit, en réalité l'état d'avant.
 */
function supportEnLectureSeule(): ProfileStore {
  const socle = supportEnMemoire();
  return {
    getItem: socle.getItem,
    setItem: () => {
      throw new Error('QuotaExceededError');
    },
    removeItem: () => {
      throw new Error('QuotaExceededError');
    },
  };
}

afterEach(() => setProfileStore(supportEnMemoire()));

describe('écriture sur un support disponible', () => {
  test('les quatre fonctions d’écriture rendent vrai, et ce qui est écrit se relit', () => {
    setProfileStore(supportEnMemoire());

    expect(saveProfile(PROFIL)).toBe(true);
    expect(loadProfile()?.taille).toBe('168');

    expect(saveSuivi([{ date: '2026-09-01', poids: 64 }])).toBe(true);
    expect(loadSuivi()).toHaveLength(1);

    expect(ecrireCle('vitae.v1.essai', 'valeur')).toBe(true);
    expect(lireCle('vitae.v1.essai')).toBe('valeur');

    expect(clearProfile()).toBe(true);
    expect(loadProfile()).toBeNull();
  });
});

describe('écriture sur un support qui refuse', () => {
  test('les quatre fonctions rendent faux plutôt que d’avaler l’échec', () => {
    setProfileStore(supportEnLectureSeule());

    expect(saveProfile(PROFIL)).toBe(false);
    expect(saveSuivi([{ date: '2026-09-01', poids: 64 }])).toBe(false);
    expect(ecrireCle('vitae.v1.essai', 'valeur')).toBe(false);
    expect(clearProfile()).toBe(false);
  });

  test('l’application continue de fonctionner : rien ne remonte en exception', () => {
    setProfileStore(supportEnLectureSeule());

    // Le point d'équilibre du choix : l'échec est **rendu**, pas **levé**. Une exception ici
    // planterait l'écran de suivi au moment précis où l'utilisateur enregistre sa pesée.
    expect(() => saveSuivi([{ date: '2026-09-01', poids: 64 }])).not.toThrow();
    expect(() => saveProfile(PROFIL)).not.toThrow();
    expect(loadSuivi()).toEqual([]);
    expect(loadProfile()).toBeNull();
  });
});
