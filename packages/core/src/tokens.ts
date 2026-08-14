/**
 * La palette, une fois pour toutes.
 *
 * Trois consommateurs ont besoin de ces valeurs : la feuille du site, celle de l'application
 * native, et le code natif lui-même — `react-native-svg` n'a pas de `currentColor`, la barre
 * d'onglets et la barre d'état veulent une couleur en clair. Les écrire trois fois, c'est se
 * garantir qu'un jour le bleu du site et celui de l'application ne sont plus le même bleu.
 *
 * Les deux fichiers CSS sont donc engendrés d'ici, par `bun run tokens`. Ce module ne dépend de
 * rien et ne rend rien : il ne contient que des valeurs.
 */

export interface Palette {
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
  primaryInk: string;
  primaryTint: string;
  /** dégradé de l'en-tête : deux arrêts, du plus foncé au plus clair */
  heroFrom: string;
  heroTo: string;
  heroText: string;
  accent: string;
  errorBg: string;
  errorInk: string;
  warnBg: string;
  warnInk: string;
  macroProt: string;
  macroFat: string;
  macroCarb: string;
  marker: string;
  doodleInk: string;
  doodleAccent: string;
}

/**
 * Clair : fond crème plutôt que blanc pur, bleu profond en couleur d'action.
 *
 * Les contrastes ont été mesurés, pas devinés : `faint` est à 4,6:1 sur le fond, seuil AA pour du
 * petit texte. Toute nouvelle valeur doit passer la même barre (voir ROADMAP.md).
 */
export const LIGHT: Palette = {
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
  primaryTint: 'rgba(8, 70, 132, 0.1)',
  heroFrom: '#084684',
  heroTo: '#0a5da9',
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

/**
 * Sombre : l'ambre remplace le bleu.
 *
 * Un bleu profond sur fond sombre tombe sous le seuil de contraste sans devenir pastel ; l'ambre
 * tient la lisibilité en gardant la chaleur de la maquette. Les petits textes tournent autour de
 * 7:1, mesurés dans le navigateur.
 */
export const DARK: Palette = {
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
  primaryTint: 'rgba(247, 185, 123, 0.16)',
  heroFrom: '#f0ac68',
  heroTo: '#d98c3f',
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

export const PALETTES = { light: LIGHT, dark: DARK } as const;

export type ColorMode = keyof typeof PALETTES;

/**
 * Nom de la variable CSS pour chaque entrée de la palette.
 *
 * L'application native lit `LIGHT`/`DARK` directement ; les feuilles de style, elles, ont besoin
 * des noms en tirets. Cette table est la charnière entre les deux mondes.
 */
export const CSS_VARIABLES: Record<keyof Palette, string> = {
  bg: '--t-bg',
  surface: '--t-surface',
  surface2: '--t-surface2',
  text: '--t-text',
  muted: '--t-muted',
  muted2: '--t-muted2',
  faint: '--t-faint',
  divider: '--t-divider',
  border: '--t-border',
  borderStrong: '--t-border-strong',
  primary: '--t-primary',
  primaryDark: '--t-primary-dark',
  primaryInk: '--t-primary-ink',
  primaryTint: '--t-primary-tint',
  heroFrom: '--t-hero-from',
  heroTo: '--t-hero-to',
  heroText: '--t-hero-text',
  accent: '--t-accent',
  errorBg: '--t-error-bg',
  errorInk: '--t-error-ink',
  warnBg: '--t-warn-bg',
  warnInk: '--t-warn-ink',
  macroProt: '--t-macro-prot',
  macroFat: '--t-macro-fat',
  macroCarb: '--t-macro-carb',
  marker: '--t-marker',
  doodleInk: '--t-doodle-ink',
  doodleAccent: '--t-doodle-accent',
};

/** Échelle typographique, reprise telle quelle de l'ancien objet `FS` de la maquette. */
export const FONT_SIZES = {
  micro: 11,
  caption: 12,
  small: 13,
  base: 14,
  option: 15,
  body: 16,
  input: 16,
  stat3: 18,
  h3: 20,
  stat2: 22,
  h2: 28,
  stat: 32,
  h1: 38,
  display: 40,
  hero: 58,
} as const;

export const RADII = { card: 16, control: 10 } as const;

/**
 * Les durées du mouvement, en millisecondes.
 *
 * Une échelle plutôt que des valeurs au cas par cas : c'est ce qui fait qu'une application paraît
 * réglée plutôt qu'animée. Trois principes tiennent ces chiffres :
 *
 * — ce qui répond à un doigt doit être imperceptible (`instant`) ; au-delà de 150 ms, le contrôle
 *   semble mou ;
 * — ce qui apparaît ou se replie prend `normal` : assez pour que l'œil suive le mouvement et
 *   comprenne d'où vient l'élément, pas assez pour attendre ;
 * — `compteur` est plus long à dessein. Voir un chiffre monter est la seule animation de cette
 *   application qui porte du sens : elle dit que le nombre vient d'être recalculé pour vous.
 *
 * `cascade` est le décalage entre deux éléments d'une même arrivée. Assez pour lire une direction,
 * trop peu pour se remarquer élément par élément.
 */
export const MOTION = {
  instant: 120,
  rapide: 200,
  normal: 320,
  lent: 520,
  compteur: 700,
  cascade: 60,
} as const;
