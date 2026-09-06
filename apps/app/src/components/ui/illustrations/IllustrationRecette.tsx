import { Line } from 'react-native-svg';
import { Glyphe } from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';
import Illustration from './Illustration';

/**
 * L'illustration d'une fiche recette, selon le moment de la journée.
 *
 * Une seule image pour les soixante-deux fiches serait un ornement — vue une fois, elle ne dirait
 * plus rien. Le catalogue ne connaît que deux catégories, « Petit-déjeuner » et « Plat
 * principal » : deux dessins suffisent donc à ce qu'une fiche ressemble à ce qu'elle contient,
 * sans qu'il faille dessiner soixante-deux fois.
 *
 * Même construction que l'index — le plat posé sur un plan de travail, un accent en retrait
 * derrière — et **pas de disque** : agrandi dans un cercle, le glyphe de l'assiette se lit comme
 * un visage, les volutes de vapeur en guise d'yeux. La règle vaut pour toute la famille.
 */
export default function IllustrationRecette({ categorie }: { categorie: string }) {
  const palette = usePalette();
  const matin = categorie.toLowerCase().startsWith('petit');

  return (
    <Illustration
      viewBox="0 0 220 150"
      largeurMax={200}
      label={matin ? 'Un plat fumant devant un soleil levant' : 'Un plat fumant et un épi de blé'}
    >
      {/* L'accent passe derrière : c'est le plat qui est le sujet, pas la garniture. */}
      {matin ? (
        <Glyphe
          nom="soleil"
          x={132}
          y={22}
          taille={58}
          couleur={palette.borderStrong}
          epaisseur={2}
        />
      ) : (
        <Glyphe
          nom="ble"
          x={152}
          y={80}
          taille={40}
          couleur={palette.borderStrong}
          epaisseur={2.2}
        />
      )}

      <Line x1={20} y1={118} x2={200} y2={118} strokeWidth={2.5} stroke={palette.borderStrong} />

      <Glyphe
        nom="assiette"
        x={64}
        y={43}
        taille={92}
        couleur={palette.primaryInk}
        epaisseur={1.7}
      />
    </Illustration>
  );
}
