import { METABOLISME_EXPLAINER } from '@vitae/core/explainers';
import { SITE_URL } from '@vitae/core/site';
import ResultScreen from '@/components/layout/ResultScreen';
import Seo from '@/components/layout/Seo';
import Explainer from '@/components/screens/Explainer';
import MetabolismeScreen from '@/components/screens/MetabolismeScreen';
import MeditatingDoodle from '@/components/ui/doodles/MeditatingDoodle';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <>
      <Seo
        title="Métabolisme de base : ce que votre corps dépense au repos"
        description="Comprendre votre métabolisme de base et votre dépense sur une journée : la formule de Mifflin-St Jeor, ce qui la fait varier, et ce que l’IMC dit vraiment."
        canonical={`${SITE_URL}/metabolisme`}
      />
      <ResultScreen>
        <PageIntro
          title="Mon métabolisme"
          lead="Ce que votre corps dépense sur une journée complète, et d’où vient cette dépense."
          illustration={<MeditatingDoodle />}
        />
        <MetabolismeScreen />
        <Explainer data={METABOLISME_EXPLAINER} />
      </ResultScreen>
    </>
  );
}
