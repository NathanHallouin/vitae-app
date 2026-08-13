import type { Metadata } from 'next';
import { BOUGER_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/explainers/Explainer';
import BougerScreen from '@/components/screens/BougerScreen';
import RunningDoodle from '@/components/ui/doodles/RunningDoodle';
import PageIntro from '@/components/ui/PageIntro';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Bouger pour dépenser plus : le quotidien et les séances',
  description:
    'Le mouvement du quotidien (NEAT) et les séances ne se règlent pas de la même façon. Ce que chacun apporte, et un programme au poids du corps sans matériel.',
  alternates: { canonical: `${SITE_URL}/bouger` },
};

/**
 * L'intro et les explications sont rendues sur le serveur ; seuls les chiffres, qui dépendent du
 * profil enregistré dans le navigateur, passent par un composant client.
 */
export default function Page() {
  return (
    <>
      <PageIntro
        title="Bouger"
        lead="Tout ne doit pas venir de l’assiette. Deux leviers, à ne pas confondre : ce que vous bougez dans la journée, et vos séances, sans salle ni matériel."
        illustration={<RunningDoodle />}
      />
      <BougerScreen />
      <Explainer data={BOUGER_EXPLAINER} />
    </>
  );
}
