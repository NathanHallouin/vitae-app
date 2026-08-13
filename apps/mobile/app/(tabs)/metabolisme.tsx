import { METABOLISME_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/Explainer';
import ResultScreen from '@/components/ResultScreen';
import MetabolismeScreen from '@/components/screens/MetabolismeScreen';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <ResultScreen>
      <PageIntro
        title="Mon métabolisme"
        lead="Ce que votre corps dépense sur une journée complète, et d’où vient cette dépense."
      />
      <MetabolismeScreen />
      <Explainer data={METABOLISME_EXPLAINER} />
    </ResultScreen>
  );
}
