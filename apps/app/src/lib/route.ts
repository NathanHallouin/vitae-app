import type { Href } from 'expo-router';

/**
 * Une adresse venue du métier, admise par le routeur.
 *
 * `expo-router` typé génère une union littérale de toutes les routes existantes, ce qui est une
 * excellente chose : une faute de frappe dans un `href` écrit à la main casse la compilation. Mais
 * le métier, lui, ne connaît pas le routeur. `@vitae/core/nav` décrit le plan de navigation en
 * chaînes, `@vitae/core/explainers` renvoie vers l'écran suivant, et le moteur de suggestions
 * produit l'adresse d'une recette : trois modules qui doivent rester utilisables sans expo-router.
 *
 * Ce transtypage est le point de passage, et il est unique exprès — un `as Href` éparpillé dans
 * trois écrans se serait multiplié sans qu'on s'en aperçoive.
 *
 * Ce qu'il ne garantit pas, et qu'il faut savoir : si une route disparaît de `app/` alors que
 * `nav.ts` la désigne encore, rien n'échouera à la compilation. Le garde-fou est ailleurs — la
 * disposition des onglets est construite depuis ce même plan, et l'export du site échoue sur un
 * lien mort.
 */
export function versRoute(chemin: string): Href {
  return chemin as Href;
}
