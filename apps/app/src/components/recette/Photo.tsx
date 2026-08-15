import type { PhotoRecette } from '@vitae/content';

/**
 * En natif, aucune photo n'est embarquée : voir `src/lib/photos.ts` pour la raison et pour ce
 * qu'il faudrait faire.
 *
 * Le composant existe quand même, avec la même signature, pour que les écrans n'aient pas à
 * connaître la plateforme. C'est `VisuelRecette` qui choisit, une fois pour toutes, entre la photo
 * et l'illustration — et sur mobile il ne demande jamais celle-ci.
 */
export default function Photo(_: {
  photo: PhotoRecette;
  alt: string;
  sizes: string;
  prioritaire?: boolean;
}) {
  return null;
}
