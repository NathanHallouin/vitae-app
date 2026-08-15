/**
 * L'en-tête, présent au-dessus de tous les écrans.
 *
 * Il porte la marque — qui ramène à l'accueil, comme le logo du site —, l'accès aux recettes et
 * la bascule de thème. Sur un écran large, il porte en plus la navigation elle-même : les quatre
 * onglets de résultats et l'accès au profil, que la barre du bas cesse alors d'afficher.
 *
 * La répartition suit celle du site d'origine : sous `NAV_BREAKPOINT`, l'outil est en bas, sous le
 * pouce, et l'en-tête ne garde que la marque ; au-dessus, tout remonte en haut.
 */

import { LinearGradient } from 'expo-linear-gradient';
import { Link, usePathname } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ResultTabs, { useTopNav } from '@/components/layout/ResultTabs';
import Icon from '@/components/ui/Icon';
import { MAX_CONTENT } from '@/components/ui/Page';
import { useProfile } from '@/state/ProfileProvider';
import { useColorMode } from '@/theme/ColorMode';
import { usePalette } from '@/theme/palette';

export default function AppHeader() {
  const palette = usePalette();
  const { mode, toggle } = useColorMode();
  const insets = useSafeAreaInsets();
  const label = mode === 'dark' ? 'Sombre' : 'Clair';

  const haut = useTopNav();
  const pathname = usePathname();
  const { status } = useProfile();
  // Comme sur le site : pas de lien vers le profil quand on y est déjà, ni avant qu'il existe.
  const lienProfil = haut && status === 'ready' && pathname !== '/profil';

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
          écran large, une marque collée à l'angle et une bascule de thème à 1 400 px de là ne
          formaient plus un en-tête, mais deux éléments sans rapport. */}
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
            <LinearGradient
              colors={[palette.heroFrom, palette.heroTo]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 30, height: 30, borderRadius: 9, justifyContent: 'center' }}
            >
              <Text
                className="text-center text-caption font-sans-bold tracking-[0.3px]"
                style={{ color: palette.heroText }}
              >
                MB
              </Text>
            </LinearGradient>
            <Text numberOfLines={1} className="min-w-0 flex-1 font-display text-option text-ink">
              Métabolisme de base
            </Text>
          </Pressable>
        </Link>

        {/* Les recettes sont la partie publique du site : accessibles sans profil, et toujours
            visibles, la barre du bas ne portant que l'outil. C'est aussi, sur l'accueil, le seul
            chemin qu'un moteur de recherche a vers le catalogue. */}
        <Link href="/recettes" asChild>
          <Pressable
            accessibilityRole="link"
            className="flex-none rounded-control px-2 py-2 active:bg-surface2"
          >
            <Text className="text-base font-sans-semibold text-muted">Recettes</Text>
          </Pressable>
        </Link>

        {/* Le profil quitte la barre du bas avec elle : sans ce lien, il deviendrait inatteignable
            sur un écran large. */}
        {lienProfil ? (
          <Link href="/profil" asChild>
            <Pressable
              accessibilityRole="link"
              className="flex-none rounded-control px-[14px] py-2 active:bg-surface2"
            >
              <Text className="text-base font-sans-semibold text-muted">Mon profil</Text>
            </Pressable>
          </Link>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Basculer en mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
          onPress={toggle}
          className="flex-none flex-row items-center gap-2 rounded-full border border-line px-[10px] py-[6px] active:bg-surface2"
        >
          <Icon name={mode === 'dark' ? 'soleil' : 'lune'} size={16} color={palette.muted} />
          <Text className="text-small font-sans-semibold text-muted">{label}</Text>
        </Pressable>
      </View>

      {haut ? <ResultTabs /> : null}
    </View>
  );
}
