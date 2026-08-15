/**
 * Ce que l'application sait d'une photo de recette, sans jamais toucher un fichier.
 *
 * Comme les recettes, les photos sont préparées avant le build : ce module ne lit rien, il expose
 * ce que `tools/build-photos.ts` a écrit. Une fiche s'ouvre donc sans requête ni analyse, et
 * l'absence de photo se sait immédiatement — c'est ce qui permet à l'écran de retomber sur son
 * illustration sans passer par un état de chargement.
 */

import { LARGEURS_PHOTO, PHOTOS, RAPPORT_PHOTO } from './photos.generated';

export interface PhotoRecette {
  slug: string;
  /** largeur de la plus grande variante produite */
  largeur: number;
  hauteur: number;
  /** aperçu flou de seize pixels, en base64, à afficher pendant le chargement */
  apercu: string;
}

export { LARGEURS_PHOTO, RAPPORT_PHOTO };

/** `null` quand la recette n'a pas encore de photo — un cas normal, pas une erreur. */
export function photoDe(slug: string): PhotoRecette | null {
  return PHOTOS[slug] ?? null;
}

export function nombreDePhotos(): number {
  return Object.keys(PHOTOS).length;
}

/**
 * L'adresse d'une variante.
 *
 * Le nom porte la largeur plutôt qu'une empreinte : les photos sont remplacées à la main, pas
 * engendrées depuis une source versionnée, et une empreinte obligerait à retrouver le nom exact
 * après chaque retouche. Le service worker ne les précache pas pour cette raison.
 */
export function adressePhoto(slug: string, largeur: number, format: 'avif' | 'webp'): string {
  return `/photos/${slug}-${largeur}.${format}`;
}

/**
 * Le `srcset` d'un format, pour le web.
 *
 * Les largeurs proposées sont bornées à celle de la photo d'origine : annoncer une variante qui
 * n'a pas été produite ferait télécharger une 404 au navigateur, qui n'a aucun moyen de le savoir
 * avant d'essayer.
 */
export function srcset(photo: PhotoRecette, format: 'avif' | 'webp'): string {
  return LARGEURS_PHOTO.filter((l) => l <= photo.largeur || l === LARGEURS_PHOTO[0])
    .map((l) => `${adressePhoto(photo.slug, l, format)} ${l}w`)
    .join(', ');
}
