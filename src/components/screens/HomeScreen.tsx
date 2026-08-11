'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { BENEFITS } from '@/lib/constants';
import { kcal } from '@/lib/format';
import { FS } from '@/theme/theme';
import { useProfile } from '../ProfileProvider';
import HomeIllustration from '../ui/HomeIllustration';
import Icon from '../ui/Icon';
import Overline from '../ui/Overline';

export default function HomeScreen() {
  const { status, metrics } = useProfile();
  const known = status === 'ready' && metrics !== null;

  return (
    <Box
      component="main"
      sx={{ width: '100%', maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 }, pt: 4, pb: 8 }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 4,
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h1" component="h1" sx={{ mb: 2 }}>
            Combien votre corps brûle-t-il de calories&nbsp;?
          </Typography>
          <Typography
            sx={(t) => ({
              fontSize: FS.body,
              lineHeight: 1.6,
              color: t.tokens.muted,
              mb: 1,
              maxWidth: '58ch',
              textWrap: 'pretty',
            })}
          >
            Même au repos, votre corps consomme de l’énergie pour respirer, faire battre votre cœur
            et vous garder au chaud. Savoir combien, c’est le point de départ pour perdre du gras,
            prendre du muscle ou simplement rester stable.
          </Typography>
          <Typography
            sx={(t) => ({
              fontSize: FS.base,
              lineHeight: 1.6,
              color: t.tokens.muted2,
              mb: 4,
              maxWidth: '58ch',
            })}
          >
            Quatre questions, une minute. Rien n’est envoyé sur internet : vos réponses restent dans
            ce navigateur.
          </Typography>

          {known && metrics ? (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
              <Button component={Link} href="/metabolisme" variant="contained" size="large">
                Voir mes résultats
              </Button>
              <Button component={Link} href="/profil" variant="outlined" size="large">
                Modifier mes infos
              </Button>
              <Typography
                sx={(t) => ({ fontSize: FS.small, color: t.tokens.muted2, width: '100%' })}
              >
                Dernier calcul : {kcal(metrics.tdee)} kcal dépensées par jour,{' '}
                {kcal(metrics.target)} kcal à manger pour votre objectif.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <Button component={Link} href="/profil" variant="contained" size="large">
                Commencer
              </Button>
              <Button component={Link} href="/profil?mode=form" variant="outlined" size="large">
                Tout saisir d’un coup
              </Button>
            </Box>
          )}
        </Box>

        <Box>
          <HomeIllustration />

          <Paper sx={{ p: 3, mt: 3 }}>
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
                  })}
                >
                  <Icon name={b.icon} size={18} />
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
      </Box>
    </Box>
  );
}
