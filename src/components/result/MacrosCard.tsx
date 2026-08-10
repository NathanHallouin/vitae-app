'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Macro } from '@/lib/calc';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';

export default function MacrosCard({ macros }: { macros: Macro[] }) {
  return (
    <Paper sx={{ p: 3 }}>
      <Overline sx={{ mb: 2 }}>Répartition indicative</Overline>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {macros.map((m) => (
          <Box key={m.label}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                fontSize: FS.base,
                mb: '6px',
              }}
            >
              <Box component="span" sx={{ fontWeight: 500 }}>
                {m.label}
              </Box>
              <Typography
                component="span"
                sx={(t) => ({
                  fontSize: FS.base,
                  color: t.tokens.muted,
                  fontVariantNumeric: 'tabular-nums',
                })}
              >
                {m.grams} g · {m.kcal} kcal
              </Typography>
            </Box>
            <Box
              sx={(t) => ({
                height: 6,
                backgroundColor: t.tokens.divider,
                borderRadius: '3px',
                overflow: 'hidden',
              })}
            >
              <Box
                sx={{
                  height: '100%',
                  borderRadius: '3px',
                  width: `${m.pct}%`,
                  backgroundColor: m.color,
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
