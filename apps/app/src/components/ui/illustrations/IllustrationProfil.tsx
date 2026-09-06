import { Circle, Rect } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/** Les quatre réponses, empilées comme les étapes du questionnaire guidé. */
const REPONSES = [0, 1, 2, 3];

/**
 * L'écran du profil : une silhouette, et les quatre réponses qui la décrivent.
 *
 * L'écran demande des informations intimes — sexe, date de naissance, poids. L'image le dit sans
 * en rajouter : une silhouette anonyme, quatre traits, rien qui ressemble à un visage ni à un
 * corps jugé. C'est aussi pour cela que le glyphe employé s'appelle `silhouette` et non
 * `personne`.
 *
 * Les quatre traits se remplissent de gauche à droite, comme les points de l'état vide des
 * résultats : le même geste raconté deux fois, avec le même vocabulaire.
 */
export default function IllustrationProfil() {
  const palette = usePalette();

  return (
    <Illustration viewBox="0 0 320 208" label="Une silhouette accompagnée de quatre réponses">
      <Circle cx={126} cy={104} r={62} fill={palette.surface2} />
      <Glyphe
        nom="silhouette"
        x={78}
        y={56}
        taille={96}
        couleur={palette.primaryInk}
        epaisseur={1.7}
      />

      {REPONSES.map((i) => (
        <Rect
          key={i}
          x={210}
          y={62 + i * 24}
          width={i < REPONSES.length - 1 ? 74 : 44}
          height={10}
          rx={5}
          fill={i < REPONSES.length - 1 ? palette.primary : palette.gaugeTrack}
        />
      ))}
    </Illustration>
  );
}
