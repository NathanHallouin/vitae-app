'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FS } from '@/theme/theme';

/** Titre de page et phrase d'accroche : de quoi parle cette page, en une ligne. */
export default function PageIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <Box sx={{ mb: 3 }}>
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
  );
}
