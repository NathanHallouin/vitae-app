'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { ACTIVITIES } from '@/lib/constants';
import type { State } from '@/lib/state';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';

export default function YourDataCard({
  state,
  onEdit,
  onReset,
}: {
  state: State;
  onEdit: () => void;
  onReset: () => void;
}) {
  const chips = [
    state.sexe === 'homme' ? 'Homme' : 'Femme',
    `${state.age} ans`,
    `${state.taille} cm`,
    `${state.poids} kg`,
    ACTIVITIES[state.activity].label,
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Overline sx={{ mb: '12px' }}>Vos données</Overline>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: '20px' }}>
        {chips.map((c) => (
          <Chip key={c} label={c} size="small" sx={{ height: 'auto', py: '6px', px: '4px' }} />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="outlined" onClick={onEdit}>
          Modifier
        </Button>
        <Button
          onClick={onReset}
          sx={(t) => ({ color: t.tokens.muted, '&:hover': { backgroundColor: 'rgba(0,0,0,.04)' } })}
        >
          Recommencer
        </Button>
      </Box>
      <Typography
        sx={(t) => ({ fontSize: FS.caption, lineHeight: 1.6, color: t.tokens.faint, mt: '20px' })}
      >
        Estimation statistique, pas un avis médical. La dépense réelle varie de ±10 % selon la
        génétique, la masse musculaire et l&apos;état hormonal.
      </Typography>
    </Paper>
  );
}
