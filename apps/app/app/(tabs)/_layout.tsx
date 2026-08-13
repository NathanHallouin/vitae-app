/**
 * Les onglets, calqués sur `MOBILE_PAGES`.
 *
 * Le plan de navigation vient du métier partagé : les cinq destinations sont donc exactement
 * celles de la barre du bas du site, dans le même ordre, avec les mêmes icônes et les mêmes
 * libellés courts. Une destination ajoutée d'un côté apparaît de l'autre.
 *
 * Ce qui rend le changement d'onglet instantané tient en deux points :
 *
 * — les écrans restent montés une fois visités (`popToTopOnBlur` désactivé, pas de démontage) et
 *   sont simplement gelés hors écran ; y revenir n'est qu'un changement de visibilité ;
 * — aucun écran ne charge quoi que ce soit. Le profil est déjà en mémoire, les calculs sont
 *   mémoïsés dans `ProfileProvider`, les recettes sont compilées dans le paquet. Il n'y a rien à
 *   attendre, donc rien à faire patienter.
 */

import { MOBILE_PAGES } from '@vitae/core/nav';
import { Tabs } from 'expo-router';
import AppHeader from '@/components/AppHeader';
import Icon from '@/components/ui/Icon';
import { usePalette } from '@/theme/palette';

export default function TabsLayout() {
  const palette = usePalette();

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: palette.primaryInk,
        tabBarInactiveTintColor: palette.muted2,
        tabBarStyle: {
          backgroundColor: palette.surface,
          borderTopColor: palette.divider,
        },
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 11,
        },
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
          options={{
            title: page.short,
            tabBarAccessibilityLabel: page.label,
            tabBarIcon: ({ color, focused }) => (
              // `color` est typé `ColorValue` par React Navigation, mais la barre d'onglets ne
              // reçoit que les deux chaînes passées en `screenOptions` juste au-dessus.
              <Icon name={page.icon} size={focused ? 22 : 20} color={color as string} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
