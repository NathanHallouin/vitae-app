'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { FS } from '@/theme/theme';

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
        borderRadius: 1,
        p: '14px',
      })}
    >
      <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2, mb: '4px' })}>
        {label}
      </Typography>
      <Typography
        sx={(t) => ({
          fontSize: FS.stat2,
          fontWeight: 500,
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
