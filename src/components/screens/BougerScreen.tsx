'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildPlan } from '@/lib/calc';
import { kcal } from '@/lib/format';
import { buildNeat, movementSplit } from '@/lib/neat';
import { buildWeek } from '@/lib/training';
import { FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import RunningDoodle from '../ui/doodles/RunningDoodle';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';
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
    <Box>
      <PageIntro
        title="Bouger"
        lead="Tout ne doit pas venir de l’assiette. Deux leviers, à ne pas confondre : ce que vous bougez dans la journée, et vos séances, sans salle ni matériel."
        illustration={<RunningDoodle />}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '10px' }}>{plan.title}</Overline>
          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted,
              maxWidth: '68ch',
              textWrap: 'pretty',
              mb: plan.hasSplit ? '20px' : 0,
            })}
          >
            {plan.note}
          </Typography>

          {plan.hasSplit ? (
            <>
              <Overline sx={{ mb: '12px' }}>{plan.splitLabel}</Overline>
              <Box
                sx={{
                  display: 'flex',
                  height: 10,
                  borderRadius: '5px',
                  overflow: 'hidden',
                  mb: '12px',
                }}
              >
                <Box
                  sx={(t) => ({
                    height: 10,
                    backgroundColor: t.tokens.primaryInk,
                    width: `${plan.movePct}%`,
                  })}
                />
                <Box
                  sx={(t) => ({
                    height: 10,
                    backgroundColor: t.tokens.divider,
                    width: `${plan.foodPct}%`,
                  })}
                />
              </Box>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                }}
              >
                <StatTile
                  label={`${plan.moveLabel} · ${plan.movePct} %`}
                  value={`${kcal(plan.moveKcal)} kcal`}
                  accent
                />
                <StatTile
                  label={`${plan.foodLabel} · ${plan.foodPct} %`}
                  value={`${kcal(plan.foodKcal)} kcal`}
                />
              </Box>
            </>
          ) : null}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>D’où vient le mouvement, chez vous</Overline>
          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted,
              maxWidth: '68ch',
              textWrap: 'pretty',
              mb: '16px',
            })}
          >
            Sur les {kcal(metrics.tdee - metrics.bmr)} kcal que vous dépensez chaque jour en plus de
            votre métabolisme de base, voici ce qui revient à vos journées et ce qui revient à vos
            séances, une fois celles-ci lissées sur la semaine.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              height: 10,
              borderRadius: '5px',
              overflow: 'hidden',
              mb: '12px',
            }}
          >
            <Box
              sx={(t) => ({
                height: 10,
                backgroundColor: t.tokens.primaryInk,
                width: `${split.neatPct}%`,
              })}
            />
            <Box
              sx={(t) => ({
                height: 10,
                backgroundColor: t.tokens.divider,
                width: `${split.sessionsPct}%`,
              })}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
            }}
          >
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
          </Box>
        </Paper>

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
      </Box>
    </Box>
  );
}
