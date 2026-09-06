import { RESULT_PAGES, SECTIONS, sectionDe } from '@vitae/core/nav';
import { Link, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTopNav } from '@/components/layout/ResultTabs';
import Icon from '@/components/ui/Icon';
import { MAX_CONTENT } from '@/components/ui/Page';
import { cx } from '@/components/ui/primitives';
import { versRoute } from '@/lib/route';
import { usePalette } from '@/theme/palette';

/**
 * La barre du bas : quatre sections, et le seul niveau de navigation qui soit permanent.
 *
 * Elle vit dans la **racine** de l'application et non dans le navigateur d'onglets, ce qui n'est
 * pas un détail : les recettes et le cours sont des routes de la pile, et une barre portée par les
 * onglets aurait disparu dès qu'on ouvre une fiche de recette — laissant l'écran sans aucun chemin
 * de retour, puisque l'en-tête ne porte plus rien. Le navigateur d'onglets reste en place pour ce
 * qu'il fait de mieux : garder cinq écrans montés et gelés, donc instantanés.
 *
 * Au-dessus de `NAV_BREAKPOINT`, elle disparaît au profit des mêmes sections posées dans
 * l'en-tête. L'argument qui les en chasse — le haut de l'écran est hors de portée du pouce — ne
 * vaut que pour un téléphone ; sur un écran de bureau, le bas de la fenêtre est au contraire
 * l'endroit le plus éloigné du regard comme du curseur.
 *
 * Elle ne s'affiche pas sur l'accueil : c'est une page de présentation, hors de toute section, et
 * la première chose qu'on y fait est de choisir par où commencer.
 */
export default function BarreSections() {
  const pathname = usePathname();
  const haut = useTopNav();
  const insets = useSafeAreaInsets();

  const section = sectionDe(pathname);
  const dernier = useDernierChiffre(pathname);

  if (haut || !section) return null;

  return (
    <View
      role="navigation"
      aria-label="Sections"
      className="border-t border-divider bg-surface"
      // Le geste de retour d'iOS et la barre de navigation d'Android passent sous la barre : sans
      // ce dégagement, la dernière entrée touchée déclencherait l'un ou l'autre.
      style={{ paddingBottom: insets.bottom }}
    >
      <View
        className="w-full flex-row self-center px-1"
        style={{ maxWidth: MAX_CONTENT }}
        accessibilityRole="tablist"
      >
        {SECTIONS.map((s) => {
          const actif = section.cle === s.cle;
          // « Mes chiffres » rouvre le dernier écran de résultats vu : la section garde sa place,
          // comme un onglet de navigateur garde la sienne. Y revenir toujours sur Métabolisme
          // ferait perdre à chaque aller-retour ce qu'on était en train de lire.
          const href = s.cle === 'chiffres' ? dernier : s.racine;

          return (
            <Link key={s.cle} href={versRoute(href)} asChild>
              <Pressable
                accessibilityRole="tab"
                accessibilityState={{ selected: actif }}
                accessibilityLabel={s.label}
                // 48 points de haut : la cible tactile minimale, et la hauteur en dessous de
                // laquelle une barre du bas se touche de travers sur un téléphone tenu d'une main.
                className="min-h-12 flex-1 items-center justify-center gap-[3px] py-2"
              >
                <SectionIcone nom={s.icon} actif={actif} />
                <Text
                  numberOfLines={1}
                  className={cx(
                    'text-caption',
                    actif ? 'font-sans-medium text-primary-ink' : 'font-sans text-muted2',
                  )}
                >
                  {s.label}
                </Text>
              </Pressable>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

function SectionIcone({ nom, actif }: { nom: Parameters<typeof Icon>[0]['name']; actif: boolean }) {
  const palette = usePalette();
  return (
    <Icon name={nom} size={actif ? 21 : 20} color={actif ? palette.primaryInk : palette.muted2} />
  );
}

/**
 * Le dernier écran de résultats visité, retenu pour toute la session.
 *
 * Un état plutôt qu'une lecture du navigateur d'onglets : celui-ci connaît bien son onglet
 * courant, mais la barre a besoin de la réponse même quand on est ailleurs — sur une recette, sur
 * une notion — c'est-à-dire précisément quand le navigateur d'onglets n'est plus à l'écran.
 *
 * Volontairement non persisté : rouvrir l'application ne relève pas de la même question, et c'est
 * `destinationAuDemarrage` qui y répond, en regardant ce qui a changé depuis la dernière fois.
 */
function useDernierChiffre(pathname: string): string {
  const [dernier, setDernier] = useState(RESULT_PAGES[0].href);

  useEffect(() => {
    if (RESULT_PAGES.some((p) => p.href === pathname)) setDernier(pathname);
  }, [pathname]);

  return dernier;
}
