/**
 * Persistance du profil dans le navigateur. Aucune base de données : la clé est versionnée et
 * `parseProfile` est le seul point d'entrée, pour pouvoir migrer un format existant sans perdre
 * les données des utilisateurs (voir ROADMAP.md).
 */

import type { GoalKey, Sexe } from './constants';

export const PROFILE_KEY = 'vitae.v1.profile';
export const PROFILE_VERSION = 1;

export interface StoredProfile {
  v: number;
  sexe: Exclude<Sexe, ''>;
  /** date de naissance `yyyy-mm-dd` ; l'âge est recalculé à l'affichage */
  naissance: string;
  taille: string;
  poids: string;
  activity: number;
  goal: GoalKey;
  /** dernière modification, ISO — sert à décider si le poids est encore d'actualité */
  updatedAt: string;
}

export type ProfileInput = Omit<StoredProfile, 'v' | 'updatedAt'>;

const GOALS: GoalKey[] = ['seche', 'recomp', 'masse', 'maintien'];

/** Lecture tolérante : toute donnée douteuse renvoie `null` plutôt que de casser l'app. */
export function parseProfile(raw: string | null): StoredProfile | null {
  if (!raw) return null;

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof data !== 'object' || data === null) return null;

  const p = data as Record<string, unknown>;
  // Aucune migration à ce jour : une version inconnue est ignorée.
  if (p.v !== PROFILE_VERSION) return null;
  if (p.sexe !== 'femme' && p.sexe !== 'homme') return null;
  if (typeof p.naissance !== 'string' || typeof p.updatedAt !== 'string') return null;
  if (typeof p.taille !== 'string' || typeof p.poids !== 'string') return null;
  if (typeof p.activity !== 'number' || p.activity < 0 || p.activity > 4) return null;
  if (typeof p.goal !== 'string' || !GOALS.includes(p.goal as GoalKey)) return null;

  return {
    v: PROFILE_VERSION,
    sexe: p.sexe,
    naissance: p.naissance,
    taille: p.taille,
    poids: p.poids,
    activity: p.activity,
    goal: p.goal as GoalKey,
    updatedAt: p.updatedAt,
  };
}

/** `null` côté serveur, en navigation privée verrouillée, ou si rien n'est enregistré. */
export function loadProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    return parseProfile(window.localStorage.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

/** Écrit le profil et horodate la modification. Les échecs (quota, mode privé) sont silencieux. */
export function saveProfile(profile: ProfileInput, now: Date = new Date()): void {
  if (typeof window === 'undefined') return;
  const payload: StoredProfile = {
    v: PROFILE_VERSION,
    ...profile,
    updatedAt: now.toISOString(),
  };
  try {
    window.localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
  } catch {
    // Stockage indisponible : l'app continue de fonctionner en mémoire.
  }
}

export function clearProfile(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(PROFILE_KEY);
  } catch {
    // idem
  }
}
