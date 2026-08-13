import { ALIMENTATION_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/Explainer';
import ResultScreen from '@/components/ResultScreen';
import AlimentationScreen from '@/components/screens/AlimentationScreen';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <ResultScreen>
      <PageIntro
        title="Ce que je mange"
        lead="Combien manger chaque jour pour aller dans le sens de votre objectif, et comment répartir ces calories."
      />
      <AlimentationScreen />
      <Explainer data={ALIMENTATION_EXPLAINER} />
    </ResultScreen>
  );
}
