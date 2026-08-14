import { ALIMENTATION_EXPLAINER } from '@vitae/core/explainers';
import { SITE_URL } from '@vitae/core/site';
import ResultScreen from '@/components/layout/ResultScreen';
import Seo from '@/components/layout/Seo';
import AlimentationScreen from '@/components/screens/AlimentationScreen';
import Explainer from '@/components/screens/Explainer';
import PlantDoodle from '@/components/ui/doodles/PlantDoodle';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <>
      <Seo
        title="Combien manger par jour : fourchette, protéines et répartition"
        description="Combien de calories manger selon votre objectif, combien de protéines, de lipides et de glucides, et pourquoi une fourchette plutôt qu’un chiffre précis."
        canonical={`${SITE_URL}/alimentation`}
      />
      <ResultScreen>
        <PageIntro
          title="Ce que je mange"
          lead="Combien manger chaque jour pour aller dans le sens de votre objectif, et comment répartir ces calories."
          illustration={<PlantDoodle />}
        />
        <AlimentationScreen />
        <Explainer data={ALIMENTATION_EXPLAINER} />
      </ResultScreen>
    </>
  );
}
