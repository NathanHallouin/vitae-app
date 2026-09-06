/**
 * L'écran de démarrage — en natif, où il existe.
 *
 * Il tient l'écran pendant le chargement des polices. Sans lui, le premier écran s'afficherait en
 * police système puis sauterait à l'arrivée de la Space Grotesk : un défaut que l'œil lit comme de
 * la lenteur, alors que tout est déjà là.
 *
 * `retenir()` doit être appelé **avant le premier rendu**, d'où l'appel au chargement du module
 * dans `app/_layout.tsx` et non dans un effet.
 */

import * as SplashScreen from 'expo-splash-screen';

export function retenir(): void {
  SplashScreen.preventAutoHideAsync();
}

export function relacher(): void {
  SplashScreen.hideAsync();
}
