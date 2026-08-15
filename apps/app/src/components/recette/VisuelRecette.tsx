import { photoDe } from '@vitae/content';
import Photo from '@/components/recette/Photo';
import IllustrationRecette from '@/components/ui/illustrations/IllustrationRecette';
import { PHOTOS_AFFICHABLES } from '@/lib/photos';

/**
 * Le visuel d'une recette : sa photo si elle en a une, son illustration sinon.
 *
 * Le choix est fait **ici et nulle part ailleurs**. Un écran qui déciderait lui-même finirait par
 * décider autrement qu'un autre : le catalogue montrerait une photo là où la fiche montre un
 * dessin, ou l'inverse, et personne ne saurait dire lequel a raison.
 *
 * Deux conditions, et l'ordre compte. La plateforme d'abord — en natif aucune photo n'est
 * embarquée —, l'existence du fichier ensuite.
 *
 * `repli` dit quoi faire quand il n'y a pas de photo, et la réponse n'est pas la même partout.
 * Sur une fiche, l'illustration est une réponse complète : elle dit le moment de la journée, elle
 * a été dessinée pour ça. Dans le catalogue, soixante-deux cartes afficheraient **soixante-deux
 * fois le même dessin** — la répétition en ferait du bruit, et ferait passer pour un gabarit vide
 * ce qui est une illustration. Une carte sans photo n'y montre donc rien, et reste la carte de
 * texte qu'elle est aujourd'hui.
 *
 * C'est aussi ce qui permet d'ajouter les photos par sept : le catalogue se remplit peu à peu sans
 * jamais passer par un état où il aurait l'air cassé.
 */
export default function VisuelRecette({
  slug,
  titre,
  categorie,
  sizes,
  prioritaire,
  repli = true,
}: {
  slug: string;
  titre: string;
  categorie: string;
  sizes: string;
  prioritaire?: boolean;
  /** afficher l'illustration à défaut de photo ; faux dans une liste, où elle se répéterait */
  repli?: boolean;
}) {
  const photo = PHOTOS_AFFICHABLES ? photoDe(slug) : null;

  if (!photo) return repli ? <IllustrationRecette categorie={categorie} /> : null;

  // Le titre de la recette fait un meilleur texte de remplacement que « photo du plat » : il dit
  // ce qu'il y a dans l'assiette, ce qu'une description générique ne fera jamais.
  return <Photo photo={photo} alt={titre} sizes={sizes} prioritaire={prioritaire} />;
}
