/**
 * Réglages du site, en un point unique.
 *
 * L'URL canonique sert aux métadonnées du web, au sitemap, au JSON-LD et aux liens profonds de
 * l'application : la coder à quatre endroits, c'est se garantir qu'un jour les quatre divergent.
 *
 * `EXPO_PUBLIC_` est le préfixe qu'Expo remplace à la compilation, aussi bien dans le paquet natif
 * que dans l'export web.
 */
export const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://metabolisme-de-base.fr';
export const SITE_NAME = 'Métabolisme de base';
