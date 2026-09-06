import { NAV_BREAKPOINT } from '@vitae/core/nav';
import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Apparition from '@/components/ui/Apparition';

/**
 * La réponse à gauche, le détail à droite — au-dessus du seuil de navigation seulement.
 *
 * Sur un téléphone, le cadran est en haut et les cartes défilent en dessous : c'est l'ordre de
 * lecture naturel d'une colonne unique. Sur un écran large, la même pile envoie le cadran hors
 * champ dès qu'on descend d'une carte, et la réponse de l'écran — celle que tout le reste
 * détaille — disparaît au moment précis où on lit son détail.
 *
 * En deux colonnes, **la réponse reste au même endroit de l'œil** pendant qu'on parcourt les
 * cartes. C'est la seule raison de ce découpage : il ne remplit pas une largeur, il garde un
 * repère.
 *
 * Le seuil est `NAV_BREAKPOINT`, celui des deux barres de navigation, et non un palier propre à
 * cet écran. Un troisième seuil dans l'application serait un troisième endroit où l'interface
 * change d'avis, et rien ne dit qu'ils resteraient d'accord.
 *
 * La cascade d'arrivée ne porte que la colonne de droite : à gauche il n'y a qu'un élément, et
 * décaler un élément seul ne dessine aucun ordre de lecture — cela ne fait que retarder la
 * réponse.
 */
export default function ColonnesResultat({
  reponse,
  children,
}: {
  /** le `Hero` de l'écran : un seul, et c'est lui qui passe à gauche */
  reponse: ReactNode;
  /** les cartes de détail */
  children: ReactNode;
}) {
  const large = useWindowDimensions().width >= NAV_BREAKPOINT;

  if (!large) {
    return (
      <View className="gap-3">
        <Apparition depuis={1}>
          {reponse}
          {children}
        </Apparition>
      </View>
    );
  }

  return (
    <View className="flex-row items-start gap-6">
      {/* 320 points : le cadran en fait 230, et la légende qui le suit a besoin du reste pour ne
          pas se casser tous les trois mots. */}
      <View className="w-[320px] flex-none">{reponse}</View>
      <View className="min-w-0 flex-1 gap-3">
        <Apparition depuis={1}>{children}</Apparition>
      </View>
    </View>
  );
}
