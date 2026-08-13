/**
 * La forme d'une recette, et les deux calculs de durée qui l'accompagnent.
 *
 * Ce module ne lit aucun fichier et n'importe rien : il est chargé aussi bien par le site que par
 * l'application native, où `node:fs`, `gray-matter` et `marked` n'existent pas.
 */

export interface RecipeMeta {
  slug: string;
  titre: string;
  /** phrase de résumé : sert de meta description et de chapeau */
  description: string;
  /** minutes */
  preparation: number;
  cuisson: number;
  portions: number;
  /** par portion */
  kcal: number;
  proteines: number;
  ingredients: string[];
  /** repris tel quel dans le JSON-LD : « Plat principal », « Petit-déjeuner »… */
  categorie: string;
  /** date ISO de publication, pour le sitemap et le JSON-LD */
  publiee: string;
  /** correspond aux filtres de `@vitae/core/recipes` : viande, poisson, porc, oeufs, laitier */
  contient: string[];
}

/**
 * Un morceau de prose, hors étapes.
 *
 * Le site rend le HTML produit par `marked` ; l'application native, elle, n'a pas de moteur HTML
 * et ne va pas embarquer une WebView pour deux paragraphes. On publie donc les deux formes : le
 * HTML pour le web, ces blocs pour le natif. La duplication pèse quelques centaines d'octets et
 * évite qu'une des deux plateformes ne rende du balisage brut à l'écran.
 */
export interface Block {
  type: 'p' | 'h2';
  text: string;
}

export interface Recipe extends RecipeMeta {
  /** étapes extraites du Markdown, pour `recipeInstructions` et pour l'affichage pas à pas */
  etapes: string[];
  /** ce qui précède la liste numérotée, en HTML */
  introHtml: string;
  /** ce qui la suit, en HTML */
  suiteHtml: string;
  /** les mêmes textes, en blocs typés, pour le rendu natif */
  introBlocks: Block[];
  suiteBlocks: Block[];
}

/** Total en minutes, pour l'affichage et la durée ISO 8601 du JSON-LD. */
export function dureeTotale(r: RecipeMeta): number {
  return r.preparation + r.cuisson;
}

export function dureeISO(minutes: number): string {
  return `PT${minutes}M`;
}
