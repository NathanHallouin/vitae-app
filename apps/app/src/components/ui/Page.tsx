import { Children, type ReactNode } from 'react';
import { ScrollView, type ScrollViewProps, useWindowDimensions, View } from 'react-native';
import { cx } from './primitives';

/**
 * Largeur maximale du contenu, en points.
 *
 * Sans elle, la même base de code qui sert un téléphone étire ses paragraphes sur toute la largeur
 * d'un écran de bureau : à 1 440 px, la phrase d'accroche de l'accueil faisait plus de 150 signes
 * par ligne, contre les 60 à 75 au-delà desquels l'œil perd le début de la ligne suivante. C'est le
 * défaut que le portage vers Expo avait laissé passer, la version web précédente bornant déjà ses
 * pages à 1 200 px.
 */
export const MAX_CONTENT = 1120;

/** Seuil « grand écran », repris de `PageIntro` : au-delà, il y a la place pour deux colonnes. */
export const LARGE_WIDTH = 768;

export function useLarge(): boolean {
  return useWindowDimensions().width >= LARGE_WIDTH;
}

/** Nombre de colonnes tenables pour des cartes d'environ 320 points. */
export function useColumns(max = 3): number {
  const { width } = useWindowDimensions();
  const contenu = Math.min(width, MAX_CONTENT);
  if (contenu >= 1000) return max;
  if (contenu >= 680) return Math.min(2, max);
  return 1;
}

/**
 * Le cadre de défilement commun à tous les écrans.
 *
 * Le rembourrage reste sur le conteneur de défilement, qui occupe toute la largeur ; c'est la vue
 * intérieure qui est bornée et centrée. Sur un téléphone les deux se confondent, sur un écran large
 * le fond continue jusqu'aux bords pendant que le texte garde une mesure lisible.
 */
export default function Page({
  children,
  contentClassName,
  ...rest
}: { children: ReactNode; contentClassName?: string } & ScrollViewProps) {
  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName={cx('px-4 pt-6 pb-16', contentClassName)}
      {...rest}
    >
      {/* `main` sort un `<main>` : le contenu de l'écran, par opposition à l'en-tête et aux barres
          de navigation qui l'encadrent. C'est ce que vise le lien d'évitement d'un navigateur, et
          ce qu'un lecteur d'écran atteint d'un geste.

          Un seul par document, et c'est bien le cas : l'export web écrit un fichier par route, et
          dans le navigateur les écrans hors champ sont masqués en `display: none` par
          `react-native-screens`, donc absents de l'arbre d'accessibilité. */}
      <View role="main" className="w-full self-center" style={{ maxWidth: MAX_CONTENT }}>
        {children}
      </View>
    </ScrollView>
  );
}

/**
 * Des tuiles côte à côte dès qu'il y a la place, empilées sinon.
 *
 * Trois tuiles de deux lignes empilées sur 1 120 px de large laissaient les deux tiers de la carte
 * vides et repoussaient la suite hors de l'écran ; la comparaison qu'elles servent à faire se lit
 * de toute façon mieux sur une seule ligne.
 */
export function TileRow({ children }: { children: ReactNode }) {
  const large = useLarge();
  const tuiles = Children.toArray(children);

  if (!large) return <View className="gap-3">{children}</View>;

  return (
    <View className="flex-row gap-3">
      {tuiles.map((tuile, i) => (
        // L'ordre est fixe et les tuiles n'ont pas d'identité propre : l'index fait une clé stable.
        // biome-ignore lint/suspicious/noArrayIndexKey: liste statique, jamais réordonnée
        <View key={i} className="min-w-0 flex-1">
          {tuile}
        </View>
      ))}
    </View>
  );
}
