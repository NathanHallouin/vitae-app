/**
 * Le bandeau des quatre écrans de résultats — le second niveau de navigation.
 *
 * Il était réservé aux grands écrans, où il remplaçait la barre du bas. C'était une redite : sur
 * un téléphone, les quatre écrans occupaient quatre entrées de la barre, et il ne restait qu'une
 * place pour tout le reste de l'application — d'où deux sections reléguées dans l'en-tête, hors de
 * portée du pouce.
 *
 * Les quatre écrans ne sont pas quatre destinations : ils partagent un profil et une chaîne de
 * lecture. Ils forment **une** section, « Mes chiffres », et ce bandeau est ce qui la découpe. Il
 * descend donc sur mobile, collé sous l'en-tête, au lieu d'exister en double.
 *
 * `useTopNav` sert toujours, mais pour autre chose : il dit désormais où vivent les quatre
 * **sections** — dans la barre du bas en dessous du seuil, dans l'en-tête au-dessus. Le seuil
 * vient de `@vitae/core/nav` et n'a pas été choisi au hasard : c'est la largeur mesurée à partir
 * de laquelle les libellés français tiennent sans être coupés.
 */

import { NAV_BREAKPOINT, RESULT_PAGES } from '@vitae/core/nav';
import { Link, usePathname } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { MAX_CONTENT } from '@/components/ui/Page';
import { cx } from '@/components/ui/primitives';
import { versRoute } from '@/lib/route';

/** Vrai quand la navigation est en haut. Faux quand elle est en bas. Jamais les deux. */
export function useTopNav(): boolean {
  return useWindowDimensions().width >= NAV_BREAKPOINT;
}

export default function ResultTabs() {
  const pathname = usePathname();

  return (
    // `navigation` sort un `<nav>` : c'est la navigation du second niveau, et c'est un repère
    // qu'un lecteur d'écran cherche sur une page inconnue.
    <View
      role="navigation"
      aria-label="Mes chiffres"
      className="border-t border-divider bg-surface"
    >
      <View
        className="w-full flex-row self-center px-2"
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
                  // 44 points : la hauteur du bandeau dans la maquette, et le minimum pour une
                  // cible tactile — celle-ci est en haut de l'écran, mais elle reste tactile.
                  'min-h-[44px] flex-1 items-center justify-center px-1',
                  // Un liseré sous l'onglet courant, pas seulement une couleur : la couleur seule
                  // ne marque rien pour qui ne la distingue pas.
                  actif ? 'border-b-2 border-primary-ink' : 'border-b-2 border-transparent',
                )}
              >
                {/* Pas d'icône, contrairement à la barre du bas. Elles y sont utiles — quatre
                    sections à reconnaître d'un coup d'œil sous le pouce — et nuisibles ici : sur
                    390 points, une icône de 16 px prise sur chacun des quatre quarts tronquait
                    « Métabolisme ». Un second niveau n'a pas à se reconnaître de loin, il se lit. */}
                <Text
                  numberOfLines={1}
                  className={cx(
                    'text-small',
                    actif ? 'font-sans-medium text-primary-ink' : 'font-sans text-muted',
                  )}
                >
                  {page.short}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}
