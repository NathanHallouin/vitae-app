'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Macro, Metrics } from '@/lib/calc';
import { kcal } from '@/lib/format';
import { buildDayPlan, eatingTips } from '@/lib/nutrition';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';

/** Journée type : les portions sont calculées pour atteindre les macros affichées au-dessus. */
export default function DayPlanCard({ metrics, macros }: { metrics: Metrics; macros: Macro[] }) {
  const plan = buildDayPlan(metrics, macros);
  const tips = eatingTips(metrics);
  const ecart = Math.abs(plan.gap);

  return (
    <Paper sx={{ p: 3 }}>
      <Overline sx={{ mb: '4px' }}>Une journée qui tombe juste</Overline>
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
        Voici un exemple de journée qui atteint vos {kcal(metrics.target)} kcal et vos{' '}
        {macros[0].grams} g de protéines. Ce n’est pas un régime à suivre à la lettre : c’est un
        ordre de grandeur des quantités, pour savoir à quoi ressemble votre objectif dans une
        assiette.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
        }}
      >
        {plan.meals.map((meal) => (
          <Box
            key={meal.name}
            sx={(t) => ({
              border: `1px solid ${t.tokens.border}`,
              borderRadius: 1,
              p: '16px',
            })}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                gap: 1,
                mb: '10px',
              }}
            >
              <Typography sx={{ fontSize: FS.option, fontWeight: 500 }}>{meal.name}</Typography>
              <Typography
                sx={(t) => ({
                  fontSize: FS.small,
                  color: t.tokens.muted2,
                  fontVariantNumeric: 'tabular-nums',
                })}
              >
                {kcal(meal.kcal)} kcal · {meal.prot} g de protéines
              </Typography>
            </Box>

            {meal.items
              .filter((item) => item.grams > 0)
              .map((item) => (
                <Box
                  key={item.label}
                  sx={(t) => ({ py: '8px', borderTop: `1px solid ${t.tokens.divider}` })}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: FS.base }}>{item.label}</Typography>
                    <Typography
                      sx={(t) => ({
                        fontSize: FS.base,
                        fontWeight: 500,
                        color: t.tokens.primaryInk,
                        fontVariantNumeric: 'tabular-nums',
                        whiteSpace: 'nowrap',
                      })}
                    >
                      {item.grams} g
                    </Typography>
                  </Box>
                  {item.unit || item.swap ? (
                    <Typography
                      sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2, mt: '2px' })}
                    >
                      {[item.unit, item.swap].filter(Boolean).join(' · ')}
                    </Typography>
                  ) : null}
                </Box>
              ))}
          </Box>
        ))}
      </Box>

      <Typography
        sx={(t) => ({
          fontSize: FS.small,
          lineHeight: 1.6,
          color: t.tokens.muted,
          mt: '18px',
          maxWidth: '68ch',
        })}
      >
        Total de la journée : {kcal(plan.kcal)} kcal, {plan.prot} g de protéines et environ{' '}
        {plan.fibre} g de fibres.{' '}
        {ecart <= 60
          ? 'Soit votre objectif, à quelques dizaines de calories près — un écart normal, sans importance.'
          : `Soit ${ecart} kcal ${plan.gap > 0 ? 'de plus' : 'de moins'} que la cible : ajustez la portion de féculent au repas qui vous arrange.`}
        {plan.fibre > 40
          ? ' À ce volume, tout prendre en version complète fait beaucoup de fibres d’un coup : alternez avec du riz ou des pâtes classiques pour éviter les inconforts digestifs.'
          : ''}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px', mt: '20px' }}>
        {tips.map((tip) => (
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
  );
}
