'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { ACTIVITIES } from '@/lib/constants';
import { FS } from '@/theme/theme';
import { useProfile } from './ProfileProvider';

/** Rappel discret de ce sur quoi les chiffres sont calculés, présent sur toutes les pages. */
export default function ProfileBar() {
  const { profile, age, metrics } = useProfile();
  if (!profile || !metrics) return null;

  const parts = [
    profile.sexe === 'homme' ? 'Homme' : 'Femme',
    age === null ? null : `${age} ans`,
    `${profile.taille} cm`,
    `${profile.poids} kg`,
    ACTIVITIES[profile.activity].label.toLowerCase(),
    metrics.goal.label.toLowerCase(),
  ].filter(Boolean);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1,
        mb: 3,
      }}
    >
      <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2 })}>
        Calculé pour : {parts.join(' · ')}
      </Typography>
      <Button
        component={Link}
        href="/profil"
        size="small"
        sx={{ fontSize: FS.caption, p: '4px 8px' }}
      >
        Modifier
      </Button>
    </Box>
  );
}
