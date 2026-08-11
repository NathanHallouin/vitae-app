'use client';

import { buildPlan } from '@/lib/calc';
import { kcal } from '@/lib/format';
import { buildNeat, movementSplit } from '@/lib/neat';
import { buildWeek } from '@/lib/training';
import { useProfile } from '../ProfileProvider';
import RunningDoodle from '../ui/doodles/RunningDoodle';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';
import { SplitBar } from '../ui/primitives';
import SectionHeading from '../ui/SectionHeading';
import StatTile from '../ui/StatTile';
import NeatCard from './NeatCard';
import WeekPlanCard from './WeekPlanCard';

/**
 * La page « Bouger » distingue deux choses qu'on additionne d'ordinaire à tort :
 * le mouvement du quotidien (NEAT), qui se répète tous les jours et ne se récupère pas, et les
 * séances, qui sont un stimulus à doser selon la personne. Elles ne se règlent pas de la même
 * façon et ne servent pas au même objectif : la page les traite donc l'une après l'autre.
 */
export default function BougerScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile) return null;

  const plan = buildPlan(metrics, profile.daily, profile.sessions, profile.goal);
  const neat = buildNeat(metrics, profile.daily, profile.goal);
  const week = buildWeek(metrics, profile.daily, profile.sessions, profile.goal);
  const split = movementSplit(metrics, profile.daily, profile.sessions);

  return (
    <div>
      <PageIntro
        title="Bouger"
        lead="Tout ne doit pas venir de l’assiette. Deux leviers, à ne pas confondre : ce que vous bougez dans la journée, et vos séances, sans salle ni matériel."
        illustration={<RunningDoodle />}
      />

      <div className="flex flex-col gap-6">
        <div className="card p-6">
          <Overline className="mb-[10px]">{plan.title}</Overline>
          <p
            className={`max-w-[68ch] text-base leading-[1.6] text-muted text-pretty ${
              plan.hasSplit ? 'mb-5' : ''
            }`}
          >
            {plan.note}
          </p>

          {plan.hasSplit ? (
            <>
              <Overline className="mb-3">{plan.splitLabel}</Overline>
              <SplitBar pct={plan.movePct} />
              <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
                <StatTile
                  label={`${plan.moveLabel} · ${plan.movePct} %`}
                  value={`${kcal(plan.moveKcal)} kcal`}
                  accent
                />
                <StatTile
                  label={`${plan.foodLabel} · ${plan.foodPct} %`}
                  value={`${kcal(plan.foodKcal)} kcal`}
                />
              </div>
            </>
          ) : null}
        </div>

        <div className="card p-6">
          <Overline className="mb-1">D’où vient le mouvement, chez vous</Overline>
          <p className="mb-4 max-w-[68ch] text-base leading-[1.6] text-muted text-pretty">
            Sur les {kcal(metrics.tdee - metrics.bmr)} kcal que vous dépensez chaque jour en plus de
            votre métabolisme de base, voici ce qui revient à vos journées et ce qui revient à vos
            séances, une fois celles-ci lissées sur la semaine.
          </p>

          <SplitBar pct={split.neatPct} />

          <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
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
          </div>
        </div>

        <SectionHeading
          icon="marche"
          kicker="Premier levier · tous les jours"
          title="Le mouvement du quotidien"
          lead="Marcher, monter, porter, rester debout. Ce n’est pas du sport : c’est ce que fait votre corps entre les séances, et c’est ce qui creuse le plus grand écart entre deux personnes du même gabarit."
        />

        <NeatCard neat={neat} />

        <SectionHeading
          icon="haltere"
          kicker="Second levier · deux à quatre fois par semaine"
          title="Vos séances"
          lead={`Un stimulus, pas un moyen de brûler des calories. Le programme ci-dessous est calculé pour ${metrics.age} ans, ${Math.round(metrics.poids)} kg et votre objectif : volume, repos et variantes en découlent.`}
        />

        <WeekPlanCard week={week} />
      </div>
    </div>
  );
}
