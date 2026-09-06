/**
 * Un navigateur d'onglets **sans barre d'onglets**.
 *
 * Il ne sert plus à naviguer — c'est `BarreSections` qui le fait, depuis la racine, et
 * `ResultTabs` pour le second niveau. Ce qu'il apporte encore, et qu'aucune pile ne donne : les
 * cinq écrans de `MOBILE_PAGES` restent **montés et gelés** d'une visite à l'autre. Passer de
 * « Manger » à « Poids » n'est alors qu'un changement de visibilité, et chaque écran retrouve sa
 * position de défilement exactement où on l'avait laissée.
 *
 * Sa barre est masquée sur toutes les largeurs : la dessiner ici la rendrait absente des routes de
 * la pile — recettes, cours, réglages — c'est-à-dire de la moitié de l'application.
 *
 * L'autre moitié de l'instantanéité ne vient pas d'ici : aucun de ces écrans ne charge quoi que ce
 * soit. Le profil est en mémoire, les calculs sont mémoïsés dans `ProfileProvider`, les recettes
 * sont compilées dans le paquet.
 */

import { MOBILE_PAGES } from '@vitae/core/nav';
import { Tabs } from 'expo-router';
import { usePalette } from '@/theme/palette';

export default function TabsLayout() {
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        // L'en-tête vient de la pile qui contient ces onglets : en poser un second ici l'afficherait
        // deux fois.
        headerShown: false,
        // La barre est masquée sur toutes les largeurs, et c'est le point : la navigation est
        // ailleurs, dans `BarreSections` posée à la racine, qui elle survit aux routes de la pile.
        // `display: 'none'` plutôt qu'un `tabBar` vide — React Navigation réserve la hauteur d'une
        // barre qui rend `null`.
        tabBarStyle: { display: 'none' },
        // Geler plutôt que démonter : l'écran reste prêt, sans consommer de temps de calcul.
        freezeOnBlur: true,
        sceneStyle: { backgroundColor: palette.bg },
      }}
    >
      {MOBILE_PAGES.map((page) => (
        <Tabs.Screen
          key={page.href}
          // `/metabolisme` → `metabolisme` : le plan partagé parle en chemins d'URL, expo-router
          // en noms de fichiers.
          name={page.href.replace(/^\//, '')}
          // Le titre reste renseigné bien que la barre soit masquée : React Navigation s'en sert
          // pour le titre d'accessibilité de l'écran, que les lecteurs annoncent à l'arrivée.
          options={{ title: page.short }}
        />
      ))}
    </Tabs>
  );
}
