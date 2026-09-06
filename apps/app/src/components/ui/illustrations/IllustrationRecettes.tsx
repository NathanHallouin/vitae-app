import { Line } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/**
 * L'index des recettes : plusieurs plats posés sur un plan de travail.
 *
 * Le sujet a mis trois essais à se trouver, et les deux premiers valent d'être racontés parce
 * qu'ils se reproduiront.
 *
 * D'abord une assiette seule, agrandie dans un disque : elle se lisait comme un **visage**, les
 * deux volutes de vapeur en guise d'yeux et le bord en guise de bouche. Un motif qui marche à
 * vingt pixels dans une barre d'onglets ne marche pas forcément à cent, et c'est le cercle qui
 * déclenchait la lecture.
 *
 * Ensuite la même assiette entourée des trois macronutriments — œuf, goutte, blé. Ils flottaient
 * autour sans s'y rattacher, et le blé minuscule passait pour une plante égarée.
 *
 * Ce qui reste dit ce que la page est : un **catalogue**. Trois plats, deux en retrait dans le gris
 * de séparation, un au premier plan dans la couleur d'action. C'est la profondeur qui fait le
 * nombre, pas une accumulation de symboles.
 */
export default function IllustrationRecettes() {
  const palette = usePalette();

  return (
    <Illustration
      viewBox="0 0 280 200"
      label="Trois plats fumants posés sur un plan de travail, l’un au premier plan"
    >
      {/* En retrait : plus petits, plus haut, et dans la couleur de ce qui n'est pas le sujet. */}
      <Glyphe
        nom="assiette"
        x={26}
        y={62}
        taille={78}
        couleur={palette.borderStrong}
        epaisseur={2.2}
      />
      <Glyphe
        nom="assiette"
        x={176}
        y={62}
        taille={78}
        couleur={palette.borderStrong}
        epaisseur={2.2}
      />

      {/* Le plan de travail passe derrière le plat du premier plan, qui vient s'y poser. */}
      <Line x1={40} y1={140} x2={240} y2={140} strokeWidth={2.5} stroke={palette.borderStrong} />

      <Glyphe
        nom="assiette"
        x={82}
        y={44}
        taille={116}
        couleur={palette.primaryInk}
        epaisseur={1.7}
      />
    </Illustration>
  );
}
