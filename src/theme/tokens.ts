/**
 * Design tokens : registre santé / nutrition.
 *
 * Thème clair : bleu profond `#084684`. Thème sombre : abricot `#F7B97B`.
 * `primary` sert d'aplat (cartes principales, états sélectionnés, boutons) ; `heroText` est la
 * couleur de texte posée dessus et suit donc la clarté de `primary` (claire sur le bleu, sombre
 * sur l'abricot). Pour les textes et bordures accentués sur `surface`, on utilise `primaryInk`,
 * une déclinaison de la même teinte qui tient le 4,5:1 exigé par WCAG AA.
 */

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
  /** couleur de marque, en aplat uniquement */
  primary: string;
  primaryDark: string;
  /** version foncée, lisible en texte sur `surface` */
  primaryInk: string;
  primaryTint: string;
  /** dégradé de la carte principale */
  heroGradient: string;
  /** texte posé sur `primary` et sur `heroGradient` */
  heroText: string;
  /** accent secondaire */
  accent: string;
  errorBg: string;
  errorInk: string;
  warnBg: string;
  warnInk: string;
  macroProt: string;
  macroFat: string;
  macroCarb: string;
  /** repère de la dépense totale sur la barre de fourchette */
  marker: string;
  /** trait des illustrations Open Doodles */
  doodleInk: string;
  /** aplats secondaires des illustrations (peau, vêtements) */
  doodleAccent: string;
}

export const lightTokens: Tokens = {
  bg: '#fbf7f2',
  surface: '#ffffff',
  surface2: '#f6efe6',
  text: '#241a12',
  muted: '#5a4c40',
  muted2: '#6a5b4d',
  faint: '#78685a',
  divider: '#efe6da',
  border: '#e3d7c8',
  borderStrong: '#bfae9b',
  primary: '#084684',
  primaryDark: '#063461',
  primaryInk: '#084684',
  primaryTint: 'rgba(8,70,132,.10)',
  heroGradient: 'linear-gradient(135deg, #084684 0%, #0a5da9 100%)',
  heroText: '#f2f7fc',
  accent: '#3f7d6e',
  errorBg: '#fbeceb',
  errorInk: '#a02017',
  warnBg: '#fdf1de',
  warnInk: '#7a5410',
  macroProt: '#a85b12',
  macroFat: '#4e7ca1',
  macroCarb: '#3f7d53',
  marker: '#8a7a6b',
  doodleInk: '#084684',
  doodleAccent: '#f0dcc4',
};

export const darkTokens: Tokens = {
  bg: '#16120e',
  surface: '#1e1913',
  surface2: '#28211a',
  text: '#f1e7dc',
  muted: '#bcaf9f',
  muted2: '#ab9e8e',
  faint: '#9a8b7c',
  divider: '#2e271f',
  border: '#392f26',
  borderStrong: '#52463a',
  primary: '#f7b97b',
  primaryDark: '#e9a25e',
  primaryInk: '#f7b97b',
  primaryTint: 'rgba(247,185,123,.16)',
  heroGradient: 'linear-gradient(135deg, #f0ac68 0%, #d98c3f 100%)',
  heroText: '#231609',
  accent: '#6fb3a1',
  errorBg: '#3a1e1c',
  errorInk: '#ffb4ab',
  warnBg: '#33291a',
  warnInk: '#f2c98a',
  macroProt: '#f0a461',
  macroFat: '#84b0d4',
  macroCarb: '#7fc08f',
  marker: '#9a8b7c',
  doodleInk: '#f0ac68',
  doodleAccent: '#3d3225',
};

export const tokensFor = (mode: 'light' | 'dark'): Tokens =>
  mode === 'dark' ? darkTokens : lightTokens;
