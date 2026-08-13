/**
 * Le support de persistance de l'application native : MMKV.
 *
 * MMKV plutôt qu'`AsyncStorage` pour une raison qui tient en un mot : synchrone. `AsyncStorage`
 * rend une promesse, donc le premier rendu ne connaît pas encore le profil, donc chaque écran
 * commence par un état vide avant de se remplir. C'est précisément le scintillement au démarrage
 * qui trahit une application non native. MMKV lit en mémoire mappée : le profil est là dès le
 * premier rendu, et l'application s'ouvre directement sur les chiffres.
 *
 * Contrepartie assumée : c'est un module natif, l'application ne tourne donc pas dans Expo Go.
 * C'est de toute façon le cas dès que l'on vise les magasins, où l'on livre un build EAS.
 */

import type { ProfileStore } from '@vitae/core/storage';
import { MMKV } from 'react-native-mmkv';

const mmkv = new MMKV({ id: 'vitae' });

export const nativeProfileStore: ProfileStore = {
  getItem: (key) => mmkv.getString(key) ?? null,
  setItem: (key, value) => mmkv.set(key, value),
  removeItem: (key) => mmkv.delete(key),
};

/**
 * Le thème choisi, à part du profil.
 *
 * Séparé volontairement : c'est une préférence d'affichage, pas une donnée de santé. La mêler au
 * profil ferait qu'un « Recommencer » repasserait l'application en clair, ce que personne ne
 * demande.
 */
const THEME_KEY = 'vitae.v1.theme';

export type StoredTheme = 'light' | 'dark' | 'system';

export function loadTheme(): StoredTheme {
  const value = mmkv.getString(THEME_KEY);
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function saveTheme(theme: StoredTheme): void {
  mmkv.set(THEME_KEY, theme);
}
