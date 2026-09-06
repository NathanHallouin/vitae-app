/**
 * Persistance du profil sur l'appareil. Aucune base de données : la clé est versionnée et
 * `parseProfile` est le seul point d'entrée, pour pouvoir migrer un format existant sans perdre
 * les données des utilisateurs (voir ROADMAP.md).
 *
 * Le support est injecté par l'application hôte (`setProfileStore`) : `localStorage` sur le web,
 * MMKV sur mobile. Ce module ne connaît donc ni l'un ni l'autre, ce qui lui permet d'être importé
 * par Metro comme par Next sans branche de plateforme. Tant que rien n'est injecté — rendu serveur,
 * tests — l'écriture tient en mémoire et la lecture ne rend rien.
 */

import type { GoalKey, Sexe } from './constants';
import { EXCLUSIONS, type Exclusion } from './recipes';
import { ajouterPesee, type Pesee, POIDS_MAX, POIDS_MIN } from './suivi';

// La clé reste inchangée entre les versions : c'est le champ `v` qui porte le format, sinon un
// profil v1 deviendrait illisible et ne pourrait plus être migré.
const PROFILE_KEY = 'vitae.v1.profile';
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
  /**
   * Le poids d'où l'on est parti, en kilogrammes, figé à la première pesée.
   *
   * Il ne sert qu'à une chose, et c'est ce qui justifie de le persister plutôt que de le déduire :
   * le cadran de l'écran « Mon poids » mesure le chemin fait entre ce poids-là et la cible, et un
   * arc a besoin d'une origine qui ne bouge pas. La première pesée de l'historique ferait un point
   * de départ mouvant — elle change dès qu'on supprime une entrée, et le chemin parcouru reculerait
   * sans que rien ne se soit passé sur la balance.
   *
   * Facultatif : un profil enregistré avant cette version reste valide, et le cadran retombe alors
   * sur la première pesée. C'est aussi pourquoi il n'est jamais réécrit une fois posé.
   */
  poidsDepart?: number;
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

  // Un poids de départ hors bornes est écarté sans rejeter le profil : c'est un confort
  // d'affichage, pas une donnée dont dépend un calcul de santé.
  const depart =
    typeof p.poidsDepart === 'number' &&
    Number.isFinite(p.poidsDepart) &&
    p.poidsDepart >= POIDS_MIN &&
    p.poidsDepart <= POIDS_MAX
      ? p.poidsDepart
      : undefined;

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
    ...(depart === undefined ? {} : { poidsDepart: depart }),
    updatedAt: p.updatedAt,
  };
}

/**
 * Le contrat que doivent remplir `localStorage` et MMKV.
 *
 * Volontairement synchrone : l'application lit le profil au montage et affiche des chiffres dans
 * la foulée. Un support asynchrone imposerait un état de chargement à chaque écran, c'est-à-dire
 * exactement le scintillement que la version native cherche à supprimer.
 */
export interface ProfileStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Repli quand rien n'est injecté : rendu serveur, tests, ou support refusé par le système. */
function memoryStore(): ProfileStore {
  const data = new Map<string, string>();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
  };
}

let store: ProfileStore = memoryStore();

/**
 * Branche le support de persistance. À appeler une fois au démarrage de l'application, avant le
 * premier rendu qui lit le profil.
 */
export function setProfileStore(next: ProfileStore): void {
  store = next;
}

/** `null` avant injection du support, en navigation privée verrouillée, ou si rien n'est enregistré. */
export function loadProfile(): StoredProfile | null {
  try {
    return parseProfile(store.getItem(PROFILE_KEY));
  } catch {
    return null;
  }
}

/**
 * Écrit le profil et horodate la modification.
 *
 * **Rend si l'écriture a abouti**, et c'est le changement qui compte. L'échec restait auparavant
 * entre ces accolades : en navigation privée verrouillée ou sur un quota plein, l'application
 * continuait de fonctionner en mémoire, ce qui est le bon comportement — mais personne ne pouvait
 * le dire à l'utilisateur, qui croyait avoir enregistré. Continuer sans le dire n'est pas de la
 * robustesse, c'est une perte de données silencieuse.
 *
 * Les appelants restent libres de l'ignorer, et la plupart le font : ce qui compte est que
 * l'information existe là où quelqu'un vient de créer une donnée qu'il ne pourra pas retrouver.
 */
export function saveProfile(profile: ProfileInput, now: Date = new Date()): boolean {
  const payload: StoredProfile = {
    v: PROFILE_VERSION,
    ...profile,
    updatedAt: now.toISOString(),
  };
  try {
    store.setItem(PROFILE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearProfile(): boolean {
  try {
    store.removeItem(PROFILE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Lecture et écriture brutes, pour les autres données locales que le profil.
 *
 * Le profil garde ses fonctions dédiées, parce qu'il a un format versionné et une lecture
 * tolérante. Les réglages plus simples — les rappels, le thème — n'ont pas besoin de tout cela,
 * mais ils doivent passer par le même support injecté : sans ces deux fonctions, chaque nouveau
 * réglage rouvrirait MMKV ou `localStorage` de son côté, et la règle « un seul point de passage »
 * ne tiendrait pas une version.
 */
export function lireCle(key: string): string | null {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

/** Rend si l'écriture a abouti ; sinon le réglage ne vaut que pour la session en cours. */
export function ecrireCle(key: string, value: string): boolean {
  try {
    store.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

/**
 * L'historique des pesées, sous sa propre clé versionnée.
 *
 * Séparé du profil, et c'est délibéré : ce sont deux durées de vie différentes. Le profil se
 * remplace à chaque modification, l'historique s'accumule et représente parfois des années. Les
 * mêler ferait qu'une lecture ratée du profil emporterait les pesées avec elle.
 *
 * `PROFILE_KEY` a montré la voie : la clé ne bouge pas, c'est le champ `v` qui porte le format.
 */
const SUIVI_KEY = 'vitae.v1.suivi';
const SUIVI_VERSION = 1;

/**
 * Lecture tolérante, **pesée par pesée**.
 *
 * Le profil entier est rejeté au moindre doute parce qu'il se ressaisit en une minute. Un
 * historique, non : rejeter deux ans de pesées parce que l'une d'elles est corrompue serait la
 * pire réponse possible. Chaque entrée est donc jugée seule, et les mauvaises sont écartées.
 */
function parseSuivi(raw: string | null): Pesee[] {
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (typeof data !== 'object' || data === null) return [];

  const enveloppe = data as Record<string, unknown>;
  if (enveloppe.v !== SUIVI_VERSION) return [];
  if (!Array.isArray(enveloppe.pesees)) return [];

  return lirePesees(enveloppe.pesees);
}

/** Les entrées valides d'une liste quelconque, triées et dédoublonnées par jour. */
export function lirePesees(valeurs: unknown[]): Pesee[] {
  let retenues: Pesee[] = [];
  for (const entree of valeurs) {
    if (typeof entree !== 'object' || entree === null) continue;
    const p = entree as Record<string, unknown>;
    if (typeof p.date !== 'string' || typeof p.poids !== 'number') continue;
    // `ajouterPesee` porte déjà les bornes, le tri et le dédoublonnage : on ne les réécrit pas ici.
    retenues = ajouterPesee(retenues, { date: p.date, poids: p.poids });
  }
  return retenues;
}

export function loadSuivi(): Pesee[] {
  try {
    return parseSuivi(store.getItem(SUIVI_KEY));
  } catch {
    return [];
  }
}

/**
 * Écrit l'historique des pesées, et rend si l'écriture a abouti.
 *
 * C'est ici que le silence coûtait le plus cher : une pesée est une donnée que l'utilisateur vient
 * de produire et qu'il ne peut pas reconstituer. L'écran de suivi lit désormais ce retour et le
 * dit — voir `SuiviCard`.
 */
export function saveSuivi(pesees: Pesee[]): boolean {
  try {
    store.setItem(SUIVI_KEY, JSON.stringify({ v: SUIVI_VERSION, pesees }));
    return true;
  } catch {
    return false;
  }
}

/**
 * L'horodatage de la dernière ouverture de l'application.
 *
 * Une seule chose en dépend : savoir si le profil a changé depuis la dernière fois, ce qui décide
 * de l'écran sur lequel l'application s'ouvre (voir `destinationAuDemarrage` dans `nav.ts`). Le
 * comparer à `updatedAt` du profil suffit, et c'est pourquoi c'est un horodatage et non un drapeau :
 * un drapeau demanderait d'être remis à zéro par celui qui l'a levé, donc de coordonner deux
 * écritures ; deux dates se comparent sans rien coordonner.
 *
 * Sa propre clé plutôt qu'un champ du profil : elle s'écrit à chaque lancement, alors que le profil
 * ne s'écrit qu'à une modification. Les mêler ferait passer chaque ouverture pour une modification,
 * ce qui est exactement l'inverse de ce qu'on cherche à mesurer.
 *
 * Absente, elle vaut « jamais ouverte » : la première ouverture après l'installation compte donc
 * comme une modification, et c'est juste — le profil vient d'être rempli.
 */
const OUVERTURE_KEY = 'vitae.v1.ouverture';

/** `null` si l'application n'a encore jamais été ouverte sur cet appareil. */
export function lireDerniereOuverture(): string | null {
  const brut = lireCle(OUVERTURE_KEY);
  if (!brut) return null;
  // Une valeur illisible vaut absence : elle ferait sinon arriver l'application n'importe où.
  return Number.isNaN(new Date(brut).getTime()) ? null : brut;
}

export function marquerOuverture(now: Date = new Date()): void {
  ecrireCle(OUVERTURE_KEY, now.toISOString());
}

/**
 * Les notions du cours déjà lues.
 *
 * Une liste de slugs, et rien d'autre : ni date, ni durée, ni compteur d'ouvertures. Ce qui est
 * lu ne sert qu'à une chose — proposer la notion suivante plutôt que de reproposer les seize — et
 * tout ce qu'on enregistrerait de plus serait de la mesure d'audience, ce que cette application ne
 * fait pas.
 *
 * Sa propre clé, comme les pesées : elle s'accumule alors que le profil se remplace. Son absence
 * ne casse rien, le cours reprend simplement à la première notion.
 *
 * Les identifiants inconnus sont conservés à la lecture plutôt qu'écartés : une notion retirée
 * puis remise garderait ainsi sa marque, et c'est `nombreDeLues` — dans `cours.ts` — qui ignore
 * ce qu'il ne connaît pas au moment de compter.
 */
const LU_KEY = 'vitae.v1.lu';

export function parseLu(raw: string | null): string[] {
  if (!raw) return [];

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  return [...new Set(data.filter((v): v is string => typeof v === 'string'))];
}

export function loadLu(): string[] {
  return parseLu(lireCle(LU_KEY));
}

/** Ajoute une notion aux notions lues. Idempotent : relire ne change rien. */
export function marquerLue(slug: string): string[] {
  const lues = loadLu();
  if (lues.includes(slug)) return lues;
  const prochaines = [...lues, slug];
  ecrireCle(LU_KEY, JSON.stringify(prochaines));
  return prochaines;
}

/**
 * Retire une notion des notions lues.
 *
 * L'état est porté par un bouton, donc il doit se défaire du même bouton : un contrôle qui ne va
 * que dans un sens n'est pas un contrôle, c'est un piège. Le cas réel est banal — on marque lu par
 * réflexe, on s'aperçoit qu'on n'a pas lu.
 */
export function oublierLue(slug: string): string[] {
  const prochaines = loadLu().filter((s) => s !== slug);
  ecrireCle(LU_KEY, JSON.stringify(prochaines));
  return prochaines;
}

export function saveLu(slugs: string[]): void {
  ecrireCle(LU_KEY, JSON.stringify([...new Set(slugs)]));
}
