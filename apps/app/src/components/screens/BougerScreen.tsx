import { buildPlan } from '@vitae/core/calc';
import { ETAT_VIDE } from '@vitae/core/constants';
import { kcal } from '@vitae/core/format';
import { buildNeat, movementSplit } from '@vitae/core/neat';
import { buildWeek } from '@vitae/core/training';
import { Text, View } from 'react-native';
import ColonnesResultat from '@/components/layout/ColonnesResultat';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Hero from '@/components/ui/Hero';
import { Ligne, Lignes } from '@/components/ui/Ligne';
import Overline from '@/components/ui/Overline';
import { TileRow } from '@/components/ui/Page';
import { Card, SplitBar } from '@/components/ui/primitives';
import SectionHeading from '@/components/ui/SectionHeading';
import SousOnglets from '@/components/ui/SousOnglets';
import StatTile from '@/components/ui/StatTile';
import { useProfile } from '@/state/ProfileProvider';
import NeatCard from './NeatCard';
import RappelsLien from './RappelsLien';
import WeekPlanCard from './WeekPlanCard';

/**
 * L'écran « Bouger » distingue deux choses qu'on additionne d'ordinaire à tort :
 * le mouvement du quotidien (NEAT), qui se répète tous les jours et ne se récupère pas, et les
 * séances, qui sont un stimulus à doser selon la personne. Elles ne se règlent pas de la même
 * façon et ne servent pas au même objectif.
 *
 * Elles se suivaient, séparées par un intertitre. La distinction était donc bien écrite, mais elle
 * ne se voyait pas : la page faisait quinze cartes, et qui venait consulter son programme de la
 * semaine traversait d'abord sept gestes du quotidien. Deux sous-onglets la coupent en deux, sans
 * en faire deux pages — le site continue de livrer les deux moitiés dans un seul fichier HTML.
 *
 * Ce qui reste **au-dessus** des onglets n'est pas un reste : ce sont les deux cartes qui parlent
 * des deux leviers à la fois, et qui justifient qu'ils soient séparés. Les descendre dans l'un des
 * deux onglets reviendrait à donner raison à l'un contre l'autre.
 */
export default function BougerScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile) return <CalculPrompt quoi={ETAT_VIDE.quoi.bouger} />;

  const plan = buildPlan(metrics, profile.daily, profile.sessions, profile.goal);
  const neat = buildNeat(metrics, profile.daily, profile.goal);
  const week = buildWeek(metrics, profile.daily, profile.sessions, profile.goal);
  const split = movementSplit(metrics, profile.daily, profile.sessions);

  return (
    <ColonnesResultat
      reponse={
        <Hero
          surtitre="Le mouvement"
          valeur={metrics.tdee - metrics.bmr}
          unite="kcal par jour"
          // La place du quotidien dans le mouvement total, séances lissées sur la semaine. C'est la
          // proportion que tout l'écran sert à défendre : elle se lit avant les deux onglets.
          part={split.neatPct / 100}
          legende="Part du quotidien, séances lissées mises à part"
        >
          Sur ce que vous dépensez chaque jour en plus de votre métabolisme de base, voici ce qui
          revient à vos journées et ce qui revient à vos séances.
        </Hero>
      }
    >
      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          D’où vient le mouvement, chez vous
        </Overline>
        <Text className="font-sans mb-[14px] text-base leading-[21px] text-muted">
          Sur les {kcal(metrics.tdee - metrics.bmr)} kcal que vous dépensez chaque jour en plus de
          votre métabolisme de base, voici ce qui revient à vos journées et ce qui revient à vos
          séances, une fois celles-ci lissées sur la semaine. C’est le partage que les deux onglets
          ci-dessous reprennent, l’un après l’autre.
        </Text>

        <SplitBar pct={split.neatPct} />

        <TileRow>
          <StatTile
            label={`Le quotidien · ${split.neatPct} %`}
            value={`${kcal(split.neat)} kcal`}
            note="tous les jours, sans récupération"
            accent
          />
          <StatTile
            label={`Les séances · ${split.sessionsPct} %`}
            value={`${kcal(split.sessions)} kcal`}
            note="lissées sur les sept jours"
          />
        </TileRow>
      </Card>

      {/* La répartition de l'écart en lignes, et non en barre et en tuiles comme la carte
            au-dessus : les deux cartes se suivent, elles ne parlent pas de la même chose — l'une
            partage un mouvement, l'autre partage un écart entre l'assiette et le mouvement — et
            deux fois le même dessin les faisait lire comme une redite. */}
      <Card className="px-[18px] py-4">
        <Overline niveau={2} className="mb-[6px]">
          {plan.title}
        </Overline>
        <Text
          className={`font-sans text-base leading-[21px] text-muted ${plan.hasSplit ? 'mb-3' : ''}`}
        >
          {plan.note}
        </Text>

        {plan.hasSplit ? (
          <>
            <Overline niveau={3} className="mb-1">
              {plan.splitLabel}
            </Overline>
            <Lignes>
              <Ligne
                label={plan.moveLabel}
                valeur={kcal(plan.moveKcal)}
                suffixe={`kcal · ${plan.movePct} %`}
              />
              <Ligne
                label={plan.foodLabel}
                valeur={kcal(plan.foodKcal)}
                suffixe={`kcal · ${plan.foodPct} %`}
              />
            </Lignes>
          </>
        ) : null}
      </Card>

      <SousOnglets
        aria="Les deux leviers du mouvement"
        onglets={[
          {
            cle: 'quotidien',
            label: 'Mon quotidien',
            icon: 'marche',
            contenu: (
              <View className="gap-3">
                <SectionHeading
                  icon="marche"
                  kicker="Premier levier · tous les jours"
                  title="Le mouvement du quotidien"
                  lead="Marcher, monter, porter, rester debout. Ce n’est pas du sport : c’est ce que fait votre corps entre les séances, et c’est ce qui creuse le plus grand écart entre deux personnes du même gabarit."
                />

                <NeatCard neat={neat} />

                {/* Juste après le catalogue de gestes, dont l'un est « se lever quelques minutes
                      par heure » : le rappel est la suite de cette phrase. Le réglage lui-même a
                      déménagé dans les réglages, où l'on vient chercher ce genre de chose ; ce qui
                      reste ici est le chemin, pas l'interrupteur. */}
                <RappelsLien />
              </View>
            ),
          },
          {
            cle: 'seances',
            label: 'Mes séances',
            icon: 'haltere',
            contenu: (
              <View className="gap-3">
                <SectionHeading
                  icon="haltere"
                  kicker="Second levier · deux à quatre fois par semaine"
                  title="Vos séances"
                  lead={`Un stimulus, pas un moyen de brûler des calories. Le programme ci-dessous est calculé pour ${metrics.age} ans, ${Math.round(metrics.poids)} kg et votre objectif : volume, repos et variantes en découlent.`}
                />

                <WeekPlanCard week={week} />
              </View>
            ),
          },
        ]}
      />
    </ColonnesResultat>
  );
}
