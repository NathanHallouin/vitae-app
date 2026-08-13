import { BOUGER_EXPLAINER } from '@vitae/core/explainers';
import Explainer from '@/components/Explainer';
import ResultScreen from '@/components/ResultScreen';
import BougerScreen from '@/components/screens/BougerScreen';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <ResultScreen>
      <PageIntro
        title="Bouger"
        lead="Tout ne doit pas venir de l’assiette. Deux leviers, à ne pas confondre : ce que vous bougez dans la journée, et vos séances, sans salle ni matériel."
      />
      <BougerScreen />
      <Explainer data={BOUGER_EXPLAINER} />
    </ResultScreen>
  );
}
