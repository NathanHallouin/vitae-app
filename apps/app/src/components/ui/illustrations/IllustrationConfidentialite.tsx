import { Circle, Rect } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/**
 * La confidentialité : tout ce qui est calculé reste dans l'appareil.
 *
 * L'image ne montre ni cadenas ni bouclier, et c'est délibéré. Ces deux symboles disent
 * « protégé contre l'extérieur », donc supposent que quelque chose part et qu'on le défend. Ici
 * rien ne part : il n'y a ni compte, ni serveur, ni requête. Le dessin montre donc l'appareil, la
 * flamme du métabolisme dedans, et un cercle fermé autour — une limite, pas une serrure.
 *
 * Le cercle est en pointillés : c'est une frontière, pas un mur, et l'application n'a rien à
 * verrouiller puisqu'elle n'a rien collecté.
 */
export default function IllustrationConfidentialite() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 320 208"
      label="Un appareil contenant une flamme, entouré d’un cercle fermé"
    >
      <Circle
        cx={160}
        cy={104}
        r={86}
        fill="none"
        strokeWidth={2.5}
        stroke={palette.borderStrong}
        strokeDasharray="7 9"
        strokeLinecap="round"
      />

      <Rect
        x={116}
        y={34}
        width={88}
        height={140}
        rx={14}
        fill={palette.surface2}
        strokeWidth={3}
        stroke={palette.primaryInk}
      />
      {/* Le haut-parleur : deux traits suffisent à faire lire un téléphone plutôt qu'une carte. */}
      <Rect x={148} y={48} width={24} height={4} rx={2} fill={palette.borderStrong} />

      <Glyphe
        nom="flamme"
        x={128}
        y={78}
        taille={64}
        couleur={palette.primaryInk}
        epaisseur={1.7}
      />
    </Illustration>
  );
}
