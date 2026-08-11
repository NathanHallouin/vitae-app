'use client';

import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

/** Surtitre 12 px majuscules, gris `muted2`, utilisé en tête de chaque carte. */
export default function Overline({
  children,
  sx,
  onDark = false,
}: {
  children: ReactNode;
  sx?: SxProps<Theme>;
  onDark?: boolean;
}) {
  return (
    <Typography
      variant="overline"
      component="div"
      sx={[
        (theme) => ({
          color: onDark ? 'inherit' : theme.tokens.muted2,
          opacity: onDark ? 0.8 : 1,
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Typography>
  );
}
