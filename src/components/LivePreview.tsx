'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Metrics } from '@/lib/calc';
import { ACTIVITIES, goalByKey } from '@/lib/constants';
import { dec, kcal } from '@/lib/format';
import type { State } from '@/lib/state';
import { FS } from '@/theme/theme';
import Overline from './ui/Overline';

/** Panneau latéral « Aperçu en direct » : recalculé à chaque frappe. */
export default function LivePreview({ state, metrics }: { state: State; metrics: Metrics | null }) {
  const rows = [
    {
      label: 'Métabolisme de base',
      value: metrics ? `${kcal(metrics.bmr)} kcal` : '—',
      accent: false,
    },
    { label: 'Dépense totale', value: metrics ? `${kcal(metrics.tdee)} kcal` : '—', accent: false },
    {
      label: 'Apport recommandé',
      value: metrics ? `${kcal(metrics.target)} kcal` : '—',
      accent: true,
    },
    {
      label: 'IMC',
      value: metrics ? `${dec(metrics.bmi)} · ${metrics.band.label}` : '—',
      accent: false,
    },
  ];

  const hint = metrics
    ? `Les valeurs se mettent à jour à chaque modification. ${ACTIVITIES[state.activity].label}, objectif ${goalByKey(state.goal).label.toLowerCase()}.`
    : 'Renseignez sexe, âge, taille et poids pour voir les valeurs se calculer ici.';

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
      <Overline sx={{ mb: '14px' }}>Aperçu en direct</Overline>
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
        sx={(t) => ({ fontSize: FS.caption, lineHeight: 1.55, color: t.tokens.faint, mt: '14px' })}
      >
        {hint}
      </Typography>
    </Paper>
  );
}
