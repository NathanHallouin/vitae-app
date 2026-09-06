import type { SeoProps } from './SeoProps';

/**
 * Les balises de tête d'une route — la version native, qui ne rend rien.
 *
 * Ce n'est pas un oubli : `Head` d'expo-router sert en natif à tout autre chose (Handoff, recherche
 * système), et l'alimenter avec un titre de page, une canonique et du JSON-LD n'aurait aucun sens.
 * Une application native n'a ni URL à canoniser, ni robot à renseigner.
 *
 * Le composant existe quand même, et il accepte les mêmes propriétés que la version web : c'est ce
 * qui permet aux écrans d'appeler `<Seo …/>` sans savoir où ils tournent. Metro choisit
 * `Seo.web.tsx` sur le web et ce fichier ailleurs.
 */
export default function Seo(_props: SeoProps) {
  return null;
}
