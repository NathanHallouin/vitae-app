import { POIDS_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/Explainer';
import ResultScreen from '@/components/ResultScreen';
import PoidsScreen from '@/components/screens/PoidsScreen';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <ResultScreen>
      <PageIntro
        title="Mon poids"
        lead="Où vous pourriez aller, en combien de temps, et ce que la courbe ne montre pas."
      />
      <PoidsScreen />
      <Explainer data={POIDS_EXPLAINER} />
    </ResultScreen>
  );
}
