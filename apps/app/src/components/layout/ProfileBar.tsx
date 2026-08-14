import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useProfile } from '@/state/ProfileProvider';

/**
 * Rappel discret de ce sur quoi les chiffres sont calculés, présent sur tous les écrans.
 *
 * Le site en a deux versions selon la largeur ; ici seule la courte a un sens. Elle ne garde que
 * ce qui change souvent, à commencer par le poids, puisque c'est lui qu'on vient corriger. Le
 * détail se lit sur l'écran du profil, à une touche.
 */
export default function ProfileBar() {
  const { profile, age, metrics } = useProfile();
  const router = useRouter();
  if (!profile || !metrics) return null;

  const court = [
    `${profile.poids} kg`,
    profile.sexe === 'homme' ? 'Homme' : 'Femme',
    age === null ? null : `${age} ans`,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View className="mb-6 flex-row items-center justify-between gap-2">
      <Text className="min-w-0 flex-1 text-small text-muted2">Calculé pour {court}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Modifier mon profil"
        onPress={() => router.navigate('/profil')}
        className="flex-none rounded-control px-2 py-1 active:bg-primary-tint"
      >
        <Text className="text-caption font-sans-semibold text-primary-ink">Modifier</Text>
      </Pressable>
    </View>
  );
}
