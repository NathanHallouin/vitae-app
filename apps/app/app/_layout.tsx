/**
 * Racine de l'application : polices, thème, profil, et la pile de navigation.
 *
 * Sur la navigation instantanée, trois décisions se prennent ici et ne se rattrapent pas ailleurs :
 *
 * 1. `enableFreeze` gèle les écrans qui ne sont pas à l'écran. Ils restent montés — donc leur
 *    réaffichage est immédiat — mais ne se re-rendent plus, ce qui libère le fil principal pour
 *    l'animation de transition.
 * 2. Le splash n'est masqué qu'une fois les polices chargées. Sans cela, le premier écran s'affiche
 *    en police système puis saute quand la Fraunces arrive : un défaut que l'œil lit comme de la
 *    lenteur, alors même que tout est déjà là.
 * 3. Les fournisseurs de contexte sont au-dessus de la pile, jamais dans un écran. Un fournisseur
 *    posé dans un écran se démonterait à chaque navigation, et le profil serait relu à chaque fois.
 */

import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableFreeze } from 'react-native-screens';
import AppHeader from '@/components/layout/AppHeader';
import { usePolices } from '@/lib/polices';
import ProfileProvider from '@/state/ProfileProvider';
import ColorModeProvider, { useColorMode } from '@/theme/ColorMode';
import { MOTION, useMotionReduite } from '@/theme/motion';
import { usePalette } from '@/theme/palette';
import '../global.css';

enableFreeze(true);

/**
 * Le splash n'existe qu'en natif.
 *
 * Sur le web il n'y en a pas, et surtout : ce module est exécuté par Node pendant l'export
 * statique, où il n'y a ni écran ni cycle de vie d'application à piloter.
 */
const NATIF = Platform.OS !== 'web';

// Le splash reste tant que les polices ne sont pas prêtes ; l'appel doit précéder le premier rendu.
if (NATIF) SplashScreen.preventAutoHideAsync();

/**
 * La pile, à l'intérieur du fournisseur de thème.
 *
 * Séparée du composant racine parce qu'elle a besoin de `usePalette`, qui n'existe qu'une fois
 * `ColorModeProvider` monté. Un composant ne peut pas consommer un contexte qu'il fournit lui-même.
 */
function Navigation() {
  const palette = usePalette();
  const { mode } = useColorMode();
  const reduite = useMotionReduite();

  return (
    <>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          // L'en-tête est porté par la pile, pas par les onglets : les recettes, l'accueil et la
          // confidentialité vivent hors des onglets, et se retrouvaient sans aucune navigation —
          // sur le site, une recette ouverte depuis un moteur de recherche était un cul-de-sac.
          header: () => <AppHeader />,
          contentStyle: { backgroundColor: palette.bg },
          /**
           * La pile native rend les transitions au niveau du système : elles ne passent pas par le
           * fil JavaScript, et restent donc fluides même pendant un recalcul.
           *
           * Le glissement latéral dit la hiérarchie — on entre dans un détail, on en ressort par
           * la gauche. Le réglage « moins de mouvement » le remplace par rien du tout : ralentir
           * une translation ne règle pas le problème qu'elle pose.
           */
          animation: reduite ? 'none' : 'slide_from_right',
          animationDuration: MOTION.normal,
        }}
      >
        <Stack.Screen name="(tabs)" />
        {/* L'accueil n'est pas un détail dont on ressort : il se substitue, il ne glisse pas. */}
        <Stack.Screen name="index" options={{ animation: reduite ? 'none' : 'fade' }} />
        <Stack.Screen name="recettes/index" />
        <Stack.Screen name="recettes/[slug]" />
        <Stack.Screen name="confidentialite" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  /**
   * En natif seulement, l'arbre attend les polices.
   *
   * Le splash tient l'écran pendant ce temps : il n'y a donc pas d'écran blanc, et pas non plus de
   * saut de police quand la Fraunces arrive après coup — un défaut que l'œil lit comme de la
   * lenteur alors que tout est déjà là.
   *
   * Sur le web, `usePolices` rend `true` sans rien charger : les coupes sont déclarées en
   * `@font-face` dans le document, donc demandées par le navigateur pendant l'analyse du HTML.
   * Attendre y serait de toute façon une faute — les pages sont pré-rendues par Node, où aucune
   * police ne se charge jamais, et l'arbre livrerait un fichier HTML vide.
   */
  const ready = usePolices();

  useEffect(() => {
    if (NATIF && ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ColorModeProvider>
          <ProfileProvider>
            <Navigation />
          </ProfileProvider>
        </ColorModeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
