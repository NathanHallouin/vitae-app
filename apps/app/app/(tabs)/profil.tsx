import { formFromProfile } from '@vitae/core/state';
import { Link, useRouter } from 'expo-router';
import { View } from 'react-native';
import ProfilForm from '@/components/screens/ProfilForm';
import Page from '@/components/ui/Page';
import { useProfile } from '@/state/ProfileProvider';

/**
 * La saisie du profil.
 *
 * Le site devait envelopper cet écran dans un `<Suspense>` et gérer un état de chargement, parce
 * que le mode se lisait dans la requête et le profil dans le navigateur, tous deux indisponibles
 * au rendu serveur. Ici tout est en mémoire dès le premier rendu : il n'y a ni attente, ni
 * repli à afficher.
 */
export default function ProfilTab() {
  const { profile, staleWeight, save, reset } = useProfile();
  const router = useRouter();

  // Un profil existant s'édite d'un bloc ; une première visite se fait question par question.
  const mode = profile ? 'form' : 'wizard';
  const initial = formFromProfile(profile, staleWeight, mode);

  return (
    <Page contentClassName="pt-8" keyboardShouldPersistTaps="handled">
      <ProfilForm
        // Réinitialise le formulaire si le profil enregistré change sous ses pieds.
        key={profile?.updatedAt ?? 'nouveau'}
        initial={initial}
        hasProfile={Boolean(profile)}
        onSubmit={(input) => {
          save(input);
          router.navigate('/metabolisme');
        }}
        onCancel={() => router.navigate(profile ? '/metabolisme' : '/')}
        onReset={() => {
          reset();
          router.navigate('/');
        }}
      />

      {/* Les deux magasins exigent que la politique soit atteignable depuis l'application, pas
          seulement depuis leur fiche. Sa place est ici : c'est l'écran où l'on confie ses
          informations, et celui où l'on peut tout effacer. */}
      <View className="mt-8 items-center">
        <Link href="/confidentialite" className="text-caption text-faint underline">
          Ce que deviennent vos informations
        </Link>
      </View>
    </Page>
  );
}
