import { createTheme, type Shadows, type Theme } from '@mui/material/styles';
import { type Tokens, tokensFor } from './tokens';

declare module '@mui/material/styles' {
  interface Theme {
    tokens: Tokens;
  }
  interface ThemeOptions {
    tokens?: Tokens;
  }
}

/** Échelle typographique de la maquette, en px. */
export const FS = {
  hero: 56,
  h1: 34,
  display: 40,
  stat: 34,
  h2: 24,
  stat2: 22,
  h3: 20,
  stat3: 18,
  input: 16,
  body: 16,
  option: 15,
  base: 14,
  small: 13,
  caption: 12,
  micro: 11,
} as const;

export function buildTheme(mode: 'light' | 'dark'): Theme {
  const t = tokensFor(mode);

  const base = createTheme({
    palette: {
      mode,
      primary: {
        main: t.primary,
        dark: t.primaryDark,
        light: mode === 'dark' ? t.primaryInk : '#42a5f5',
        contrastText: '#ffffff',
      },
      background: { default: t.bg, paper: t.surface },
      text: { primary: t.text, secondary: t.muted, disabled: t.faint },
      divider: t.divider,
      error: { main: t.errorInk },
      warning: { main: t.warnInk },
    },
    shape: { borderRadius: 4 },
    typography: {
      fontFamily: 'var(--font-roboto), Roboto, Helvetica, Arial, sans-serif',
      fontWeightMedium: 500,
      h1: { fontSize: FS.h1, fontWeight: 500, lineHeight: 1.2, letterSpacing: '.0025em' },
      h2: { fontSize: FS.h2, fontWeight: 500 },
      h3: { fontSize: FS.h3, fontWeight: 500 },
      overline: {
        fontSize: FS.caption,
        fontWeight: 500,
        letterSpacing: '.08em',
        textTransform: 'uppercase',
        lineHeight: 1.4,
      },
      button: { fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' },
    },
  });

  // Elevation 1 (cartes) et 3 (carte principale) reprennent les ombres de la maquette.
  const shadows = [...base.shadows] as Shadows;
  shadows[1] = t.shadow1;
  shadows[3] = t.shadow2;

  return createTheme(base, {
    tokens: t,
    shadows,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: 'antialiased' },
          body: { backgroundColor: t.bg, color: t.text },
          // Champs numériques sans spinners, comme dans la maquette.
          'input[type=number]': { MozAppearance: 'textfield' },
          'input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button':
            { WebkitAppearance: 'none', margin: 0 },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 1 },
        styleOverrides: {
          root: { backgroundImage: 'none', borderRadius: 4 },
        },
      },
      MuiButton: {
        defaultProps: { disableRipple: false },
        styleOverrides: {
          root: { borderRadius: 4 },
          sizeLarge: { fontSize: FS.option, padding: '12px 24px' },
          sizeMedium: { fontSize: FS.base, padding: '10px 20px' },
          containedPrimary: {
            '&:hover': { backgroundColor: t.primaryDark },
          },
          outlinedPrimary: {
            color: t.primaryInk,
            borderColor: t.primaryInk,
            '&:hover': { backgroundColor: t.primaryTint, borderColor: t.primaryInk },
          },
          textPrimary: {
            color: t.primaryInk,
            '&:hover': { backgroundColor: t.primaryTint },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: FS.input,
            backgroundColor: t.surface,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.text },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 1,
              borderColor: t.primaryInk,
            },
          },
          input: { padding: '14px 12px' },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: { '& .MuiTypography-root': { fontSize: FS.small, color: t.faint } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { backgroundColor: t.divider, color: t.text, fontSize: FS.small, borderRadius: 16 },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 4, borderRadius: 2, backgroundColor: t.border },
          bar: { borderRadius: 2, transition: 'transform .3s ease' },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: FS.caption } },
      },
    },
  });
}
