import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import IllustrationIntrouvable from '@/components/ui/illustrations/IllustrationIntrouvable';

/** Atteignable seulement par un lien profond périmé — mais un lien périmé ne doit pas coincer. */
export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Page introuvable' }} />
      <View className="flex-1 items-center justify-center gap-4 bg-bg p-6">
        <View className="mb-2 w-full max-w-[300px]">
          <IllustrationIntrouvable />
        </View>
        <Text className="font-display text-h3 text-ink">Cette page n’existe pas</Text>
        <Link href="/" className="text-base font-sans-semibold text-primary-ink">
          Revenir à l’accueil
        </Link>
      </View>
    </>
  );
}
