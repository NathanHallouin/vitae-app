/**
 * Réglages du site, en un point unique.
 *
 * L'URL canonique sert aux métadonnées, au sitemap et au JSON-LD : la coder à trois endroits,
 * c'est se garantir qu'un jour les trois divergent.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://metabolisme-de-base.fr';
export const SITE_NAME = 'Métabolisme de base';
