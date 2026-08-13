import { BENEFITS } from '@vitae/core/constants';
import { kcal } from '@vitae/core/format';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '@/components/ProfileProvider';
import Icon from '@/components/ui/Icon';
import Overline from '@/components/ui/Overline';
import { Button, Card } from '@/components/ui/primitives';
import { usePalette } from '@/theme/palette';

/**
 * L'écran d'accueil : ce que fait l'application, et par où commencer.
 *
 * Il vit hors des onglets, comme la page d'accueil du site vit hors de la barre de navigation. On
 * y arrive au premier lancement — quand il n'y a rien à consulter — puis en touchant la marque
 * dans l'en-tête. Une fois le profil enregistré, l'application s'ouvre directement sur les
 * chiffres : c'est un outil, pas une brochure.
 */
export default function AccueilScreen() {
  const { status, metrics } = useProfile();
  const router = useRouter();
  const palette = usePalette();
  const insets = useSafeAreaInsets();
  const known = status === 'ready' && metrics !== null;

  return (
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerStyle={{ paddingTop: insets.top + 24, paddingBottom: 64 }}
      contentContainerClassName="px-4"
    >
      <Text className="mb-4 font-display text-h1 leading-[44px] text-ink">
        Combien votre corps brûle-t-il de calories ?
      </Text>
      <Text className="mb-2 text-body leading-[26px] text-muted">
        Même au repos, votre corps consomme de l’énergie pour respirer, faire battre votre cœur et
        vous garder au chaud. Savoir combien, c’est le point de départ pour perdre du gras, prendre
        du muscle ou simplement rester stable.
      </Text>
      <Text className="mb-8 text-base leading-[22px] text-muted2">
        Quatre questions, une minute. Rien n’est envoyé sur internet : vos réponses restent sur cet
        appareil. Vous pouvez aussi parcourir directement les recettes.
      </Text>

      {known && metrics ? (
        <View className="gap-3">
          <View className="flex-row flex-wrap gap-3">
            <Button variant="contained" size="large" onPress={() => router.navigate('/metabolisme')}>
              Voir mes résultats
            </Button>
            <Button variant="outlined" size="large" onPress={() => router.navigate('/profil')}>
              Modifier mes infos
            </Button>
          </View>
          <Text className="text-small text-muted2">
            Dernier calcul : {kcal(metrics.tdee)} kcal dépensées par jour, {kcal(metrics.target)}{' '}
            kcal à manger pour votre objectif.
          </Text>
        </View>
      ) : (
        <View className="flex-row flex-wrap gap-3">
          <Button variant="contained" size="large" onPress={() => router.navigate('/profil')}>
            Commencer
          </Button>
          <Button variant="outlined" size="large" onPress={() => router.navigate('/recettes')}>
            Voir les recettes
          </Button>
        </View>
      )}

      <Card className="mt-6 p-6">
        <Overline className="mb-5">Ce que vous obtenez</Overline>
        {BENEFITS.map((b) => (
          <View key={b.n} className="flex-row gap-4 border-t border-divider py-3">
            <View className="size-[30px] flex-none items-center justify-center rounded-full bg-primary-tint">
              <Icon name={b.icon} size={18} color={palette.primaryInk} />
            </View>
            <View className="min-w-0 flex-1">
              <Text className="mb-[2px] text-option font-sans-medium text-ink">{b.title}</Text>
              <Text className="text-small leading-[19px] text-muted">{b.desc}</Text>
            </View>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}
