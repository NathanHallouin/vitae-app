/**
 * Illustration d'accueil : une jauge d'énergie, la flamme du métabolisme au centre, et le rythme
 * de la dépense sur la journée en dessous. Purement graphique : aucun texte, donc rien à traduire
 * ni à faire grossir avec la largeur d'affichage.
 *
 * La jauge est tracée en deux temps : la piste complète, puis la portion remplie par-dessus. Sans
 * la piste entière, la partie non remplie se lit comme un trait resté là par erreur.
 */

import { View } from 'react-native';
import { Circle, G, Path, Rect, Svg } from 'react-native-svg';
import { usePalette } from '@/theme/palette';

/** Rythme de la dépense sur la journée : creux la nuit, pic en milieu de journée. */
const RYTHME = [10, 16, 26, 21, 36, 30, 20, 14, 9].map((hauteur, i) => ({
  hauteur,
  // Les barres tiennent dans l'ouverture de la jauge, entre ses deux extrémités.
  x: 92 + i * 15.9,
}));

const PIC = 36;
const BASELINE = 196;
const BAR_W = 9;

export default function HomeIllustration() {
  const palette = usePalette();

  return (
    <View className="w-full self-center" style={{ maxWidth: 400, aspectRatio: 320 / 208 }}>
      <Svg
        viewBox="0 0 320 208"
        width="100%"
        height="100%"
        accessibilityRole="image"
        accessibilityLabel="Une jauge d’énergie surmontée d’une flamme, au-dessus du rythme de la dépense sur une journée"
      >
        {/* Disque : pose la flamme sur un fond, sans bord dur. Teinte chaude plutôt que le bleu
            translucide, qui vire au gris sur le fond crème. */}
        <Circle cx="160" cy="112" r="44" fill={palette.surface2} />

        {/* Jauge : piste complète, puis portion remplie */}
        <Path
          d="M86.7 138.7A78 78 0 1 1 233.3 138.7"
          fill="none"
          strokeWidth="12"
          stroke={palette.divider}
          strokeLinecap="round"
        />
        <Path
          d="M86.7 138.7A78 78 0 0 1 215.2 56.8"
          fill="none"
          strokeWidth="12"
          stroke={palette.primary}
          strokeLinecap="round"
        />
        <Circle
          cx="215.2"
          cy="56.8"
          r="7.5"
          strokeWidth="4"
          fill={palette.surface}
          stroke={palette.primary}
        />

        {/* Flamme : le tracé du jeu d'icônes, agrandi */}
        <G transform="translate(121.6 80) scale(3.2)">
          <Path
            d="M12 3c2.8 3.2 4.8 5.6 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-1.7.8-3 1.8-4 .2 1.3.9 2 1.7 2 1.1 0 1.6-.9 1.6-2.2 0-1.5-.5-2.9-.3-4.4Z"
            fill="none"
            strokeWidth="1.5"
            stroke={palette.primaryInk}
            strokeLinejoin="round"
          />
        </G>

        {/* Rythme de la journée */}
        {RYTHME.map((barre) => (
          <Rect
            key={barre.x}
            x={barre.x}
            y={BASELINE - barre.hauteur}
            width={BAR_W}
            height={barre.hauteur}
            rx={BAR_W / 2}
            fill={palette.primaryInk}
            opacity={0.22 + (barre.hauteur / PIC) * 0.5}
          />
        ))}
      </Svg>
    </View>
  );
}
