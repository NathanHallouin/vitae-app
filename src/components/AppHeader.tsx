'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useColorMode } from '@/theme/ThemeRegistry';
import { FS } from '@/theme/theme';

export default function AppHeader({ onReset }: { onReset: () => void }) {
  const { mode, toggle } = useColorMode();
  const label = mode === 'dark' ? 'Sombre' : 'Clair';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={(t) => ({
        backgroundColor: t.tokens.primary,
        color: '#fff',
        boxShadow: '0 2px 4px -1px rgba(0,0,0,.2), 0 4px 5px 0 rgba(0,0,0,.14)',
      })}
    >
      <Toolbar
        disableGutters
        sx={{
          maxWidth: 1200,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          minHeight: 64,
          height: 64,
          gap: { xs: 0.75, sm: 2 },
        }}
      >
        <Box
          aria-hidden
          sx={{
            width: { xs: 28, sm: 32 },
            height: { xs: 28, sm: 32 },
            flex: 'none',
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: FS.small,
            fontWeight: 700,
            letterSpacing: '.02em',
          }}
        >
          MB
        </Box>
        <Typography
          component="h1"
          noWrap
          sx={{
            fontSize: { xs: FS.option, sm: FS.h3 },
            fontWeight: 500,
            letterSpacing: '.0075em',
            flex: 1,
            minWidth: 0,
          }}
        >
          Métabolisme de base
        </Typography>

        <Button
          onClick={onReset}
          sx={{
            color: 'rgba(255,255,255,.92)',
            fontSize: { xs: FS.caption, sm: FS.base },
            px: { xs: '4px', sm: '12px' },
            py: 1,
            flex: 'none',
            minWidth: 0,
            '&:hover': { backgroundColor: 'rgba(255,255,255,.12)' },
          }}
        >
          Recommencer
        </Button>

        <Button
          onClick={toggle}
          title={label}
          aria-label={`Basculer en mode ${mode === 'dark' ? 'clair' : 'sombre'}`}
          sx={(t) => ({
            color: '#fff',
            border: '1px solid rgba(255,255,255,.5)',
            borderRadius: 16,
            fontSize: FS.small,
            px: { xs: '8px', sm: '14px' },
            py: '7px',
            minWidth: 0,
            gap: 1,
            flex: 'none',
            '&:hover': { backgroundColor: 'rgba(255,255,255,.12)' },
            '& .dot': {
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: t.tokens.themeDot,
              border: '1.5px solid #fff',
            },
          })}
        >
          <Box component="span" className="dot" aria-hidden />
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            {label}
          </Box>
        </Button>
      </Toolbar>
    </AppBar>
  );
}
