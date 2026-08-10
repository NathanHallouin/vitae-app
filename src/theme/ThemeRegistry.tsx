'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import { buildTheme } from './theme';
import type { Tokens } from './tokens';

type Mode = 'light' | 'dark';

interface ColorModeValue {
  mode: Mode;
  toggle: () => void;
}

const ColorModeContext = createContext<ColorModeValue>({ mode: 'light', toggle: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

/** Accès direct aux tokens de la maquette depuis n'importe quel composant. */
export function useTokens(): Tokens {
  return useTheme().tokens;
}

export default function ThemeRegistry({
  children,
  defaultMode = 'light',
}: {
  children: ReactNode;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const theme = useMemo(() => buildTheme(mode), [mode]);
  const colorMode = useMemo<ColorModeValue>(
    () => ({ mode, toggle: () => setMode((m) => (m === 'dark' ? 'light' : 'dark')) }),
    [mode],
  );

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
