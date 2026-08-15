import { adressePhoto, type PhotoRecette, RAPPORT_PHOTO, srcset } from '@vitae/content';
import { useColorMode } from '@/theme/ColorMode';
import { usePalette } from '@/theme/palette';

/**
 * Une photo de recette, sur le web.
 *
 * Un vrai `<img>`, et pas l'`Image` de react-native-web — c'est tout le sujet. `Image` rend un
 * `<div>` avec une image de fond : ni `srcset`, ni `sizes`, ni chargement différé, ni format
 * alternatif. Le navigateur téléchargerait donc la même image pour une vignette de 300 px et pour
 * un écran dense, en un seul format. Ce fichier n'étant compilé que pour le web, il peut employer
 * les balises du document directement, comme le fait déjà `+html.tsx`.
 *
 * Ce qui fait qu'une photo s'intègre au lieu de trouer la page :
 *
 * — **La place est réservée avant l'arrivée.** `width` et `height` donnent le rapport au
 *   navigateur, qui garde la hauteur libre ; sans eux, le texte saute vers le bas quand la photo
 *   arrive. C'est le défaut que ce dépôt évite partout ailleurs.
 * — **L'aperçu flou tient la place**, posé en fond du `<img>` lui-même : seize pixels agrandis, le
 *   temps que la vraie photo arrive. Il est déjà dans le paquet, il ne coûte aucune requête.
 * — **La bordure et le rayon sont ceux des cartes**, et il n'y a pas d'ombre. Une photo posée sans
 *   bord se lit comme un trou dans la page ; avec l'ombre qu'on ajoute d'ordinaire, elle jurerait
 *   avec un système visuel qui n'en emploie nulle part.
 * — **Un voile en thème sombre.** Une photo de cuisine est claire et saturée ; à côté de surfaces
 *   à 8 % de luminosité, elle éblouit. Le voile la ramène au niveau de la page sans la ternir.
 */
export default function Photo({
  photo,
  alt,
  sizes,
  prioritaire = false,
}: {
  photo: PhotoRecette;
  /** ce que la photo montre ; jamais « photo de la recette », qui n'apprend rien */
  alt: string;
  /** la largeur d'affichage annoncée au navigateur, en syntaxe `sizes` */
  sizes: string;
  /** la photo de la fiche est visible d'emblée : la charger tard la ferait arriver après le texte */
  prioritaire?: boolean;
}) {
  const palette = usePalette();
  const sombre = useColorMode().mode === 'dark';

  return (
    <picture>
      <source type="image/avif" srcSet={srcset(photo, 'avif')} sizes={sizes} />
      <img
        src={adressePhoto(photo.slug, 800, 'webp')}
        srcSet={srcset(photo, 'webp')}
        sizes={sizes}
        alt={alt}
        width={photo.largeur}
        height={photo.hauteur}
        loading={prioritaire ? 'eager' : 'lazy'}
        // `async` plutôt que `sync` : le décodage d'une image ne doit jamais retenir la peinture
        // du texte qui l'entoure.
        decoding="async"
        fetchPriority={prioritaire ? 'high' : 'auto'}
        style={{
          display: 'block',
          width: '100%',
          height: 'auto',
          aspectRatio: String(RAPPORT_PHOTO),
          objectFit: 'cover',
          borderRadius: 16,
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: palette.divider,
          backgroundColor: palette.surface2,
          backgroundImage: `url(${photo.apercu})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: sombre ? 'brightness(0.86) saturate(0.92)' : 'none',
        }}
      />
    </picture>
  );
}
