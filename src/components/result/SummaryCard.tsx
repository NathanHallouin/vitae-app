'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { bmiGaugePosition, type Metrics } from '@/lib/calc';
import { ACTIVITIES, BMI_BANDS, BMI_GAUGE_LABELS } from '@/lib/constants';
import { dec, kcal } from '@/lib/format';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';

const RULE = '1px solid rgba(255,255,255,.25)';

/** Carte principale : MB, DET et IMC sur fond `primary`. */
export default function SummaryCard({ metrics, activity }: { metrics: Metrics; activity: number }) {
  const pos = bmiGaugePosition(metrics.bmi);

  return (
    <Paper elevation={3} sx={(t) => ({ backgroundColor: t.tokens.primary, color: '#fff', p: 4 })}>
      <Overline onDark>Métabolisme de base</Overline>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, m: '12px 0 4px' }}>
        <Typography
          component="p"
          sx={{
            fontSize: FS.hero,
            fontWeight: 300,
            lineHeight: 1,
            letterSpacing: '-.01em',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {kcal(metrics.bmr)}
        </Typography>
        <Typography sx={{ fontSize: FS.stat3, opacity: 0.85 }}>kcal / jour</Typography>
      </Box>
      <Typography sx={{ fontSize: FS.base, lineHeight: 1.6, opacity: 0.85, mb: '28px' }}>
        au repos absolu, sans aucune activité
      </Typography>

      <Box sx={{ borderTop: RULE, pt: '20px' }}>
        <Overline onDark>Dépense totale · {ACTIVITIES[activity].label.toLowerCase()}</Overline>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 1 }}>
          <Typography sx={{ fontSize: FS.stat, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {kcal(metrics.tdee)}
          </Typography>
          <Typography sx={{ fontSize: FS.option, opacity: 0.85 }}>kcal / jour</Typography>
        </Box>
      </Box>

      <Box sx={{ borderTop: RULE, mt: '20px', pt: '20px' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '12px',
          }}
        >
          <Overline onDark>IMC</Overline>
          <Typography sx={{ fontSize: FS.small, opacity: 0.85 }}>
            Poids santé : {metrics.healthyMin} – {metrics.healthyMax} kg
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: '10px', m: '8px 0 14px' }}>
          <Typography sx={{ fontSize: FS.stat, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {dec(metrics.bmi)}
          </Typography>
          <Typography sx={{ fontSize: FS.option, fontWeight: 500 }}>
            {metrics.band.label}
          </Typography>
        </Box>

        <Box
          role="img"
          aria-label={`IMC ${dec(metrics.bmi)} : ${metrics.band.label}`}
          sx={{ position: 'relative', height: 8, display: 'flex', gap: '2px' }}
        >
          {BMI_BANDS.slice(0, 4).map((b) => (
            <Box
              key={b.label}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: '4px',
                backgroundColor: b.color,
                opacity: 0.9,
              }}
            />
          ))}
          <Box
            sx={{
              position: 'absolute',
              top: -4,
              left: `${pos}%`,
              width: 4,
              height: 16,
              borderRadius: '2px',
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 2px rgba(0,0,0,.18)',
              transform: 'translateX(-2px)',
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: FS.micro,
            opacity: 0.8,
            mt: '6px',
          }}
        >
          {BMI_GAUGE_LABELS.map((label) => (
            <Box component="span" key={label}>
              {label}
            </Box>
          ))}
        </Box>
        <Typography sx={{ fontSize: FS.caption, lineHeight: 1.5, opacity: 0.75, mt: '10px' }}>
          L&apos;IMC ne distingue pas muscle et graisse : il surestime la corpulence des personnes
          très musclées.
        </Typography>
      </Box>
    </Paper>
  );
}
