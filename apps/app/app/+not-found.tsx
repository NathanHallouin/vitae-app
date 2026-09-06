import { SITE_URL } from '@vitae/core/site';
import { Link } from 'expo-router';
import { View } from 'react-native';
import Seo from '@/components/layout/Seo';
import IllustrationIntrouvable from '@/components/ui/illustrations/IllustrationIntrouvable';
import Titre from '@/components/ui/Titre';

/**
 * Atteignable seulement par un lien profond périmé — mais un lien périmé ne doit pas coincer.
 *
 * Cette route était la seule à n'employer ni `Seo` ni `Titre` ni `role="main"`, et rien ne le
 * signalait : la vérification de structure de la CI portait sur une liste de douze pages écrite à
 * la main, où celle-ci ne figurait pas. Le fichier livré avait donc un `<title>` **vide**, aucun
 * `<h1>`, aucun `<main>`, aucune canonique et aucune consigne d'indexation — c'est-à-dire une page
 * indexable au titre vide, sur la seule adresse qu'un robot finit toujours par visiter.
 *
 * Le titre passait par `Stack.Screen options={{ title }}`, qui nomme un écran de navigation et
 * n'écrit rien dans le document. La confusion est facile et muette : les deux s'appellent « title ».
 *
 * `noindex, follow` plutôt que `noindex` seul : la page ne doit pas être listée, mais son lien vers
 * l'accueil reste un chemin utile à suivre.
 */
export default function NotFound() {
  return (
    <>
      <Seo
        title="Page introuvable"
        description="Cette adresse n’existe pas ou n’existe plus. Revenir à l’accueil pour calculer son métabolisme de base."
        canonical={`${SITE_URL}/`}
        noindex
      />
      <View role="main" className="flex-1 items-center justify-center gap-4 bg-bg p-6">
        <View className="mb-2 w-full max-w-[300px]">
          <IllustrationIntrouvable />
        </View>
        <Titre niveau={1} className="font-display text-h3 text-ink">
          Cette page n’existe pas
        </Titre>
        <Link href="/" className="text-base font-sans-medium text-primary-ink">
          Revenir à l’accueil
        </Link>
      </View>
    </>
  );
}
