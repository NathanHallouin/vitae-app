import { POIDS_EXPLAINER } from '@vitae/core/explainers';
import { SITE_URL } from '@vitae/core/site';
import ResultScreen from '@/components/layout/ResultScreen';
import Seo from '@/components/layout/Seo';
import Explainer from '@/components/screens/Explainer';
import PoidsScreen from '@/components/screens/PoidsScreen';
import LevitateDoodle from '@/components/ui/doodles/LevitateDoodle';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <>
      <Seo
        title="Quel poids viser, et en combien de temps"
        description="Trois repères de poids calculés pour votre taille, la durée réaliste pour les atteindre, et ce à quoi s’attendre en chemin : paliers, variations d’eau, ralentissements."
        canonical={`${SITE_URL}/poids`}
      />
      <ResultScreen>
        <PageIntro
          title="Mon poids"
          lead="Où vous pourriez aller, en combien de temps, et ce que la courbe ne montre pas."
          illustration={<LevitateDoodle />}
        />
        <PoidsScreen />
        <Explainer data={POIDS_EXPLAINER} />
      </ResultScreen>
    </>
  );
}
