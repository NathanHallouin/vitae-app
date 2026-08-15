/**
 * Les polices, sur le web : déjà déclarées, rien à charger ici.
 *
 * `+html.tsx` pose les `@font-face` dans le document et précharge les deux coupes qui portent la
 * première image de la page. Le navigateur les demande donc pendant qu'il analyse le HTML, en
 * parallèle du paquet JavaScript.
 *
 * Les charger par `expo-font` comme en natif serait strictement pire : la demande n'aurait lieu
 * qu'une fois les 2,7 Mo de JavaScript téléchargés, analysés et exécutés, et le texte s'afficherait
 * d'abord en police système avant de sauter — un défaut que l'œil lit comme de la lenteur alors
 * que tout est déjà là.
 *
 * Rendre `true` sans condition est également ce qui convient au pré-rendu : Node ne charge aucune
 * police, et un arbre qui attendrait produirait un fichier HTML vide.
 */
export function usePolices(): boolean {
  return true;
}
