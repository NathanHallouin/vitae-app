'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FROM_NAV } from '@/lib/nav';
import { useColorMode } from '@/theme/ThemeRegistry';
import { DISPLAY_FONT, FS } from '@/theme/theme';
import { useProfile } from './ProfileProvider';
import Icon from './ui/Icon';

export default function AppHeader() {
  const { mode, toggle } = useColorMode();
  const { status } = useProfile();
  const pathname = usePathname();
  const label = mode === 'dark' ? 'Sombre' : 'Clair';
  const showProfileLink = status === 'ready' && pathname !== '/profil';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(t) => ({
        backgroundColor: t.tokens.surface,
        color: t.tokens.text,
        borderBottom: `1px solid ${t.tokens.divider}`,
        boxShadow: 'none',
      })}
    >
      <Toolbar
        disableGutters
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          px: 2,
          // Un peu plus bas sur mobile : la navigation est passée en bas de l'écran, l'en-tête
          // n'a plus à porter que la marque et la bascule de thème.
          minHeight: 56,
          height: 56,
          gap: 0.75,
          [FROM_NAV]: { px: 3, minHeight: 64, height: 64, gap: 2 },
        }}
      >
        <Box
          component={Link}
          href="/"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            [FROM_NAV]: { gap: 2 },
            color: 'inherit',
            textDecoration: 'none',
            flex: 1,
            minWidth: 0,
          }}
        >
          <Box
            aria-hidden
            sx={(t) => ({
              width: 30,
              height: 30,
              [FROM_NAV]: { width: 34, height: 34 },
              flex: 'none',
              borderRadius: '30%',
              background: t.tokens.heroGradient,
              color: t.tokens.heroText,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: FS.caption,
              fontWeight: 700,
              letterSpacing: '.02em',
            })}
          >
            MB
          </Box>
          <Typography
            component="span"
            noWrap
            sx={{
              fontFamily: DISPLAY_FONT,
              fontSize: FS.option,
              [FROM_NAV]: { fontSize: FS.h3 },
              fontWeight: 600,
              letterSpacing: '-.01em',
              minWidth: 0,
            }}
          >
            Métabolisme de base
          </Typography>
        </Box>

        {/* Masqué sur mobile : la barre du bas porte déjà « Profil », et deux entrées pour la
            même page à deux endroits de l'écran brouillent plus qu'elles n'aident. */}
        {showProfileLink ? (
          <Button
            component={Link}
            href="/profil"
            sx={(t) => ({
              display: 'none',
              [FROM_NAV]: { display: 'inline-flex' },
              color: t.tokens.muted,
              fontSize: FS.base,
              px: '14px',
              py: 1,
              flex: 'none',
              minWidth: 0,
              '&:hover': { backgroundColor: t.tokens.surface2, color: t.tokens.text },
            })}
          >
            Mon profil
          </Button>
        ) : null}

        <Button
          onClick={toggle}
          title={label}
          aria-label={`Basculer en mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
          sx={(t) => ({
            color: t.tokens.muted,
            border: `1px solid ${t.tokens.border}`,
            borderRadius: 999,
            fontSize: FS.small,
            px: '10px',
            [FROM_NAV]: { px: '14px' },
            py: '6px',
            minWidth: 0,
            gap: 1,
            flex: 'none',
            '&:hover': { backgroundColor: t.tokens.surface2, color: t.tokens.text },
          })}
        >
          <Icon name={mode === 'dark' ? 'soleil' : 'lune'} size={16} />
          <Box component="span" sx={{ display: 'none', [FROM_NAV]: { display: 'inline' } }}>
            {label}
          </Box>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
