'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FS } from '@/theme/theme';

/**
 * Titre de page et phrase d'accroche : de quoi parle cette page, en une ligne.
 *
 * L'illustration est décorative et n'apporte rien au sens : elle disparaît sous `md` plutôt que
 * de rétrécir, pour laisser la largeur au texte sur mobile.
 */
export default function PageIntro({
  title,
  lead,
  illustration,
}: {
  title: string;
  lead: string;
  illustration?: React.ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, mb: 3 }}>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="h2" component="h1" sx={{ mb: '6px' }}>
          {title}
        </Typography>
        <Typography
          sx={(t) => ({
            fontSize: FS.body,
            lineHeight: 1.6,
            color: t.tokens.muted,
            maxWidth: '62ch',
            textWrap: 'pretty',
          })}
        >
          {lead}
        </Typography>
      </Box>

      {illustration ? (
        <Box
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 190,
            flex: 'none',
          }}
        >
          {illustration}
        </Box>
      ) : null}
    </Box>
  );
}
