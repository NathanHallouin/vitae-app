'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FS } from '@/theme/theme';
import Icon, { type IconName } from './Icon';

/**
 * Tête de section à l'intérieur d'une page, avec un filet coloré à gauche.
 * Sert à séparer nettement deux registres qu'on confond facilement (ici le mouvement du
 * quotidien et les séances) sans passer par deux pages distinctes.
 */
export default function SectionHeading({
  kicker,
  title,
  lead,
  icon,
}: {
  kicker: string;
  title: string;
  lead: string;
  icon?: IconName;
}) {
  return (
    <Box
      sx={(t) => ({
        borderLeft: `3px solid ${t.tokens.primaryInk}`,
        pl: '18px',
        mt: 2,
      })}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '2px' }}>
        {icon ? (
          <Box sx={(t) => ({ color: t.tokens.primaryInk, display: 'flex' })}>
            <Icon name={icon} size={16} />
          </Box>
        ) : null}
        <Typography variant="overline" component="div" sx={(t) => ({ color: t.tokens.primaryInk })}>
          {kicker}
        </Typography>
      </Box>
      <Typography variant="h2" component="h2" sx={{ fontSize: FS.h3, mb: '6px' }}>
        {title}
      </Typography>
      <Typography
        sx={(t) => ({
          fontSize: FS.base,
          lineHeight: 1.6,
          color: t.tokens.muted,
          maxWidth: '68ch',
          textWrap: 'pretty',
        })}
      >
        {lead}
      </Typography>
    </Box>
  );
}
