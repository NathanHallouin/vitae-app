/**
 * Les onglets du haut, sur les écrans larges.
 *
 * En dessous de `NAV_BREAKPOINT`, la navigation est la barre du bas : cinq destinations sous le
 * pouce. Au-dessus, cette barre n'a plus de sens — sur un écran de bureau, le bas de la fenêtre
 * est l'endroit le plus éloigné du regard comme du curseur, et une barre d'onglets collée là
 * ressemble à une application mobile étirée. Les onglets remontent donc dans l'en-tête, à leur
 * place, et la barre du bas disparaît.
 *
 * Le seuil vient de `@vitae/core/nav` et n'a pas été choisi au hasard : c'est la largeur mesurée à
 * partir de laquelle les quatre libellés français tiennent sans être coupés. Il est partagé par
 * les deux barres, ce qui garantit qu'il y en a toujours exactement une à l'écran.
 */

import { NAV_BREAKPOINT, RESULT_PAGES } from '@vitae/core/nav';
import { Link, usePathname } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import { MAX_CONTENT } from '@/components/ui/Page';
import { cx } from '@/components/ui/primitives';
import { versRoute } from '@/lib/route';
import { usePalette } from '@/theme/palette';

/** Vrai quand la navigation est en haut. Faux quand elle est en bas. Jamais les deux. */
export function useTopNav(): boolean {
  return useWindowDimensions().width >= NAV_BREAKPOINT;
}

export default function ResultTabs() {
  const pathname = usePathname();
  const palette = usePalette();

  return (
    // `navigation` sort un `<nav>` : c'est la navigation principale du site sur écran large, et
    // c'est le repère qu'un lecteur d'écran cherche en premier sur une page inconnue.
    <View role="navigation" aria-label="Résultats" className="border-b border-divider bg-surface">
      <View
        className="w-full flex-row gap-1 self-center px-4"
        style={{ maxWidth: MAX_CONTENT }}
        accessibilityRole="tablist"
      >
        {RESULT_PAGES.map((page) => {
          const actif = pathname === page.href;
          return (
            <Link key={page.href} href={versRoute(page.href)} asChild>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: actif }}
                accessibilityLabel={page.label}
                className={cx(
                  'flex-row items-center gap-2 rounded-t-control px-[14px] py-3',
                  // Un liseré sous l'onglet courant, pas seulement une couleur : la couleur seule
                  // ne marque rien pour qui ne la distingue pas.
                  actif ? 'border-b-2 border-primary-ink' : 'border-b-2 border-transparent',
                )}
              >
                <Icon
                  name={page.icon}
                  size={18}
                  color={actif ? palette.primaryInk : palette.muted2}
                />
                <Text
                  className={cx(
                    'text-base',
                    actif ? 'font-sans-semibold text-primary-ink' : 'font-sans-medium text-muted2',
                  )}
                >
                  {page.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
