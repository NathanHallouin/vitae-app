import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { cx } from './primitives';
import Titre from './Titre';

/**
 * Surtitre 11 px majuscules, gris `muted2`, utilisé en tête de chaque carte.
 *
 * `niveau` en fait un vrai titre de document. Il est facultatif exprès : la plupart des surtitres
 * nomment bien la carte qui les porte — « Votre corpulence (IMC) », « Votre semaine type » — et
 * méritent d'entrer au sommaire, mais deux emplois ne titrent rien. Dans `Hero`, le surtitre
 * annonce le grand chiffre qui le suit et non une section ; dans le formulaire, il coiffe un
 * groupe de champs que son propre libellé nomme déjà. Les déclarer titres remplirait le sommaire
 * de doublons, ce qui vaut à peine mieux que de n'en avoir aucun.
 */
export default function Overline({
  children,
  className,
  onDark = false,
  niveau,
}: {
  children: ReactNode;
  className?: string;
  onDark?: boolean;
  /** rang du titre dans le document ; sans lui, le surtitre reste du texte */
  niveau?: 2 | 3;
}) {
  const style = cx(
    'text-micro font-sans-semibold uppercase tracking-[1.1px]',
    onDark ? 'text-hero-text opacity-80' : 'text-muted2',
    className,
  );

  if (niveau) {
    return (
      <Titre niveau={niveau} className={style}>
        {children}
      </Titre>
    );
  }

  return <Text className={style}>{children}</Text>;
}
