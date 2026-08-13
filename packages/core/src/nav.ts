/**
 * Le plan de navigation, partagé par les onglets du haut (à partir de `sm`) et la barre du bas
 * (sur mobile). Un seul tableau : les deux barres ne peuvent pas diverger.
 *
 * Deux libellés par destination. Le long est une question que l'utilisateur se pose et sert sur
 * grand écran ; le court tient dans un cinquième de la largeur d'un téléphone, où le libellé n'a
 * de toute façon qu'à confirmer l'icône.
 */

import type { IconName } from './icons';

/**
 * Largeur à partir de laquelle les quatre onglets du haut tiennent sans déborder. Mesurée, pas
 * devinée : à 600 px, « Mon poids » est déjà coupé et « Bouger » sort de l'écran.
 *
 * Ce seuil ne coïncide avec aucun palier MUI, et c'est normal : il dépend de la longueur des
 * libellés français, pas d'une taille d'appareil. Les deux barres s'y réfèrent, ce qui garantit
 * qu'il y en a toujours exactement une à l'écran.
 */
export const NAV_BREAKPOINT = 700;

/** À partir du seuil : onglets du haut. Sous le seuil, c'est la barre du bas qui prend le relais. */
export const FROM_NAV = `@media (min-width: ${NAV_BREAKPOINT}px)`;

export interface NavPage {
  href: string;
  label: string;
  /** libellé de la barre basse : un mot, jamais tronqué */
  short: string;
  icon: IconName;
}

/** Une page par question que l'utilisateur se pose. */
export const RESULT_PAGES: NavPage[] = [
  { href: '/metabolisme', label: 'Mon métabolisme', short: 'Métabolisme', icon: 'flamme' },
  { href: '/alimentation', label: 'Ce que je mange', short: 'Manger', icon: 'assiette' },
  { href: '/poids', label: 'Mon poids', short: 'Poids', icon: 'balance' },
  { href: '/bouger', label: 'Bouger', short: 'Bouger', icon: 'course' },
];

/**
 * Ce que la barre du bas affiche. Le profil y figure alors qu'il n'est pas une page de résultats :
 * sur mobile, il vaut mieux une seule barre qui contient tout qu'un bouton isolé dans l'en-tête,
 * hors de portée du pouce.
 */
export const MOBILE_PAGES: NavPage[] = [
  ...RESULT_PAGES,
  { href: '/profil', label: 'Mon profil', short: 'Profil', icon: 'silhouette' },
];
