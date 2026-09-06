import { RADII } from '@vitae/core/tokens';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { MOTION, useMotionReduite } from '@/theme/motion';
import { usePalette } from '@/theme/palette';

/**
 * L'arc gradué qui entoure la réponse d'un écran.
 *
 * C'est le nouvel élément signature. Il ne décore pas : **l'arc dit toujours une part d'un tout**,
 * et cette règle ne souffre pas d'exception, sinon l'objet ne veut plus rien dire d'un écran à
 * l'autre. Sur Métabolisme, la part du métabolisme de base dans la dépense ; sur Alimentation, ce
 * qu'on mange rapporté à ce qu'on dépense ; sur Poids, le chemin fait depuis le poids de départ ;
 * sur Entraînement, la place des séances dans la semaine. Une valeur qui n'est la part de rien
 * n'a pas de cadran — elle a un chiffre, et c'est très bien.
 *
 * Pourquoi un cercle plutôt qu'une barre : la réponse d'un écran et sa décomposition étaient deux
 * objets séparés, l'un en haut, l'autre plus bas, et rien ne disait qu'ils parlaient du même
 * total. Le cadran les réunit — on lit la proportion avant même d'avoir lu le nombre.
 *
 * Tracé en `react-native-svg`, déjà présent pour la projection : pas de dépendance ajoutée, et le
 * même rendu sur les trois plateformes. Aucun test de plateforme ici, et il n'y en aura pas :
 * `Svg` se rend en `<svg>` sur le web, ce qui est exactement ce qu'on veut dans le HTML livré.
 *
 * Une seule par écran, comme le `Hero` qu'il remplace. Deux cadrans annuleraient ce qu'ils servent
 * à établir : lequel est la réponse, lequel est le détail.
 */
/** La taille du cadran. Deux appelants, aucun ne la redéfinit : elle vaut donc pour la géométrie. */
export const TAILLE_CADRAN = 230;

/**
 * Largeur sûre pour du texte posé **hors de l'axe horizontal** du cadran — un surtitre au-dessus
 * du grand chiffre, typiquement.
 *
 * Le centre était borné au **diamètre** intérieur moins une marge, soit 170 px. C'est juste pour
 * le chiffre, qui est sur l'axe : là, les 186 px du diamètre sont disponibles. Ça ne l'est pas
 * pour ce qui est plus haut, parce que l'intérieur est un disque et non un carré — à 55 px du
 * centre il ne reste que 150 px de corde. « Votre repère quotidien » tenait sur une ligne dans les
 * 170 autorisés, donc ne passait pas à la ligne, donc touchait l'arc des deux côtés.
 *
 * Le plus grand carré inscrit règle le cas quelle que soit la hauteur et quelle que soit la
 * longueur du libellé : `diamètre / √2`, soit 131 px ici. Un surtitre qui n'y tient pas passe à la
 * ligne — ce que « Dépense sur une journée » fait déjà, et c'est la seule raison pour laquelle le
 * défaut ne se voyait pas sur l'écran du métabolisme.
 */
export const LARGEUR_HORS_AXE = Math.floor((TAILLE_CADRAN - RADII.gauge * 2) / Math.SQRT2);

export default function Cadran({
  /** la part, entre 0 et 1 ; au-delà, elle est bornée — un arc de plus d'un tour ne dit rien */
  part,
  /** diamètre extérieur, en points */
  taille = TAILLE_CADRAN,
  couleur,
  children,
  accessibilityLabel,
}: {
  part: number;
  taille?: number;
  /** par défaut `primary` ; les macros passent la leur */
  couleur?: string;
  /** le contenu du centre : surtitre, chiffre, unité */
  children: React.ReactNode;
  /** ce que le lecteur d'écran annonce : l'arc seul ne dit rien */
  accessibilityLabel: string;
}) {
  const palette = usePalette();
  const avancement = useArc(part);

  const epaisseur = RADII.gauge;
  const rayon = (taille - epaisseur) / 2;
  const perimetre = 2 * Math.PI * rayon;

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ width: taille, height: taille, alignItems: 'center', justifyContent: 'center' }}
    >
      {/* `position: absolute` plutôt qu'un enfant du SVG : react-native-svg ne prend pas de vues
          React Native dans son arbre, et le texte doit rester du vrai texte — sélectionnable sur
          le web, lisible par les lecteurs d'écran, et rendu par la même police que le reste. */}
      <Svg width={taille} height={taille} style={{ position: 'absolute' }}>
        <Circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          stroke={palette.gaugeTrack}
          strokeWidth={epaisseur}
          fill="none"
        />
        <Circle
          cx={taille / 2}
          cy={taille / 2}
          r={rayon}
          stroke={couleur ?? palette.primary}
          strokeWidth={epaisseur}
          fill="none"
          strokeLinecap="butt"
          strokeDasharray={`${perimetre} ${perimetre}`}
          strokeDashoffset={perimetre * (1 - avancement)}
          // L'arc part du haut : un cadran qui commence à trois heures se lit comme une horloge
          // arrêtée. La rotation est posée sur le tracé et non sur la vue, pour ne pas emporter le
          // texte du centre avec elle.
          transform={`rotate(-90 ${taille / 2} ${taille / 2})`}
        />
      </Svg>
      {/* Le centre est borné au diamètre intérieur, moins une marge : sans cette largeur, un
          surtitre un peu long — « Dépense sur une journée » — sortait du cercle et se faisait
          couper par le bord de la vue. Borné, il passe à la ligne, ce qui est le seul
          comportement qui tienne quelle que soit la longueur du libellé. */}
      <View style={{ alignItems: 'center', width: taille - epaisseur * 2 - 16 }}>{children}</View>
    </View>
  );
}

/**
 * Fait courir l'arc jusqu'à sa nouvelle part.
 *
 * Même boucle et même durée que le compteur de `Chiffre`, à dessein : l'arc et le nombre disent la
 * même chose, et deux durées différentes pour un seul recalcul donneraient deux informations qui
 * se contredisent. Les deux hooks restent séparés parce qu'ils n'animent pas la même grandeur — un
 * hook générique prendrait un formateur en paramètre pour économiser dix lignes, et rendrait les
 * deux plus difficiles à lire.
 *
 * Trois cas court-circuitent l'animation : le premier affichage — un arc qui part de zéro au
 * montage donnerait un écran de chargement là où il n'y a rien à charger —, une part inchangée, et
 * le réglage « moins de mouvement », qui supprime le mouvement au lieu de le ralentir.
 */
function useArc(part: number): number {
  const cible = Math.max(0, Math.min(1, part));
  const reduite = useMotionReduite();

  const [courant, setCourant] = useState(cible);
  const precedent = useRef(cible);
  const premier = useRef(true);

  useEffect(() => {
    if (reduite || premier.current) {
      premier.current = false;
      precedent.current = cible;
      setCourant(cible);
      return;
    }

    const depart = precedent.current;
    const ecart = cible - depart;
    if (ecart === 0) return;

    const debut = performance.now();
    let image = 0;

    const avancer = (maintenant: number) => {
      const t = Math.min(1, (maintenant - debut) / MOTION.compteur);
      // Décélération : l'arc part vite et se pose, comme le nombre qu'il entoure.
      const adouci = 1 - (1 - t) ** 3;
      setCourant(depart + ecart * adouci);
      if (t < 1) image = requestAnimationFrame(avancer);
      else precedent.current = cible;
    };

    image = requestAnimationFrame(avancer);
    return () => cancelAnimationFrame(image);
  }, [cible, reduite]);

  return courant;
}
