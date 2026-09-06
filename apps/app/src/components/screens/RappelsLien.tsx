import { loadRappels, type RappelsConfig, resumeRappels } from '@vitae/core/rappels';
import { Link, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import { Card } from '@/components/ui/primitives';
import { RAPPELS_DISPONIBLES } from '@/lib/rappels';
import { usePalette } from '@/theme/palette';

/**
 * Le chemin vers les rappels, depuis l'endroit où l'on comprend à quoi ils servent.
 *
 * Le réglage lui-même vivait ici, sous le mouvement du quotidien — la carte du dessus explique que
 * se lever quelques minutes par heure est le geste le plus rentable de la page, et l'interrupteur
 * suivait immédiatement. La logique tenait, mais elle a fini par coûter cher : régler des heures de
 * notification depuis un écran de résultats oblige à revenir chercher un écran de conseils chaque
 * fois qu'on veut décaler une plage d'une heure, et personne ne pense à aller là pour ça.
 *
 * Le réglage a donc déménagé dans les réglages, et il ne reste ici que ce qui a sa place sur un
 * écran de conseils : l'idée, l'état courant, et le chemin. Une carte plutôt qu'un lien nu, parce
 * que l'état courant est l'information utile — savoir que les rappels sont éteints vaut mieux que
 * de proposer d'aller voir.
 *
 * Absente du site : voir `src/lib/rappels.web.ts`. Un rappel qui ne sonne que si l'onglet est resté
 * ouvert ne rappelle rien, et proposer un réglage sans effet est pire que de ne rien proposer.
 */
export default function RappelsLien() {
  const palette = usePalette();
  const [config, setConfig] = useState<RappelsConfig | null>(null);

  /**
   * Relu à chaque fois que l'écran revient au premier plan.
   *
   * Les écrans restent montés d'un onglet à l'autre — c'est ce qui les rend instantanés — donc un
   * état lu une seule fois au montage afficherait encore « aucun rappel » après un aller-retour
   * dans les réglages.
   */
  useFocusEffect(
    useCallback(() => {
      if (RAPPELS_DISPONIBLES) setConfig(loadRappels());
    }, []),
  );

  if (!RAPPELS_DISPONIBLES) return null;

  const actif = Boolean(config?.actif);

  return (
    <Link href="/reglages" asChild>
      <Pressable accessibilityRole="link" className="active:opacity-70">
        <Card className="flex-row items-center gap-4 px-[18px] py-4">
          <View className="size-10 flex-none items-center justify-center rounded-full bg-primary-tint">
            <Icon name="cloche" size={20} color={palette.primaryInk} />
          </View>

          <View className="min-w-0 flex-1">
            <Overline niveau={2} className="mb-1">
              Me rappeler de bouger
            </Overline>
            <Text className="font-sans text-base leading-[22px] text-muted">
              Une invitation discrète à vous lever, sur les plages horaires de votre choix. C’est le
              geste le plus rentable de cette page : il ne demande aucune récupération et se cumule
              tous les jours.
            </Text>
            <Text className="font-sans mt-2 text-caption text-muted2">
              {config ? resumeRappels(config) : ''}{' '}
              <Text className="font-sans-medium text-primary-ink">
                {actif ? 'Modifier dans les réglages' : 'Activer dans les réglages'}
              </Text>
            </Text>
          </View>

          <Icon name="flecheDroite" size={16} color={palette.muted2} />
        </Card>
      </Pressable>
    </Link>
  );
}
