/**
 * L'en-tête, présent au-dessus de tous les écrans.
 *
 * **Il ne porte que la marque**, qui ramène à l'accueil comme le logo de n'importe quel site. Ni
 * navigation, ni réglage, ni bascule de thème : sur un téléphone, le haut de l'écran est hors de
 * portée du pouce, et il y avait fini par s'y entasser quatre commandes qui rétrécissaient la
 * marque jusqu'à la tronquer. Tout cela est descendu — les sections dans la barre du bas, le thème
 * dans le profil, où l'on va chercher un réglage.
 *
 * Deux choses s'y ajoutent quand même, et pour des raisons opposées :
 *
 * — **le bandeau des quatre écrans de résultats**, sur toutes les largeurs. C'est le second niveau
 *   de navigation : les quatre écrans forment une seule section, et ce bandeau dit lequel on
 *   regarde. Il était réservé aux grands écrans, où il doublait la barre du bas ; il descend
 *   désormais sur mobile au lieu d'exister en double ;
 * — **les quatre sections**, mais au-dessus de `NAV_BREAKPOINT` seulement, là où la barre du bas
 *   se retire. L'argument du pouce ne vaut pas sur un écran de bureau, où le bas de la fenêtre est
 *   au contraire le point le plus éloigné du regard.
 */

import { RESULT_PAGES, SECTIONS, sectionDe } from '@vitae/core/nav';
import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ResultTabs, { useTopNav } from '@/components/layout/ResultTabs';
import { MAX_CONTENT } from '@/components/ui/Page';
import { cx } from '@/components/ui/primitives';
import { versRoute } from '@/lib/route';
import { usePalette } from '@/theme/palette';

export default function AppHeader() {
  const palette = usePalette();
  const insets = useSafeAreaInsets();

  const haut = useTopNav();
  const pathname = usePathname();
  const dansLesChiffres = RESULT_PAGES.some((p) => p.href === pathname);

  return (
    <View
      // `banner` sort un `<header>` sur le web : le lecteur d'écran peut sauter l'en-tête d'un
      // geste, et le document cesse d'être une pile de `<div>` indifférenciés.
      role="banner"
      className="border-b border-divider bg-surface"
      // L'encoche est dégagée ici plutôt que par une `SafeAreaView` : l'en-tête doit garder son
      // fond plein jusqu'au bord haut de l'écran, pas commencer sous la barre d'état.
      style={{ paddingTop: insets.top }}
    >
      {/* Le fond court jusqu'aux bords, la barre s'aligne sur la colonne de contenu : sur un
          écran large, une marque collée à l'angle et des liens à 1 400 px de là ne formaient plus
          un en-tête, mais deux éléments sans rapport. */}
      <View
        className="h-14 w-full flex-row items-center gap-3 self-center px-4"
        style={{ maxWidth: MAX_CONTENT }}
      >
        {/* La marque est un lien, comme le logo de n'importe quel site : sur un `Pressable` seul,
            le web n'a ni clic milieu, ni adresse à copier, ni lien à faire suivre à un moteur de
            recherche. La navigation native est la même. */}
        <Link href="/" asChild>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel="Accueil"
            className="min-w-0 flex-1 flex-row items-center gap-3"
          >
            {/* Un aplat, plus un dégradé : `heroFrom` et `heroTo` portent la même valeur depuis
                la refonte, et le seul consommateur de leur écart était cette pastille. */}
            <View
              className="size-[30px] justify-center rounded-[9px]"
              style={{ backgroundColor: palette.heroFrom }}
            >
              <Text
                className="text-center text-caption font-sans-bold tracking-[0.3px]"
                style={{ color: palette.heroText }}
              >
                MB
              </Text>
            </View>
            <Text
              numberOfLines={1}
              className="min-w-0 flex-none font-sans-medium text-option text-ink"
            >
              Métabolisme de base
            </Text>
          </Pressable>
        </Link>

        {haut ? <SectionsEnHaut pathname={pathname} /> : null}
      </View>

      {/* Le bandeau du second niveau ne s'affiche que dans la section « Mes chiffres » : ailleurs,
          il n'y a pas de second niveau à montrer, et le laisser vide ferait un filet gris sans
          objet sous l'en-tête. */}
      {dansLesChiffres ? <ResultTabs /> : null}
    </View>
  );
}

/**
 * Les quatre sections, sur écran large seulement.
 *
 * Les mêmes que la barre du bas, dans le même ordre et avec le même état actif : ce sont deux
 * rendus d'un seul plan, pas deux navigations. « Mes chiffres » y mène toujours à `racine` et non
 * au dernier écran vu — sur un écran large, le bandeau des quatre est visible juste en dessous,
 * donc le retour au dernier écran n'a pas à être deviné.
 */
function SectionsEnHaut({ pathname }: { pathname: string }) {
  const section = sectionDe(pathname);

  return (
    <View className="flex-none flex-row items-center gap-1" accessibilityRole="tablist">
      {SECTIONS.map((s) => {
        const actif = section?.cle === s.cle;
        return (
          <Link key={s.cle} href={versRoute(s.racine)} asChild>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: actif }}
              className="rounded-control px-3 py-2 active:bg-surface2"
            >
              <Text
                className={cx(
                  'text-base',
                  actif ? 'font-sans-medium text-primary-ink' : 'font-sans text-muted',
                )}
              >
                {s.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}
