'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { buildPlan } from '@/lib/calc';
import { kcal } from '@/lib/format';
import { buildWeek } from '@/lib/training';
import { FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import RunningDoodle from '../ui/doodles/RunningDoodle';
import Overline from '../ui/Overline';
import PageIntro from '../ui/PageIntro';
import StatTile from '../ui/StatTile';
import WeekPlanCard from './WeekPlanCard';

export default function BougerScreen() {
  const { metrics, profile } = useProfile();
  if (!metrics || !profile) return null;

  const plan = buildPlan(metrics, profile.daily, profile.sessions, profile.goal);
  const week = buildWeek(metrics, profile.daily, profile.sessions, profile.goal);

  return (
    <Box>
      <PageIntro
        title="Bouger"
        lead="Tout ne doit pas venir de l’assiette. Voici ce que le mouvement peut prendre en charge, et le programme qui va avec — sans salle ni matériel."
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

        <WeekPlanCard week={week} />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 3,
            alignItems: 'start',
          }}
        >
          <Paper sx={{ p: 3 }}>
            <Overline sx={{ mb: '4px' }}>Ce que dépense chaque exercice</Overline>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '6px' })}>
              Les calories indiquées sont estimées pour votre poids actuel.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {plan.moves.map((m) => (
                <Box
                  key={m.label}
                  sx={(t) => ({
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    py: '12px',
                    borderTop: `1px solid ${t.tokens.divider}`,
                  })}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: FS.option, fontWeight: 500, mb: '2px' }}>
                      {m.label}
                    </Typography>
                    <Typography
                      sx={(t) => ({ fontSize: FS.small, lineHeight: 1.5, color: t.tokens.muted })}
                    >
                      {m.detail}
                    </Typography>
                  </Box>
                  <Typography
                    sx={(t) => ({
                      flex: 'none',
                      fontSize: FS.small,
                      fontWeight: 500,
                      color: t.tokens.primaryInk,
                      fontVariantNumeric: 'tabular-nums',
                      whiteSpace: 'nowrap',
                      pt: '1px',
                    })}
                  >
                    ≈ {m.kcal} kcal
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography
              sx={(t) => ({
                fontSize: FS.caption,
                lineHeight: 1.6,
                color: t.tokens.muted2,
                mt: '12px',
              })}
            >
              Comptez large : on a souvent plus faim après l’effort, ce qui annule une partie de ce
              qui a été dépensé.
            </Typography>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Overline sx={{ mb: '4px' }}>Bouger sans y penser</Overline>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '14px' })}>
              Ce que vous faites hors séance compte autant que les séances.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[week.steps, ...plan.tips].map((tip) => (
                <Box
                  key={tip}
                  sx={(t) => ({
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    backgroundColor: t.tokens.surface2,
                    borderRadius: 1,
                    p: '14px',
                  })}
                >
                  <Box
                    aria-hidden
                    sx={(t) => ({
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: t.tokens.primaryInk,
                      flex: 'none',
                      mt: '7px',
                    })}
                  />
                  <Typography sx={{ fontSize: FS.base, lineHeight: 1.55 }}>{tip}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
