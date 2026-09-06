import { Path } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/**
 * L'état vide du catalogue : l'entonnoir des filtres, et rien qui tombe.
 *
 * Le texte voisin dit quoi faire — retirer un critère —, l'image dit ce qui se passe : les filtres
 * sont si serrés que l'assiette reste vide. Tout est tracé en gris de séparation, y compris
 * l'assiette : un état vide dessiné dans la couleur d'action laisserait croire qu'il y a quelque
 * chose à regarder.
 */
export default function IllustrationAucuneRecette() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 240 140"
      largeurMax={220}
      label="Un entonnoir de filtres au-dessus d’une assiette vide"
    >
      <Path
        d="M76 24h88L131 66v30h-22V66Z"
        fill="none"
        strokeWidth={3}
        stroke={palette.borderStrong}
        strokeLinejoin="round"
      />
      <Glyphe
        nom="assiette"
        x={92}
        y={92}
        taille={56}
        couleur={palette.borderStrong}
        epaisseur={2.4}
      />
    </Illustration>
  );
}
