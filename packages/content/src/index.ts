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

import { type Ingredient, type Recipe as PlatSuggere, platMaison } from '@vitae/core/recipes';
import { RECETTES } from './recettes.generated';
import type { Recipe } from './types';

export {
  aDesCriteres,
  aplatir,
  type Criteres,
  chercherRecettes,
  DUREES,
  MOMENTS,
  type Moment,
  TRIS,
  type Tri,
} from './recherche';
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

/**
 * Les recettes de l'application, prêtes à être proposées sur l'écran « Ce que je mange ».
 *
 * Sans cela, cet écran ne proposait que des recherches sur des sites extérieurs, alors même que
 * l'application publie ses propres recettes, rédigées, aux valeurs contrôlées et avec leur écran
 * de cuisine. Le même plat pouvait s'y trouver deux fois — une fois en lien de recherche, une fois
 * en recette maison.
 *
 * Le moteur les range devant les propositions extérieures, qui ne comblent plus que ce que ce
 * catalogue ne couvre pas encore.
 */
export function platsMaison(): PlatSuggere[] {
  return RECETTES.map((r) =>
    platMaison({
      slug: r.slug,
      title: r.titre,
      kcal: r.kcal,
      prot: r.proteines,
      slot: r.moment,
      // Le frontmatter est vérifié à la compilation contre les unions du moteur : la conversion
      // ici ne peut pas rencontrer de valeur inconnue.
      base: r.base as PlatSuggere['base'],
      contient: r.contient as Ingredient[],
    }),
  );
}
