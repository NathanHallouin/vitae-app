'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { WeekPlan } from '@/lib/training';
import { DISPLAY_FONT, FS } from '@/theme/theme';
import Overline from '../ui/Overline';

/** Programme hebdomadaire : quoi faire, dans quel ordre, et comment progresser. */
export default function WeekPlanCard({ week }: { week: WeekPlan }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Overline sx={{ mb: '4px' }}>Votre semaine type</Overline>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, m: '8px 0 8px' }}>
          <Typography
            sx={(t) => ({
              fontFamily: DISPLAY_FONT,
              fontSize: FS.display,
              fontWeight: 600,
              lineHeight: 1,
              color: t.tokens.primaryInk,
              fontVariantNumeric: 'tabular-nums',
            })}
          >
            {week.strengthPerWeek}
          </Typography>
          <Typography sx={(t) => ({ fontSize: FS.option, color: t.tokens.muted })}>
            séances de renforcement par semaine
          </Typography>
        </Box>
        <Typography
          sx={(t) => ({
            fontSize: FS.base,
            lineHeight: 1.6,
            color: t.tokens.muted,
            maxWidth: '68ch',
            textWrap: 'pretty',
          })}
        >
          {week.note}
        </Typography>
        <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2, mt: '10px' })}>
          Répartition conseillée : {week.schedule}
        </Typography>
      </Paper>

      {week.sessions.map((session) => (
        <Paper key={session.title} sx={{ p: 3 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              flexWrap: 'wrap',
              gap: 1,
              mb: '4px',
            }}
          >
            <Typography variant="h3" component="h2" sx={{ fontSize: FS.stat3 }}>
              {session.title}
            </Typography>
            <Typography sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2 })}>
              {session.focus} · {session.duration}
            </Typography>
          </Box>

          {session.exercises.map((ex) => (
            <Box
              key={ex.name}
              sx={(t) => ({ py: '14px', borderTop: `1px solid ${t.tokens.divider}` })}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 2,
                  flexWrap: 'wrap',
                }}
              >
                <Typography sx={{ fontSize: FS.option, fontWeight: 500 }}>{ex.name}</Typography>
                <Typography
                  sx={(t) => ({
                    fontSize: FS.small,
                    fontWeight: 500,
                    color: t.tokens.primaryInk,
                    fontVariantNumeric: 'tabular-nums',
                  })}
                >
                  {ex.volume} · repos {ex.rest}
                </Typography>
              </Box>
              <Typography
                sx={(t) => ({
                  fontSize: FS.small,
                  lineHeight: 1.55,
                  color: t.tokens.muted,
                  mt: '4px',
                  maxWidth: '72ch',
                })}
              >
                {ex.cue}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '8px',
                  mt: '8px',
                }}
              >
                <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    Trop dur :
                  </Box>{' '}
                  {ex.easier}
                </Typography>
                <Typography sx={(t) => ({ fontSize: FS.caption, color: t.tokens.muted2 })}>
                  <Box component="span" sx={{ fontWeight: 500 }}>
                    Trop facile :
                  </Box>{' '}
                  {ex.harder}
                </Typography>
              </Box>
            </Box>
          ))}
        </Paper>
      ))}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '12px' }}>Progresser sans matériel</Overline>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {week.progression.map((step, i) => (
              <Box key={step} sx={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <Box
                  aria-hidden
                  sx={(t) => ({
                    width: 22,
                    height: 22,
                    flex: 'none',
                    borderRadius: '50%',
                    backgroundColor: t.tokens.primaryTint,
                    color: t.tokens.primaryInk,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: FS.caption,
                    fontWeight: 700,
                  })}
                >
                  {i + 1}
                </Box>
                <Typography sx={{ fontSize: FS.base, lineHeight: 1.55 }}>{step}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Overline sx={{ mb: '12px' }}>Le cardio, en complément</Overline>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {week.cardio.map((line) => (
              <Box
                key={line}
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
                <Typography sx={{ fontSize: FS.base, lineHeight: 1.55 }}>{line}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
