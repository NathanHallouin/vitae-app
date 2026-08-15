import { buildPlan } from '@vitae/core/calc';
import { kcal } from '@vitae/core/format';
import { buildNeat, movementSplit } from '@vitae/core/neat';
import { buildWeek } from '@vitae/core/training';
import { Text, View } from 'react-native';
import Apparition from '@/components/ui/Apparition';
import CalculPrompt from '@/components/ui/CalculPrompt';
import Overline from '@/components/ui/Overline';
import { TileRow } from '@/components/ui/Page';
import { Card, SplitBar } from '@/components/ui/primitives';
import SectionHeading from '@/components/ui/SectionHeading';
import StatTile from '@/components/ui/StatTile';
import { useProfile } from '@/state/ProfileProvider';
import NeatCard from './NeatCard';
import RappelsCard from './RappelsCard';
import WeekPlanCard from './WeekPlanCard';

/**
 * L'écran « Bouger » distingue deux choses qu'on additionne d'ordinaire à tort :
 * le mouvement du quotidien (NEAT), qui se répète tous les jours et ne se récupère pas, et les
 * séances, qui sont un stimulus à doser selon la personne. Elles ne se règlent pas de la même
 * façon et ne servent pas au même objectif : l'écran les traite donc l'une après l'autre.
 */
export default function BougerScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile)
    return (
      <CalculPrompt quoi="La part de l'écart que le mouvement peut prendre en charge, et votre programme." />
    );

  const plan = buildPlan(metrics, profile.daily, profile.sessions, profile.goal);
  const neat = buildNeat(metrics, profile.daily, profile.goal);
  const week = buildWeek(metrics, profile.daily, profile.sessions, profile.goal);
  const split = movementSplit(metrics, profile.daily, profile.sessions);

  return (
    <View className="gap-6">
      <Apparition depuis={1}>
        <Card className="p-6">
          <Overline niveau={2} className="mb-[10px]">
            {plan.title}
          </Overline>
          <Text
            className={`font-sans text-base leading-[22px] text-muted ${plan.hasSplit ? 'mb-5' : ''}`}
          >
            {plan.note}
          </Text>

          {plan.hasSplit ? (
            <>
              <Overline niveau={3} className="mb-3">
                {plan.splitLabel}
              </Overline>
              <SplitBar pct={plan.movePct} />
              <TileRow>
                <StatTile
                  label={`${plan.moveLabel} · ${plan.movePct} %`}
                  value={`${kcal(plan.moveKcal)} kcal`}
                  accent
                />
                <StatTile
                  label={`${plan.foodLabel} · ${plan.foodPct} %`}
                  value={`${kcal(plan.foodKcal)} kcal`}
                />
              </TileRow>
            </>
          ) : null}
        </Card>

        <Card className="p-6">
          <Overline niveau={2} className="mb-1">
            D’où vient le mouvement, chez vous
          </Overline>
          <Text className="font-sans mb-4 text-base leading-[22px] text-muted">
            Sur les {kcal(metrics.tdee - metrics.bmr)} kcal que vous dépensez chaque jour en plus de
            votre métabolisme de base, voici ce qui revient à vos journées et ce qui revient à vos
            séances, une fois celles-ci lissées sur la semaine.
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

        <SectionHeading
          icon="marche"
          kicker="Premier levier · tous les jours"
          title="Le mouvement du quotidien"
          lead="Marcher, monter, porter, rester debout. Ce n’est pas du sport : c’est ce que fait votre corps entre les séances, et c’est ce qui creuse le plus grand écart entre deux personnes du même gabarit."
        />

        <NeatCard neat={neat} />

        {/* Juste après le catalogue de gestes, dont le premier est « se lever quelques minutes par
          heure » : le réglage est la suite de cette phrase, pas une préférence à aller chercher. */}
        <RappelsCard />

        <SectionHeading
          icon="haltere"
          kicker="Second levier · deux à quatre fois par semaine"
          title="Vos séances"
          lead={`Un stimulus, pas un moyen de brûler des calories. Le programme ci-dessous est calculé pour ${metrics.age} ans, ${Math.round(metrics.poids)} kg et votre objectif : volume, repos et variantes en découlent.`}
        />

        <WeekPlanCard week={week} />
      </Apparition>
    </View>
  );
}
