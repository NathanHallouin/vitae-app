'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { kcal } from '@/lib/format';
import type { NeatPlan } from '@/lib/neat';
import { FS } from '@/theme/theme';
import Overline from '../ui/Overline';
import StatTile from '../ui/StatTile';

/**
 * Le mouvement du quotidien, présenté séparément des séances.
 * Volontairement sans séries ni répétitions : ce qui compte ici est la répétition quotidienne,
 * pas la performance. Les kcal affichées sont calculées pour le poids de la personne.
 */
export default function NeatCard({ neat }: { neat: NeatPlan }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Overline sx={{ mb: '10px' }}>Ce que votre quotidien dépense déjà</Overline>
        <Typography
          sx={(t) => ({
            fontSize: FS.base,
            lineHeight: 1.6,
            color: t.tokens.muted,
            maxWidth: '68ch',
            textWrap: 'pretty',
            mb: '20px',
          })}
        >
          {neat.lead}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}
        >
          <StatTile
            label="Mouvement du quotidien"
            value={`${kcal(neat.currentKcal)} kcal`}
            note="par jour, hors séances"
            accent
          />
          {neat.hasHeadroom ? (
            <StatTile
              label="Marge disponible"
              value={`+ ${kcal(neat.headroom)} kcal`}
              note="en passant au cran de mouvement au-dessus"
            />
          ) : null}
        </Box>

        <Typography
          sx={(t) => ({
            fontSize: FS.small,
            lineHeight: 1.6,
            color: t.tokens.muted,
            mt: '14px',
            maxWidth: '68ch',
          })}
        >
          {neat.note}
        </Typography>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>Où aller la chercher</Overline>
          <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '6px' })}>
            Des gestes à répéter tous les jours, y compris les jours de séance. Les calories sont
            estimées pour votre poids actuel.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {neat.actions.map((action) => (
              <Box
                key={action.label}
                sx={(t) => ({
                  display: 'flex',
                  gap: 2,
                  alignItems: 'flex-start',
                  py: '12px',
                  borderTop: `1px solid ${t.tokens.divider}`,
                })}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: FS.option, fontWeight: 500, mb: '2px' }}>
                    {action.label}
                  </Typography>
                  <Typography
                    sx={(t) => ({ fontSize: FS.small, lineHeight: 1.5, color: t.tokens.muted })}
                  >
                    {action.detail}
                  </Typography>
                </Box>
                <Typography
                  sx={(t) => ({
                    flex: 'none',
                    fontSize: FS.small,
                    fontWeight: 500,
                    color: t.tokens.primaryInk,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    pt: '1px',
                  })}
                >
                  ≈ {action.kcal} kcal
                </Typography>
              </Box>
            ))}
          </Box>
          <Typography
            sx={(t) => ({
              fontSize: FS.caption,
              lineHeight: 1.6,
              color: t.tokens.muted2,
              mt: '12px',
            })}
          >
            Ces gestes ne demandent aucune récupération : contrairement à une séance, vous pouvez
            les cumuler tous les jours sans jamais avoir à lever le pied.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '4px' }}>Vos repères</Overline>
          <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted, mb: '14px' })}>
            Adaptés à votre façon de passer vos journées.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[neat.steps, ...neat.tips].map((tip) => (
              <Box
                key={tip}
                sx={(t) => ({
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  backgroundColor: t.tokens.surface2,
                  borderRadius: 1,
                  p: '14px',
                })}
              >
                <Box
                  aria-hidden
                  sx={(t) => ({
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    backgroundColor: t.tokens.primaryInk,
                    flex: 'none',
                    mt: '7px',
                  })}
                />
                <Typography sx={{ fontSize: FS.base, lineHeight: 1.55 }}>{tip}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
