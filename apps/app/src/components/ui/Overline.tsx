import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { cx } from './primitives';
import Titre from './Titre';

/**
 * Surtitre 11 px majuscules, gris `muted2`, utilisé en tête de chaque carte et au centre du cadran.
 *
 * Deux réglages ont changé avec la refonte, et pour la même raison : la Space Grotesk a un œil
 * plus large et des majuscules plus étroites que l'Inter. L'interlettrage passe de 1,1 à 1,6 px —
 * en dessous, les majuscules se collent — et la graisse de 600 à 500, la seule coupe intermédiaire
 * conservée. Le corps reste à 11 px : c'est le plancher du lisible, et le descendre pour gagner de
 * la place se paierait sur les surtitres, qui sont la structure du document.
 *
 * `niveau` en fait un vrai titre de document. Il est facultatif exprès : la plupart des surtitres
 * nomment bien la carte qui les porte — « Votre corpulence (IMC) », « Votre semaine type » — et
 * méritent d'entrer au sommaire, mais deux emplois ne titrent rien. Dans `Hero`, le surtitre
 * annonce le grand chiffre qui le suit et non une section ; dans le formulaire, il coiffe un
 * groupe de champs que son propre libellé nomme déjà. Les déclarer titres remplirait le sommaire
 * de doublons, ce qui vaut à peine mieux que de n'en avoir aucun.
 *
 * `onDark` a disparu : plus aucun surtitre ne se pose sur un aplat coloré depuis que le `Hero` est
 * un cadran. Le jour où un fond plein revient, la propriété reviendra avec — la remettre « au cas
 * où » laisserait une variante que rien n'exerce et que personne ne vérifierait.
 */
export default function Overline({
  children,
  className,
  niveau,
}: {
  children: ReactNode;
  className?: string;
  /** rang du titre dans le document ; sans lui, le surtitre reste du texte */
  niveau?: 2 | 3;
}) {
  const style = cx('text-micro font-sans-medium uppercase tracking-[1.6px] text-muted2', className);

  if (niveau) {
    return (
      <Titre niveau={niveau} className={style}>
        {children}
      </Titre>
    );
  }

  return <Text className={style}>{children}</Text>;
}
