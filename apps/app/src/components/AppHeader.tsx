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
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/components/ProfileProvider';
import { useColorMode } from '@/theme/ColorMode';
import { usePalette } from '@/theme/palette';
import ResultTabs, { useTopNav } from './ResultTabs';
import Icon from './ui/Icon';
import { MAX_CONTENT } from './ui/Page';

export default function AppHeader() {
  const router = useRouter();
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
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Accueil"
          onPress={() => router.navigate('/')}
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

        {/* Les recettes sont la partie publique du site : accessibles sans profil, et toujours
            visibles, la barre du bas ne portant que l'outil. */}
        <Pressable
          accessibilityRole="button"
          onPress={() => router.navigate('/recettes')}
          className="flex-none rounded-control px-2 py-2 active:bg-surface2"
        >
          <Text className="text-base font-sans-semibold text-muted">Recettes</Text>
        </Pressable>

        {/* Le profil quitte la barre du bas avec elle : sans ce lien, il deviendrait inatteignable
            sur un écran large. */}
        {lienProfil ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.navigate('/profil')}
            className="flex-none rounded-control px-[14px] py-2 active:bg-surface2"
          >
            <Text className="text-base font-sans-semibold text-muted">Mon profil</Text>
          </Pressable>
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
