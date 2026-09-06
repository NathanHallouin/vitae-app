/**
 * Le support de persistance sur le web : `localStorage`.
 *
 * Metro choisit ce fichier plutôt que `store.ts` quand la plateforme est le web, sur la seule foi
 * de son extension. MMKV, qui est un module natif, n'entre donc jamais dans le paquet du site —
 * et le reste du code n'a aucune branche de plateforme à porter.
 *
 * L'interface est volontairement identique, y compris sa synchronicité : c'est elle qui permet à
 * `ProfileProvider` de lire le profil dès l'initialisation de son état, sans écran d'attente.
 *
 * Chaque accès est protégé : en navigation privée verrouillée, `localStorage` existe mais lève à
 * la lecture comme à l'écriture. Et pendant l'export statique, il n'existe pas du tout.
 */

import type { ProfileStore } from '@vitae/core/storage';

const disponible = (): boolean => typeof window !== 'undefined' && Boolean(window.localStorage);

export const nativeProfileStore: ProfileStore = {
  getItem(key) {
    if (!disponible()) return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    if (!disponible()) return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota atteint ou stockage refusé : la session continue en mémoire.
    }
  },
  removeItem(key) {
    if (!disponible()) return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      // idem
    }
  },
};

/**
 * Sur le web, le profil n'est **pas** lisible au premier rendu.
 *
 * Les pages sont pré-rendues à la compilation, où `localStorage` n'existe pas : lire dès le premier
 * rendu du navigateur produirait un balisage différent de celui qui a été livré, et l'hydratation
 * échouerait. La lecture est donc reportée d'un rendu, dans un effet.
 *
 * **Cette constante manquait.** `ProfileProvider` l'importe de `@/lib/store`, Metro résolvait ce
 * fichier-ci, et elle valait donc `undefined`. Le comportement était juste — `undefined` est faux,
 * et faux est ce que le web veut — mais par coïncidence, pas par contrat. Le commentaire d'en-tête
 * de `ProfileProvider` affirmait pourtant que « la différence est décidée par le fichier que Metro
 * choisit » : c'était vrai d'un seul côté de la paire.
 *
 * Ce que ça coûtait : inverser la polarité du drapeau — le renommer `LECTURE_DIFFEREE`, par
 * exemple — aurait donné au web la mauvaise branche en silence, sans que TypeScript bronche, celui-ci
 * résolvant toujours `store.ts`. Une règle de CI vérifie désormais que les deux moitiés d'une paire
 * exportent les mêmes noms.
 */
export const LECTURE_IMMEDIATE = false;

const THEME_KEY = 'vitae.v1.theme';

export type StoredTheme = 'light' | 'dark' | 'system';

export function loadTheme(): StoredTheme {
  const value = nativeProfileStore.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function saveTheme(theme: StoredTheme): void {
  nativeProfileStore.setItem(THEME_KEY, theme);
}
