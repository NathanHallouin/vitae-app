/**
 * Persistance du profil dans le navigateur. Aucune base de données : la clé est versionnée et
 * `parseProfile` est le seul point d'entrée, pour pouvoir migrer un format existant sans perdre
 * les données des utilisateurs (voir ROADMAP.md).
 */

import type { GoalKey, Sexe } from './constants';
import { EXCLUSIONS, type Exclusion } from './recipes';

// La clé reste inchangée entre les versions : c'est le champ `v` qui porte le format, sinon un
// profil v1 deviendrait illisible et ne pourrait plus être migré.
export const PROFILE_KEY = 'vitae.v1.profile';
export const PROFILE_VERSION = 3;

export interface StoredProfile {
  v: number;
  sexe: Exclude<Sexe, ''>;
  /** date de naissance `yyyy-mm-dd` ; l'âge est recalculé à l'affichage */
  naissance: string;
  taille: string;
  poids: string;
  /** index dans `DAILY` : mouvement du quotidien, hors sport */
  daily: number;
  /** index dans `SESSIONS` : volume d'entraînement */
  sessions: number;
  goal: GoalKey;
  /** filtres d'ingrédients cochés sur la page « Ce que je mange » */
  excluded: Exclusion[];
  /** dernière modification, ISO ; sert à décider si le poids est encore d'actualité */
  updatedAt: string;
}

export type ProfileInput = Omit<StoredProfile, 'v' | 'updatedAt'>;

const GOALS: GoalKey[] = ['seche', 'recomp', 'masse', 'maintien'];

/**
 * v1 posait une seule question mêlant quotidien et sport. On répartit l'ancien index sur les deux
 * axes au plus proche ; le facteur obtenu peut différer un peu, c'est le prix de la correction.
 */
const V1_ACTIVITY: Array<{ daily: number; sessions: number }> = [
  { daily: 0, sessions: 0 },
  { daily: 1, sessions: 1 },
  { daily: 1, sessions: 2 },
  { daily: 2, sessions: 3 },
  { daily: 3, sessions: 4 },
];

function isIndex(value: unknown, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= max;
}

const CLES_EXCLUSION: string[] = EXCLUSIONS.map((e) => e.key);

/** Filtres inconnus ignorés un à un : un profil reste lisible même après un renommage. */
function lireExclusions(value: unknown): Exclusion[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is Exclusion => typeof v === 'string' && CLES_EXCLUSION.includes(v));
}

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
  if (p.v !== PROFILE_VERSION && p.v !== 1 && p.v !== 2) return null;
  if (p.sexe !== 'femme' && p.sexe !== 'homme') return null;
  if (typeof p.naissance !== 'string' || typeof p.updatedAt !== 'string') return null;
  if (typeof p.taille !== 'string' || typeof p.poids !== 'string') return null;
  if (typeof p.goal !== 'string' || !GOALS.includes(p.goal as GoalKey)) return null;

  let axes: { daily: number; sessions: number };
  if (p.v === 1) {
    if (!isIndex(p.activity, 4)) return null;
    axes = V1_ACTIVITY[p.activity];
  } else {
    if (!isIndex(p.daily, 3) || !isIndex(p.sessions, 4)) return null;
    axes = { daily: p.daily, sessions: p.sessions };
  }
  // v1 et v2 ignoraient les filtres : un profil migré repart sans exclusion.

  return {
    v: PROFILE_VERSION,
    sexe: p.sexe,
    naissance: p.naissance,
    taille: p.taille,
    poids: p.poids,
    daily: axes.daily,
    sessions: axes.sessions,
    goal: p.goal as GoalKey,
    excluded: lireExclusions(p.excluded),
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
