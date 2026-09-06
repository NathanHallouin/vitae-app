/**
 * Ce que `Seo` reçoit, dans les deux versions.
 *
 * Extrait parce que deux fichiers `.tsx` que Metro choisit selon la plateforme finissent par
 * diverger si rien ne les tient ensemble. Ici c'est le type qui les tient : ajouter une balise sur
 * le web sans l'accepter en natif casse la compilation.
 */
export interface SeoProps {
  title: string;
  description: string;
  /** URL absolue de la page */
  canonical: string;
  /**
   * L'image affichée quand le lien est collé dans une conversation.
   *
   * Par défaut la carte de marque ; les recettes passent la leur, avec leur titre et leurs
   * valeurs. Elles sont engendrées par `tools/build-og.ts`, pas dessinées à la main.
   */
  image?: string;
  /** données structurées schema.org, sérialisées telles quelles */
  jsonLd?: Record<string, unknown>;
}
