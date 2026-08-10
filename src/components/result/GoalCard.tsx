'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { type Metrics, rangeBar, rangeCaption, warningText } from '@/lib/calc';
import { TDEE_MARKER_COLOR } from '@/lib/constants';
import { fmtGap, fmtWeekly, kcal } from '@/lib/format';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';
import StatTile from '../ui/StatTile';

/** Apport recommandé + fourchette min / max situées entre le MB et la DET. */
export default function GoalCard({ metrics }: { metrics: Metrics }) {
  const bar = rangeBar(metrics);
  const warning = warningText(metrics);
  const gapAtMin = metrics.min - metrics.tdee;
  const gapAtMax = metrics.max - metrics.tdee;

  return (
    <Paper sx={{ p: 3 }}>
      <Overline>Objectif · {metrics.goal.label}</Overline>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, m: '10px 0 6px' }}>
        <Typography
          sx={(t) => ({
            fontSize: FS.display,
            lineHeight: 1,
            color: t.tokens.primaryInk,
            fontVariantNumeric: 'tabular-nums',
          })}
        >
          {kcal(metrics.target)}
        </Typography>
        <Typography sx={(t) => ({ fontSize: FS.option, color: t.tokens.muted })}>
          kcal / jour recommandées
        </Typography>
      </Box>
      <Typography
        sx={(t) => ({
          fontSize: FS.base,
          lineHeight: 1.6,
          color: t.tokens.muted,
          textWrap: 'pretty',
        })}
      >
        {metrics.goal.note}
      </Typography>

      <Box sx={(t) => ({ borderTop: `1px solid ${t.tokens.divider}`, mt: '20px', pt: '18px' })}>
        <Overline sx={{ mb: '14px' }}>{rangeCaption(metrics.goal.key)}</Overline>

        <Box
          sx={(t) => ({
            position: 'relative',
            height: 10,
            backgroundColor: t.tokens.divider,
            borderRadius: '5px',
            mb: '10px',
          })}
        >
          <Box
            sx={(t) => ({
              position: 'absolute',
              top: 0,
              height: 10,
              borderRadius: '5px',
              backgroundColor: t.tokens.primaryTint,
              left: `${bar.low}%`,
              width: `${bar.width}%`,
            })}
          />
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              top: -3,
              width: 2,
              height: 16,
              backgroundColor: TDEE_MARKER_COLOR,
              left: `${bar.tdee}%`,
            }}
          />
        </Box>
        <Box
          sx={(t) => ({
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: FS.micro,
            color: t.tokens.faint,
            mb: '18px',
          })}
        >
          <span>Métabolisme de base</span>
          <span>Dépense totale</span>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <StatTile
            label="Minimum"
            value={kcal(metrics.min)}
            note={`${fmtGap(gapAtMin)} · ${fmtWeekly(gapAtMin)}`}
          />
          <StatTile
            label="Maximum"
            value={kcal(metrics.max)}
            note={`${fmtGap(gapAtMax)} · ${fmtWeekly(gapAtMax)}`}
          />
        </Box>

        {warning ? (
          <Box
            sx={(t) => ({
              backgroundColor: t.tokens.warnBg,
              color: t.tokens.warnInk,
              borderRadius: 1,
              p: '12px 14px',
              fontSize: FS.small,
              lineHeight: 1.55,
              mt: '12px',
              textWrap: 'pretty',
            })}
          >
            {warning}
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}
