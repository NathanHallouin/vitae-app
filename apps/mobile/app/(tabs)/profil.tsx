import { formFromProfile } from '@vitae/core/state';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';
import { useProfile } from '@/components/ProfileProvider';
import ProfilForm from '@/components/screens/ProfilForm';

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
    <ScrollView
      className="flex-1 bg-bg"
      contentContainerClassName="px-4 pt-8 pb-16"
      keyboardShouldPersistTaps="handled"
    >
      <ProfilForm
        // Réinitialise le formulaire si le profil enregistré change sous ses pieds.
        key={profile?.updatedAt ?? 'nouveau'}
        initial={initial}
        hasProfile={Boolean(profile)}
        onSubmit={(input) => {
          save(input);
          router.navigate('/metabolisme');
        }}
        onCancel={() => router.navigate(profile ? '/metabolisme' : '/accueil')}
        onReset={() => {
          reset();
          router.navigate('/accueil');
        }}
      />
    </ScrollView>
  );
}
