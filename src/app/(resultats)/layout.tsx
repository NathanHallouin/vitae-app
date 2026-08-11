import ProfileBar from '@/components/ProfileBar';
import ResultTabs from '@/components/ResultTabs';

/**
 * Cadre des pages de résultats.
 *
 * Il ne bloque plus l'affichage en l'absence de profil, et ne redirige plus vers la saisie. Deux
 * raisons : ces pages contiennent des explications qui valent d'être lues sans avoir rien calculé,
 * et tant que tout était bloqué derrière le profil du navigateur, un moteur de recherche ne
 * recevait que 28 caractères — l'en-tête, et rien d'autre.
 *
 * Ce qui dépend du profil est isolé dans des composants clients, qui proposent la saisie quand ils
 * n'ont rien à afficher.
 */
export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ResultTabs />
      <main className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-16 sm:px-6">
        <ProfileBar />
        {children}
        <p className="mt-8 text-caption leading-[1.6] text-faint text-pretty">
          Ces chiffres sont une estimation, pas un avis médical. La dépense réelle varie d’environ
          10 % d’une personne à l’autre. En cas de doute, parlez-en à un médecin ou à un
          diététicien.
        </p>
      </main>
    </>
  );
}
