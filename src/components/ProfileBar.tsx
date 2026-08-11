'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { activityLabel } from '@/lib/constants';
import { FROM_NAV } from '@/lib/nav';
import { FS } from '@/theme/theme';
import { useProfile } from './ProfileProvider';

/**
 * Rappel discret de ce sur quoi les chiffres sont calculés, présent sur toutes les pages.
 *
 * Deux versions du même rappel. Sur mobile, la liste complète prenait quatre lignes en tête de
 * chaque page, avant le premier chiffre : on n'y garde que ce qui change souvent, à
 * commencer par le poids, puisque c'est lui qu'on vient corriger. Le détail reste accessible d'une touche.
 */
export default function ProfileBar() {
  const { profile, age, metrics } = useProfile();
  if (!profile || !metrics) return null;

  const identite = [
    profile.sexe === 'homme' ? 'Homme' : 'Femme',
    age === null ? null : `${age} ans`,
  ].filter(Boolean);

  const court = [`${profile.poids} kg`, ...identite].join(' · ');
  const complet = [
    ...identite,
    `${profile.taille} cm`,
    `${profile.poids} kg`,
    activityLabel(profile.daily, profile.sessions),
    metrics.goal.label.toLowerCase(),
  ].join(' · ');

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
      <Typography
        sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2, minWidth: 0, flex: 1 })}
      >
        <Box component="span" sx={{ display: 'none', [FROM_NAV]: { display: 'inline' } }}>
          Calculé pour : {complet}
        </Box>
        <Box component="span" sx={{ display: 'inline', [FROM_NAV]: { display: 'none' } }}>
          Calculé pour {court}
        </Box>
      </Typography>
      <Button
        component={Link}
        href="/profil"
        size="small"
        sx={{ fontSize: FS.caption, p: '4px 8px', flex: 'none' }}
      >
        Modifier
      </Button>
    </Box>
  );
}
