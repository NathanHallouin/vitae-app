'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Metrics, Projection } from '@/lib/calc';
import { dec, fmtKg, fmtWeekly, monthIn } from '@/lib/format';
import { FS } from '@/theme/theme';
import OptionButton from '../ui/OptionButton';
import Overline from '../ui/Overline';
import ProjectionChart from './ProjectionChart';

export default function TargetWeightCard({
  metrics,
  projection,
  onSelect,
}: {
  metrics: Metrics;
  projection: Projection;
  onSelect: (key: string) => void;
}) {
  const targetLabel = `${dec(projection.selected.w)} kg`;

  return (
    <Paper sx={{ p: 3 }}>
      <Overline sx={{ mb: '14px' }}>Poids cible</Overline>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '10px',
          mb: '20px',
        }}
      >
        {projection.options.map((o) => (
          <OptionButton
            key={o.key}
            selected={o.key === projection.key}
            onClick={() => onSelect(o.key)}
            sx={{ p: '12px 14px' }}
          >
            <Typography
              sx={{
                fontSize: FS.stat3,
                fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
                color: 'inherit',
              }}
            >
              {dec(o.w)} kg
            </Typography>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mt: '2px' })}>
              {o.label}
            </Typography>
            <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.faint })}>
              {o.sub}
            </Typography>
          </OptionButton>
        ))}
      </Box>

      {projection.coherent ? (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '20px', mb: 1 }}>
            <Stat label="Écart à combler" value={fmtKg(projection.selected.w - metrics.poids)} />
            <Stat
              label="Durée estimée"
              value={
                <>
                  {projection.weeks} {projection.weeks > 1 ? 'semaines' : 'semaine'}{' '}
                  <Box
                    component="span"
                    sx={(t) => ({ fontSize: FS.small, fontWeight: 400, color: t.tokens.muted })}
                  >
                    ≈ {dec(Math.round(projection.months * 10) / 10)} mois
                  </Box>
                </>
              }
            />
            <Stat label="Rythme" value={fmtWeekly((projection.rate * 7700) / 7)} />
            <Stat label="Objectif atteint vers" value={monthIn(projection.weeks)} />
          </Box>

          <Box
            sx={(t) => ({
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              fontSize: FS.caption,
              color: t.tokens.faint,
              m: '14px 0 4px',
            })}
          >
            <span>
              Poids projeté, échelle {projection.hiLabel} → {projection.loLabel}
            </span>
            <span>Cible {targetLabel}</span>
          </Box>

          <ProjectionChart projection={projection} targetLabel={targetLabel} />
        </>
      ) : null}

      <Typography
        sx={(t) => ({
          fontSize: FS.caption,
          lineHeight: 1.6,
          color: t.tokens.faint,
          mt: '14px',
          textWrap: 'pretty',
        })}
      >
        {projection.note}
      </Typography>
    </Paper>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: FS.stat3, fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}
