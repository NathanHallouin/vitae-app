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

const THEME_KEY = 'vitae.v1.theme';

export type StoredTheme = 'light' | 'dark' | 'system';

export function loadTheme(): StoredTheme {
  const value = nativeProfileStore.getItem(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function saveTheme(theme: StoredTheme): void {
  nativeProfileStore.setItem(THEME_KEY, theme);
}
