import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Cadran, { LARGEUR_HORS_AXE } from './Cadran';
import Chiffre from './Chiffre';
import Overline from './Overline';

/**
 * La surface qui porte la réponse d'un écran.
 *
 * C'est l'élément le plus reconnaissable de l'application. Il était un dégradé plein occupant
 * toute la largeur ; il est désormais un cadran : un arc gradué, le grand chiffre en son centre,
 * et une phrase en dessous qui dit ce que l'arc mesure.
 *
 * Ce que le changement gagne, et pourquoi il valait la peine : le rectangle coloré affirmait
 * l'importance du nombre par la couleur, sans rien en dire de plus. L'arc, lui, porte une
 * information que l'écran devait auparavant répéter plus bas — la part du total. On lit la
 * proportion avant le chiffre, et la décomposition qui suit ne fait que la détailler.
 *
 * Une par écran, jamais deux. La raison n'a pas changé : sur un écran qui empile huit cartes,
 * c'est elle qui dit laquelle est la réponse et laquelle est le détail. Deux cadrans annuleraient
 * exactement ce qu'ils servent à établir.
 *
 * `part` est obligatoire, et c'est volontaire. Un écran dont la réponse n'est la part de rien ne
 * doit pas prendre un cadran par commodité : il affiche un `Chiffre` en taille `hero`, sans arc.
 * Rendre `part` facultatif rouvrirait la porte au cadran décoratif.
 *
 * Ce qui a disparu avec le dégradé : `expo-linear-gradient`, retiré du manifeste. Ce commentaire a
 * d'abord dit qu'il restait une dépendance parce que « la projection de poids s'en sert » — c'était
 * faux, plus rien ne l'importait. Un commentaire qui affirme n'est vérifié par personne, et celui-ci
 * a survécu à ce qu'il décrivait ; c'est le défaut du registre narratif, et la seule parade est de
 * relire les commentaires quand le code change dessous.
 */
export default function Hero({
  surtitre,
  valeur,
  unite,
  part,
  legende,
  children,
  anime = true,
}: {
  surtitre: string;
  valeur: number | string;
  unite?: string;
  /** la part que l'arc représente, entre 0 et 1 */
  part: number;
  /** ce que l'arc mesure, en toutes lettres : sans cette phrase, l'arc est un ornement */
  legende: string;
  /** la phrase qui dit ce que le chiffre signifie */
  children: ReactNode;
  anime?: boolean;
}) {
  const palette = usePalette();
  const pourcent = Math.round(Math.max(0, Math.min(1, part)) * 100);

  return (
    <View className="items-center px-2 pt-1 pb-2">
      <Cadran
        part={part}
        accessibilityLabel={`${surtitre} : ${valeur}${unite ? ` ${unite}` : ''}. ${legende} : ${pourcent} %.`}
      >
        {/* Borné au carré inscrit : le surtitre est au-dessus du centre, là où le disque est
            plus étroit que son diamètre. Voir `LARGEUR_HORS_AXE`. */}
        <View style={{ width: LARGEUR_HORS_AXE }}>
          <Overline className="text-center">{surtitre}</Overline>
        </View>
        <View className="mt-1">
          <Chiffre valeur={valeur} taille="hero" anime={anime} />
        </View>
        {unite ? (
          <Text style={{ color: palette.muted }} className="font-sans text-base">
            {unite}
          </Text>
        ) : null}
      </Cadran>

      {/* La légende de l'arc, séparée de la phrase d'explication : elle dit ce que l'anneau
          mesure, l'autre dit ce que le nombre signifie. Les fondre en une seule phrase avait été
          essayé — on obtient une phrase qui explique un dessin, ce qui est le signe que le dessin
          ne va pas. */}
      <Text
        style={{ color: palette.muted }}
        className="font-sans mt-[18px] text-center text-body leading-[23px]"
      >
        {legende} :{' '}
        {/* Espace insécable avant le signe : la typographie française le demande, et sans lui le
            pourcentage se retrouve seul sur la ligne suivante dès que la légende est un peu
            longue. U+00A0 et non l'espace fine U+202F, que les polices du projet ne dessinent
            pas — c'est le même arbitrage que `kcal()` dans `format.ts`. */}
        <Text className="font-sans-bold text-ink">{pourcent} %</Text>
      </Text>

      <Text
        style={{ color: palette.muted }}
        className="font-sans mt-2 text-center text-body leading-[23px]"
      >
        {children}
      </Text>
    </View>
  );
}
