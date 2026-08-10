/** Design tokens de la maquette, mode clair et mode sombre. */

export interface Tokens {
  bg: string;
  surface: string;
  surface2: string;
  text: string;
  muted: string;
  muted2: string;
  faint: string;
  divider: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryDark: string;
  /** couleur de texte / bordure accentuée */
  primaryInk: string;
  primaryTint: string;
  errorBg: string;
  errorInk: string;
  warnBg: string;
  warnInk: string;
  shadow1: string;
  shadow2: string;
  /** pastille du bouton de thème */
  themeDot: string;
}

export const lightTokens: Tokens = {
  bg: '#f4f6f8',
  surface: '#ffffff',
  surface2: '#f7f9fa',
  text: '#212121',
  muted: '#5f6368',
  muted2: '#757575',
  faint: '#9e9e9e',
  divider: '#eceff1',
  border: '#e0e0e0',
  borderStrong: '#bdbdbd',
  primary: '#1976d2',
  primaryDark: '#1565c0',
  primaryInk: '#1565c0',
  primaryTint: 'rgba(25,118,210,.08)',
  errorBg: '#fdecea',
  errorInk: '#b71c1c',
  warnBg: '#fff8e1',
  warnInk: '#8d6e00',
  shadow1:
    '0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)',
  shadow2: '0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14)',
  themeDot: '#ffe082',
};

export const darkTokens: Tokens = {
  bg: '#121417',
  surface: '#1c1f24',
  surface2: '#23272e',
  text: '#e8eaed',
  muted: '#b0b6bd',
  muted2: '#9aa1a9',
  faint: '#7c848d',
  divider: '#2c3138',
  border: '#343a42',
  borderStrong: '#4a5158',
  primary: '#1565c0',
  primaryDark: '#0d47a1',
  primaryInk: '#90caf9',
  primaryTint: 'rgba(144,202,249,.12)',
  errorBg: '#3a1f1e',
  errorInk: '#ffb4ab',
  warnBg: '#33291a',
  warnInk: '#ffd28a',
  shadow1: '0 1px 2px rgba(0,0,0,.5)',
  shadow2: '0 6px 14px rgba(0,0,0,.55)',
  themeDot: '#0d1117',
};

export const tokensFor = (mode: 'light' | 'dark'): Tokens =>
  mode === 'dark' ? darkTokens : lightTokens;
