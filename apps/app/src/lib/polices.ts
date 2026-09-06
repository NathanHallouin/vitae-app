import { useFonts } from 'expo-font';

/**
 * Les polices, en natif : chargées par `expo-font` depuis les fichiers du paquet.
 *
 * Les coupes viennent de `assets/polices/`, recopiées par `tools/build-fonts.ts`. Importer
 * `@expo-google-fonts/space-grotesk` serait plus court d'une ligne, mais embarquerait la famille
 * entière — le piège documenté dans le README, qui avait mis 7,7 Mo dans l'export du site.
 *
 * Le nom donné à chaque coupe est celui que `tailwind.config.js` désigne : les changer ici sans
 * les changer là ferait retomber toute l'interface sur la police système, sans erreur.
 */
export function usePolices(): boolean {
  const [pretes] = useFonts({
    SpaceGrotesk_400Regular: require('../../assets/polices/SpaceGrotesk_400Regular.ttf'),
    SpaceGrotesk_500Medium: require('../../assets/polices/SpaceGrotesk_500Medium.ttf'),
    SpaceGrotesk_700Bold: require('../../assets/polices/SpaceGrotesk_700Bold.ttf'),
  });

  return pretes;
}
