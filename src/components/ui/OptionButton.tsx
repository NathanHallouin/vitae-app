'use client';

import ButtonBase from '@mui/material/ButtonBase';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

/**
 * Option cliquable (sexe, activité, objectif, poids cible).
 * Sélectionnée : fond `primaryTint`, bordure et texte `primaryInk`.
 */
export default function OptionButton({
  selected,
  onClick,
  children,
  sx,
  ariaLabel,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  sx?: SxProps<Theme>;
  ariaLabel?: string;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-pressed={selected}
      aria-label={ariaLabel}
      sx={[
        (theme) => ({
          display: 'block',
          width: '100%',
          textAlign: 'left',
          borderRadius: 1,
          transition: 'all .15s ease',
          backgroundColor: selected ? theme.tokens.primaryTint : theme.tokens.surface,
          border: `1px solid ${selected ? theme.tokens.primaryInk : theme.tokens.border}`,
          color: selected ? theme.tokens.primaryInk : theme.tokens.text,
          '&:hover': { borderColor: theme.tokens.primaryInk },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </ButtonBase>
  );
}
