import type { Metadata } from 'next';
import { POIDS_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/explainers/Explainer';
import PoidsScreen from '@/components/screens/PoidsScreen';
import LevitateDoodle from '@/components/ui/doodles/LevitateDoodle';
import PageIntro from '@/components/ui/PageIntro';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Quel poids viser, et en combien de temps',
  description:
    'Trois repères de poids calculés pour votre taille, la durée réaliste pour les atteindre, et ce à quoi s’attendre en chemin : paliers, variations d’eau, ralentissements.',
  alternates: { canonical: `${SITE_URL}/poids` },
};

/**
 * L'intro et les explications sont rendues sur le serveur ; seuls les chiffres, qui dépendent du
 * profil enregistré dans le navigateur, passent par un composant client.
 */
export default function Page() {
  return (
    <>
      <PageIntro
        title="Mon poids"
        lead="Où vous pourriez aller, en combien de temps, et ce que la courbe ne montre pas."
        illustration={<LevitateDoodle />}
      />
      <PoidsScreen />
      <Explainer data={POIDS_EXPLAINER} />
    </>
  );
}
