/* Engendré par tools/build-photos.ts — ne pas modifier à la main. */

import type { PhotoRecette } from './photos';

/** Les largeurs disponibles, dans l'ordre où le `srcset` les propose. */
export const LARGEURS_PHOTO = [400,800,1600] as const;

/** Le rapport de cadrage imposé à toutes les photos. */
export const RAPPORT_PHOTO = 1.500000;

export const PHOTOS: Record<string, PhotoRecette> = {};
