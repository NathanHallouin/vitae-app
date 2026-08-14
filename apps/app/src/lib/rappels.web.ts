/**
 * Les rappels n'existent pas sur le site.
 *
 * Metro choisit ce fichier plutôt que `rappels.ts` sur le web, et `expo-notifications` — un module
 * natif — n'entre donc jamais dans le paquet du site.
 *
 * Ce n'est pas un manque à combler plus tard. Les notifications du web ne survivent pas à la
 * fermeture de l'onglet sans service worker, et un rappel qui ne sonne que si la page est restée
 * ouverte ne rappelle rien. Le réglage est donc simplement absent de l'interface web, plutôt que
 * présent et sans effet — voir `RAPPELS_DISPONIBLES`, sur lequel l'écran « Bouger » s'appuie.
 */

import type { RappelsConfig } from '@vitae/core/rappels';

export const RAPPELS_DISPONIBLES = false;

export async function demanderPermission(): Promise<boolean> {
  return false;
}

export async function appliquerRappels(_config: RappelsConfig): Promise<boolean> {
  return false;
}

export async function rappelsEnAttente(): Promise<number> {
  return 0;
}
