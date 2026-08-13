/**
 * Accès aux recettes, identique sur le site et dans l'application native.
 *
 * Les fonctions sont synchrones : tout est déjà compilé dans `recettes.generated.ts` au moment du
 * build. C'est ce qui permet à l'écran d'une recette de s'ouvrir sans état de chargement, donc
 * sans le scintillement qui trahit une application non native.
 *
 * Elles restent compatibles avec un `await` côté serveur : `await` sur une valeur simple la rend
 * telle quelle, et les pages du site n'ont pas eu à changer de forme.
 */

import { RECETTES } from './recettes.generated';
import type { Recipe } from './types';

export type { Block, Recipe, RecipeMeta } from './types';
export { dureeISO, dureeTotale } from './types';
export { RECETTES };

const PAR_SLUG = new Map(RECETTES.map((r) => [r.slug, r]));

export function getRecipe(slug: string): Recipe | null {
  return PAR_SLUG.get(slug) ?? null;
}

/** Toutes les recettes, de la plus récente à la plus ancienne. */
export function getAllRecipes(): Recipe[] {
  return RECETTES;
}

export function getRecipeSlugs(): string[] {
  return RECETTES.map((r) => r.slug);
}
