import { Circle, Line, Path } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/** Les quatre questions du formulaire, dans l'ordre où elles se posent. */
const QUESTIONS = [26, 52, 78, 104];

/**
 * L'état vide des écrans de résultats : quatre questions, puis un chiffre.
 *
 * C'est l'image la plus vue de l'application, et personne ne s'en doute : tant qu'aucun profil
 * n'est enregistré, elle s'affiche sur les quatre écrans de résultats — donc sur ce que voit
 * d'abord tout visiteur du site venu d'un moteur de recherche.
 *
 * Elle dit exactement ce que la carte promet — « quatre questions suffisent » — plutôt que d'être
 * un ornement : quatre points qui se remplissent de gauche à droite, et au bout la flamme du
 * métabolisme dans sa jauge. Le dernier point reste creux, parce que la réponse n'est pas encore
 * donnée.
 */
export default function IllustrationCalcul() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 260 120"
      largeurMax={260}
      label="Quatre questions menant à une jauge surmontée d’une flamme"
    >
      <Line
        x1={QUESTIONS[0]}
        y1={60}
        x2={QUESTIONS[QUESTIONS.length - 1]}
        y2={60}
        strokeWidth={2}
        stroke={palette.borderStrong}
      />
      {QUESTIONS.map((x, i) => {
        const repondu = i < QUESTIONS.length - 1;
        return (
          <Circle
            key={x}
            cx={x}
            cy={60}
            r={7}
            strokeWidth={2.5}
            fill={repondu ? palette.primary : palette.surface}
            stroke={repondu ? palette.primary : palette.gaugeTrack}
          />
        );
      })}

      {/* La jauge de l'accueil, en plus petit : c'est le même objet, donc le même dessin — piste
          entière d'abord, portion remplie par-dessus, sans quoi le vide se lit comme un oubli. */}
      <Circle cx={190} cy={60} r={30} fill={palette.surface2} />
      <Path
        d="M151.9 82A44 44 0 1 1 228.1 82"
        fill="none"
        strokeWidth={9}
        stroke={palette.borderStrong}
        strokeLinecap="round"
      />
      <Path
        d="M151.9 82A44 44 0 0 1 212 21.9"
        fill="none"
        strokeWidth={9}
        stroke={palette.primary}
        strokeLinecap="round"
      />
      <Glyphe
        nom="flamme"
        x={168}
        y={38}
        taille={44}
        couleur={palette.primaryInk}
        epaisseur={1.8}
      />
    </Illustration>
  );
}
