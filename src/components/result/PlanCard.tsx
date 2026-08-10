'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Plan } from '@/lib/calc';
import { ACTIVITIES } from '@/lib/constants';
import { kcal } from '@/lib/format';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';
import StatTile from '../ui/StatTile';

/** « Construire l'écart » : répartition mouvement / assiette, exercices et conseils NEAT. */
export default function PlanCard({
  plan,
  goalLabel,
  activity,
}: {
  plan: Plan;
  goalLabel: string;
  activity: number;
}) {
  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 2,
          flexWrap: 'wrap',
          mb: 1,
        }}
      >
        <Typography variant="h3" component="h3">
          {plan.title}
        </Typography>
        <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2 })}>
          {goalLabel} · {ACTIVITIES[activity].label.toLowerCase()}
        </Typography>
      </Box>
      <Typography
        sx={(t) => ({
          fontSize: FS.base,
          lineHeight: 1.6,
          color: t.tokens.muted,
          mb: '20px',
          maxWidth: '68ch',
          textWrap: 'pretty',
        })}
      >
        {plan.note}
      </Typography>

      {plan.hasSplit ? (
        <Box
          sx={(t) => ({
            border: `1px solid ${t.tokens.border}`,
            borderRadius: 1,
            p: '18px',
            mb: 3,
          })}
        >
          <Overline sx={{ mb: '14px' }}>{plan.splitLabel}</Overline>
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
                backgroundColor: t.tokens.primary,
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
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '28px',
        }}
      >
        <Box>
          <Overline sx={{ mb: '12px' }}>Exercices au poids du corps</Overline>
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
              color: t.tokens.faint,
              mt: '12px',
            })}
          >
            Dépenses estimées pour votre poids actuel, à partir des équivalents métaboliques (MET).
            Comptez large : l&apos;appétit augmente souvent après l&apos;effort.
          </Typography>
        </Box>

        <Box>
          <Overline sx={{ mb: '12px' }}>Casser la sédentarité</Overline>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {plan.tips.map((tip) => (
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
        </Box>
      </Box>
    </Paper>
  );
}
