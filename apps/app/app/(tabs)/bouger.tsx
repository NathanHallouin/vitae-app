import { BOUGER_EXPLAINER } from '@vitae/core/explainers';
import { SITE_URL } from '@vitae/core/site';
import Explainer from '@/components/Explainer';
import ResultScreen from '@/components/ResultScreen';
import Seo from '@/components/Seo';
import BougerScreen from '@/components/screens/BougerScreen';
import RunningDoodle from '@/components/ui/doodles/RunningDoodle';
import PageIntro from '@/components/ui/PageIntro';

export default function Page() {
  return (
    <>
      <Seo
        title="Bouger pour dépenser plus : le quotidien et les séances"
        description="Le mouvement du quotidien (NEAT) et les séances ne se règlent pas de la même façon. Ce que chacun apporte, et un programme au poids du corps sans matériel."
        canonical={`${SITE_URL}/bouger`}
      />
      <ResultScreen>
        <PageIntro
          title="Bouger"
          lead="Tout ne doit pas venir de l’assiette. Deux leviers, à ne pas confondre : ce que vous bougez dans la journée, et vos séances, sans salle ni matériel."
          illustration={<RunningDoodle />}
        />
        <BougerScreen />
        <Explainer data={BOUGER_EXPLAINER} />
      </ResultScreen>
    </>
  );
}
