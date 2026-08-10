import { createTheme, type Theme } from '@mui/material/styles';
import { type Tokens, tokensFor } from './tokens';

declare module '@mui/material/styles' {
  interface Theme {
    tokens: Tokens;
  }
  interface ThemeOptions {
    tokens?: Tokens;
  }
}

/** Titres et grands chiffres : une serif chaude, qui sort du registre « app générique ». */
export const DISPLAY_FONT = 'var(--font-display), Georgia, "Times New Roman", serif';
/** Interface et textes courants : une grotesque neutre, très lisible en petit. */
export const SANS_FONT = 'var(--font-sans), "Helvetica Neue", Arial, sans-serif';

/** Échelle typographique, en px. */
export const FS = {
  hero: 58,
  h1: 38,
  display: 40,
  stat: 32,
  h2: 28,
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
        light: t.primaryInk,
        // `heroText` suit la clarté de `primary` selon le thème (voir tokens.ts).
        contrastText: t.heroText,
      },
      secondary: { main: t.accent },
      background: { default: t.bg, paper: t.surface },
      text: { primary: t.text, secondary: t.muted, disabled: t.faint },
      divider: t.divider,
      error: { main: t.errorInk },
      warning: { main: t.warnInk },
    },
    shape: { borderRadius: 12 },
    typography: {
      fontFamily: SANS_FONT,
      fontWeightMedium: 600,
      h1: {
        fontFamily: DISPLAY_FONT,
        fontSize: FS.h1,
        fontWeight: 600,
        lineHeight: 1.15,
        letterSpacing: '-.015em',
      },
      h2: {
        fontFamily: DISPLAY_FONT,
        fontSize: FS.h2,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-.01em',
      },
      h3: {
        fontFamily: DISPLAY_FONT,
        fontSize: FS.h3,
        fontWeight: 600,
        lineHeight: 1.3,
      },
      overline: {
        fontSize: FS.micro,
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        lineHeight: 1.5,
      },
      button: { fontWeight: 600, letterSpacing: 0, textTransform: 'none' },
    },
  });

  return createTheme(base, {
    tokens: t,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { WebkitFontSmoothing: 'antialiased' },
          body: { backgroundColor: t.bg, color: t.text },
          '::selection': { backgroundColor: t.primaryTint },
          // Champs numériques sans spinners.
          'input[type=number]': { MozAppearance: 'textfield' },
          'input[type=number]::-webkit-outer-spin-button, input[type=number]::-webkit-inner-spin-button':
            { WebkitAppearance: 'none', margin: 0 },
        },
      },
      MuiPaper: {
        // Pas d'ombre portée : les cartes sont délimitées par leur bordure et leur fond.
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: 'none',
            borderRadius: 16,
            border: `1px solid ${t.divider}`,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 10, paddingInline: 18 },
          sizeLarge: { fontSize: FS.option, padding: '13px 26px' },
          sizeMedium: { fontSize: FS.base, padding: '10px 18px' },
        },
        // MUI 9 n'émet plus de classe combinée `textPrimary` : les surcharges par couleur
        // passent par `variants`, sinon le texte reste sur `palette.primary.main` — ici un
        // abricot clair illisible sur fond blanc.
        variants: [
          {
            props: { variant: 'contained', color: 'primary' },
            style: {
              boxShadow: 'none',
              '&:hover': { backgroundColor: t.primaryDark, boxShadow: 'none' },
            },
          },
          {
            props: { variant: 'outlined', color: 'primary' },
            style: {
              color: t.primaryInk,
              borderColor: t.border,
              '&:hover': { backgroundColor: t.primaryTint, borderColor: t.primaryInk },
            },
          },
          {
            props: { variant: 'text', color: 'primary' },
            style: {
              color: t.primaryInk,
              '&:hover': { backgroundColor: t.primaryTint },
            },
          },
        ],
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            fontSize: FS.input,
            borderRadius: 10,
            backgroundColor: t.surface2,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: t.border },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: t.borderStrong },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: t.primary,
            },
          },
          input: { padding: '14px 14px' },
        },
      },
      MuiInputAdornment: {
        styleOverrides: {
          root: { '& .MuiTypography-root': { fontSize: FS.small, color: t.muted2 } },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            backgroundColor: t.surface2,
            color: t.text,
            fontSize: FS.small,
            fontWeight: 500,
            borderRadius: 999,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          indicator: { display: 'none' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            minHeight: 36,
            padding: '8px 16px',
            marginRight: 6,
            borderRadius: 999,
            fontSize: FS.base,
            fontWeight: 600,
            textTransform: 'none',
            color: t.muted,
            '&:hover': { backgroundColor: t.surface2, color: t.text },
            '&.Mui-selected': {
              color: t.primaryInk,
              backgroundColor: t.primaryTint,
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: { height: 6, borderRadius: 999, backgroundColor: t.divider },
          bar: { borderRadius: 999, transition: 'transform .3s ease' },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: FS.caption, borderRadius: 8 } },
      },
    },
  });
}
