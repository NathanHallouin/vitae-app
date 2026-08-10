'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { BENEFITS } from '@/lib/constants';
import { FS } from '@/theme/theme';
import Overline from './ui/Overline';

export default function HomeScreen({
  onStartWizard,
  onStartForm,
}: {
  onStartWizard: () => void;
  onStartForm: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 4,
        alignItems: 'center',
      }}
    >
      <Box>
        <Typography variant="h1" component="h2" sx={{ mb: 2 }}>
          Combien de calories votre corps dépense-t-il au repos&nbsp;?
        </Typography>
        <Typography
          sx={(t) => ({
            fontSize: FS.body,
            lineHeight: 1.6,
            color: t.tokens.muted,
            mb: 1,
            textWrap: 'pretty',
          })}
        >
          Le métabolisme de base est l&apos;énergie nécessaire au fonctionnement de votre organisme
          à l&apos;arrêt complet. C&apos;est le point de départ de tout objectif de poids.
        </Typography>
        <Typography
          sx={(t) => ({ fontSize: FS.base, lineHeight: 1.6, color: t.tokens.muted2, mb: 4 })}
        >
          Calcul selon la formule Mifflin-St Jeor, la plus fiable pour la population générale. Avec
          IMC et fourchette d&apos;apport pour une sèche, une recomposition corporelle ou une prise
          de masse.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <Button variant="contained" size="large" onClick={onStartWizard}>
            Commencer
          </Button>
          <Button variant="outlined" size="large" onClick={onStartForm}>
            Formulaire complet
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Overline sx={{ mb: '20px' }}>Ce que vous obtenez</Overline>
        {BENEFITS.map((b) => (
          <Box
            key={b.n}
            sx={(t) => ({
              display: 'flex',
              gap: 2,
              py: '12px',
              borderTop: `1px solid ${t.tokens.divider}`,
            })}
          >
            <Box
              aria-hidden
              sx={(t) => ({
                width: 28,
                height: 28,
                flex: 'none',
                borderRadius: '50%',
                backgroundColor: t.tokens.primaryTint,
                color: t.tokens.primaryInk,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: FS.small,
                fontWeight: 700,
              })}
            >
              {b.n}
            </Box>
            <Box>
              <Typography sx={{ fontSize: FS.option, fontWeight: 500, mb: '2px' }}>
                {b.title}
              </Typography>
              <Typography
                sx={(t) => ({ fontSize: FS.small, lineHeight: 1.5, color: t.tokens.muted })}
              >
                {b.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}
