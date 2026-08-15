import { useFonts } from 'expo-font';

/**
 * Les polices, en natif : chargées par `expo-font` depuis les fichiers du paquet.
 *
 * Les coupes viennent de `assets/polices/`, recopiées par `tools/build-fonts.ts`. Importer
 * `@expo-google-fonts/inter` serait plus court d'une ligne, mais embarquerait la famille entière —
 * trente-six fichiers pour les cinq utilisés.
 *
 * Le nom donné à chaque coupe est celui que `tailwind.config.js` désigne : les changer ici sans
 * les changer là ferait retomber toute l'interface sur la police système, sans erreur.
 */
export function usePolices(): boolean {
  const [pretes] = useFonts({
    Fraunces_600SemiBold: require('../../assets/polices/Fraunces_600SemiBold.ttf'),
    Inter_400Regular: require('../../assets/polices/Inter_400Regular.ttf'),
    Inter_500Medium: require('../../assets/polices/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('../../assets/polices/Inter_600SemiBold.ttf'),
    Inter_700Bold: require('../../assets/polices/Inter_700Bold.ttf'),
  });

  return pretes;
}
