import type { Metadata } from 'next';
import { ALIMENTATION_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/explainers/Explainer';
import AlimentationScreen from '@/components/screens/AlimentationScreen';
import PlantDoodle from '@/components/ui/doodles/PlantDoodle';
import PageIntro from '@/components/ui/PageIntro';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Combien manger par jour : fourchette, protéines et répartition',
  description:
    'Combien de calories manger selon votre objectif, combien de protéines, de lipides et de glucides, et pourquoi une fourchette plutôt qu’un chiffre précis.',
  alternates: { canonical: `${SITE_URL}/alimentation` },
};

/**
 * L'intro et les explications sont rendues sur le serveur ; seuls les chiffres, qui dépendent du
 * profil enregistré dans le navigateur, passent par un composant client.
 */
export default function Page() {
  return (
    <>
      <PageIntro
        title="Ce que je mange"
        lead="Combien manger chaque jour pour aller dans le sens de votre objectif, et comment répartir ces calories."
        illustration={<PlantDoodle />}
      />
      <AlimentationScreen />
      <Explainer data={ALIMENTATION_EXPLAINER} />
    </>
  );
}
