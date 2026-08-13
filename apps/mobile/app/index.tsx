import { Redirect } from 'expo-router';
import { useProfile } from '@/components/ProfileProvider';

/**
 * Le point d'entrée : les chiffres si on en a, la présentation sinon.
 *
 * Cette redirection ne se voit pas. MMKV a déjà rendu le profil de façon synchrone au montage du
 * fournisseur, donc `status` est déjà correct au premier rendu : expo-router remplace la route
 * avant qu'une seule image ne soit composée. C'est ce qui permet à l'application de s'ouvrir
 * directement sur la dépense du jour, sans passer par un écran d'accueil qu'on ne fait que
 * traverser.
 */
export default function Index() {
  const { status } = useProfile();
  return <Redirect href={status === 'ready' ? '/metabolisme' : '/accueil'} />;
}
