import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Svg } from 'react-native-svg';

/**
 * Le cadre commun des illustrations géométriques.
 *
 * Deux familles d'images cohabitent dans cette application, et elles ne servent pas à la même
 * chose. Les **Open Doodles** de `../doodles/` sont des personnages dessinés à la main : ils
 * donnent un ton, et coûtent vingt-cinq kilo-octets de tracés chacun. Celles-ci sont
 * **géométriques**, écrites avec les primitives de `react-native-svg` et les jetons du thème :
 * elles disent quelque chose de précis sur l'écran qui les porte, pèsent quelques centaines
 * d'octets, et suivent le clair et le sombre sans qu'on ait à les redessiner.
 *
 * Trois règles tiennent la famille ensemble, et s'en écarter se voit tout de suite :
 *
 * — **Aucun texte.** Rien à traduire, rien qui grossisse mal, rien qui double le titre voisin.
 * — **Les mêmes jetons pour les mêmes rôles** : `borderStrong` pour ce qui est inerte, `primary`
 *   pour ce qui est rempli ou acquis, `primaryInk` pour le trait qui porte le sens, `surface2`
 *   pour le fond doux qui pose le motif, `surface` pour détourer.
 *
 *   Ce rôle revenait à `divider`, et c'était une erreur mesurable : `divider` contraste à 1,07:1
 *   avec le fond en clair. Un filet de séparation doit se voir à peine sur douze pixels ; un
 *   dessin de trois cents pixels tracé dans la même couleur ne se voit pas du tout. À l'écran, le
 *   bol de l'en-tête des recettes et le chemin de la page introuvable étaient des fantômes.
 *   `borderStrong` tient 1,90:1 en clair et 2,03:1 en sombre — le seul jeton de la palette qui
 *   reste symétrique entre les deux thèmes, ce qui évite d'avoir à redessiner par thème. C'est le
 *   même raisonnement qui a fait naître `gaugeTrack` : deux rôles opposés ne tiennent pas dans une
 *   seule couleur.
 * — **Un libellé accessible qui décrit l'image, pas l'écran.** Un lecteur d'écran qui annonce
 *   « illustration » n'apprend rien ; il doit entendre ce qu'il y a à voir.
 *
 * Le rapport de forme est déduit du `viewBox` : le donner deux fois, c'est se garantir qu'un jour
 * les deux divergeront et que le dessin se retrouvera étiré.
 */
export default function Illustration({
  viewBox,
  label,
  largeurMax = 400,
  children,
}: {
  /** « 0 0 largeur hauteur » */
  viewBox: string;
  /** ce qu'il y a à voir, pour qui ne voit pas */
  label: string;
  largeurMax?: number;
  children: ReactNode;
}) {
  const [, , largeur, hauteur] = viewBox.split(' ').map(Number);

  return (
    <View
      className="w-full self-center"
      style={{ maxWidth: largeurMax, aspectRatio: largeur / hauteur }}
    >
      <Svg
        viewBox={viewBox}
        width="100%"
        height="100%"
        accessibilityRole="image"
        accessibilityLabel={label}
      >
        {children}
      </Svg>
    </View>
  );
}
