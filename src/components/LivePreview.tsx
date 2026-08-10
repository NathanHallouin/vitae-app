'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { computeMetrics } from '@/lib/calc';
import { ACTIVITIES, goalByKey } from '@/lib/constants';
import { dec, kcal } from '@/lib/format';
import type { FormState } from '@/lib/state';
import { FS } from '@/theme/theme';
import Overline from './ui/Overline';

/** Panneau latéral : les chiffres se recalculent à chaque frappe. */
export default function LivePreview({ form, age }: { form: FormState; age: number | null }) {
  const metrics = computeMetrics({
    sexe: form.sexe,
    age: age === null ? '' : String(age),
    taille: form.taille,
    poids: form.poids,
    activity: form.activity,
    goal: form.goal,
  });

  const rows = [
    {
      label: 'Au repos, vous brûlez',
      value: metrics ? `${kcal(metrics.bmr)} kcal` : '—',
      accent: false,
    },
    {
      label: 'Avec votre activité',
      value: metrics ? `${kcal(metrics.tdee)} kcal` : '—',
      accent: false,
    },
    {
      label: 'À manger par jour',
      value: metrics ? `${kcal(metrics.target)} kcal` : '—',
      accent: true,
    },
    {
      label: 'Corpulence (IMC)',
      value: metrics ? `${dec(metrics.bmi)} · ${metrics.band.label}` : '—',
      accent: false,
    },
  ];

  const hint = metrics
    ? `Calculé pour « ${ACTIVITIES[form.activity].label.toLowerCase()} », objectif « ${goalByKey(form.goal).label.toLowerCase()} ». Tout se met à jour pendant que vous tapez.`
    : 'Répondez aux questions : les chiffres se calculent ici au fur et à mesure.';

  return (
    <Paper
      component="aside"
      aria-live="polite"
      sx={{
        flex: '1 1 280px',
        maxWidth: { xs: '100%', md: 340 },
        alignSelf: 'flex-start',
        position: { xs: 'static', md: 'sticky' },
        top: 88,
        p: '20px',
      }}
    >
      <Overline sx={{ mb: '14px' }}>Vos chiffres en direct</Overline>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {rows.map((row) => (
          <Box
            key={row.label}
            sx={(t) => ({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '12px',
              py: '11px',
              borderTop: `1px solid ${t.tokens.divider}`,
            })}
          >
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted })}>
              {row.label}
            </Typography>
            <Typography
              sx={(t) => ({
                fontSize: FS.body,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                color: row.accent ? t.tokens.primaryInk : t.tokens.text,
                textAlign: 'right',
              })}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography
        sx={(t) => ({ fontSize: FS.caption, lineHeight: 1.55, color: t.tokens.muted2, mt: '14px' })}
      >
        {hint}
      </Typography>
    </Paper>
  );
}
