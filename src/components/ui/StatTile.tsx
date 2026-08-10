'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { DISPLAY_FONT, FS } from '@/theme/theme';

/** Tuile de statistique sur fond `surface2` : libellé, valeur 22 px, note optionnelle. */
export default function StatTile({
  label,
  value,
  note,
  accent = false,
}: {
  label: ReactNode;
  value: ReactNode;
  note?: ReactNode;
  accent?: boolean;
}) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.tokens.surface2,
        borderRadius: '12px',
        p: '16px',
      })}
    >
      <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2, mb: '4px' })}>
        {label}
      </Typography>
      <Typography
        sx={(t) => ({
          fontFamily: DISPLAY_FONT,
          fontSize: FS.stat2,
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
          color: accent ? t.tokens.primaryInk : 'inherit',
        })}
      >
        {value}
      </Typography>
      {note ? (
        <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted, mt: '4px' })}>
          {note}
        </Typography>
      ) : null}
    </Box>
  );
}
