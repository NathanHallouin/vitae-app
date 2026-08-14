/**
 * La forme d'une recette, et les deux calculs de durée qui l'accompagnent.
 *
 * Ce module ne lit aucun fichier et n'importe rien : il est chargé par les trois plateformes, où
 * `node:fs` et `gray-matter` n'existent pas.
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
  /**
   * À quel moment de la journée le plat se prête, et son ingrédient dominant.
   *
   * Ces deux champs ne servent pas à la page de la recette : ils la font entrer dans les
   * suggestions de l'écran « Ce que je mange », qui range les propositions par repas et évite de
   * servir deux fois le même ingrédient dans la journée. Les valeurs admises sont celles de
   * `@vitae/core/recipes` — `Slot` et `Base` —, et le script de compilation les vérifie.
   */
  moment: 'matin' | 'plat';
  base: string;
  /** date ISO de publication, pour le sitemap et le JSON-LD */
  publiee: string;
  /** correspond aux filtres de `@vitae/core/recipes` : viande, poisson, porc, oeufs, laitier */
  contient: string[];
}

/**
 * Un morceau de prose, hors étapes.
 *
 * Des blocs typés plutôt que du HTML : l'application n'a pas de moteur de rendu HTML et n'en aura
 * pas, le site étant lui-même produit par `react-native-web`. Le vocabulaire des recettes se limite
 * aux paragraphes et aux titres de niveau deux — on s'arrête là plutôt que d'écrire un
 * convertisseur Markdown complet dont personne n'a besoin.
 */
export interface Block {
  type: 'p' | 'h2';
  text: string;
}

export interface Recipe extends RecipeMeta {
  /** étapes extraites du Markdown, pour `recipeInstructions` et pour l'affichage pas à pas */
  etapes: string[];
  /** ce qui précède la liste numérotée */
  introBlocks: Block[];
  /** ce qui la suit */
  suiteBlocks: Block[];
}

/** Total en minutes, pour l'affichage et la durée ISO 8601 du JSON-LD. */
export function dureeTotale(r: RecipeMeta): number {
  return r.preparation + r.cuisson;
}

export function dureeISO(minutes: number): string {
  return `PT${minutes}M`;
}
