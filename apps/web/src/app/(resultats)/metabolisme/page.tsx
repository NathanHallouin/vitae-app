import type { Metadata } from 'next';
import { METABOLISME_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/explainers/Explainer';
import MetabolismeScreen from '@/components/screens/MetabolismeScreen';
import MeditatingDoodle from '@/components/ui/doodles/MeditatingDoodle';
import PageIntro from '@/components/ui/PageIntro';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Métabolisme de base : ce que votre corps dépense au repos',
  description:
    'Comprendre votre métabolisme de base et votre dépense sur une journée : la formule de Mifflin-St Jeor, ce qui la fait varier, et ce que l’IMC dit vraiment.',
  alternates: { canonical: `${SITE_URL}/metabolisme` },
};

/**
 * L'intro et les explications sont rendues sur le serveur ; seuls les chiffres, qui dépendent du
 * profil enregistré dans le navigateur, passent par un composant client.
 */
export default function Page() {
  return (
    <>
      <PageIntro
        title="Mon métabolisme"
        lead="Ce que votre corps dépense sur une journée complète, et d’où vient cette dépense."
        illustration={<MeditatingDoodle />}
      />
      <MetabolismeScreen />
      <Explainer data={METABOLISME_EXPLAINER} />
    </>
  );
}
