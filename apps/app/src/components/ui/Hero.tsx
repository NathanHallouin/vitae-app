import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { usePalette } from '@/theme/palette';
import Chiffre from './Chiffre';
import Overline from './Overline';

/**
 * La surface qui porte la réponse d'un écran.
 *
 * C'est l'élément le plus reconnaissable de l'application : un dégradé plein, un surtitre en
 * majuscules, un chiffre en Fraunces qu'on lit à bout de bras, et une phrase qui explique ce que ce
 * chiffre veut dire. Bleu profond en thème clair, ambre en sombre.
 *
 * Une par écran, jamais deux. Sa raison d'être est la hiérarchie : sur un écran qui empile dix
 * cartes blanches, elle dit laquelle est la réponse et laquelle est le détail. Deux dégradés sur le
 * même écran annuleraient exactement ce qu'elle sert à établir.
 */
export default function Hero({
  surtitre,
  valeur,
  unite,
  children,
  anime = true,
}: {
  surtitre: string;
  valeur: number | string;
  unite?: string;
  /** la phrase qui dit ce que le chiffre signifie */
  children: ReactNode;
  anime?: boolean;
}) {
  const palette = usePalette();

  return (
    <LinearGradient
      colors={[palette.heroFrom, palette.heroTo]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 16, padding: 24 }}
    >
      <Overline onDark>{surtitre}</Overline>
      <View className="mt-3 mb-2">
        <Chiffre valeur={valeur} unite={unite} taille="hero" ton="hero" anime={anime} />
      </View>
      <Text style={{ color: palette.heroText }} className="text-body leading-[26px] opacity-90">
        {children}
      </Text>
    </LinearGradient>
  );
}
