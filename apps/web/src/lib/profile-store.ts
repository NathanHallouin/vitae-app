/**
 * Le support de persistance du site : `localStorage`.
 *
 * `@vitae/core/storage` ne connaît que le contrat ; c'est ici qu'on le remplit côté web, et dans
 * `apps/mobile` qu'on le remplit avec MMKV. Chaque accès est protégé : en navigation privée
 * verrouillée, `localStorage` existe mais lève à la lecture comme à l'écriture.
 */

import type { ProfileStore } from '@vitae/core/storage';

export const webProfileStore: ProfileStore = {
  getItem(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Quota atteint ou stockage refusé : la session continue en mémoire.
    }
  },
  removeItem(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // idem
    }
  },
};
