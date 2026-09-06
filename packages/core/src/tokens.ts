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
 *
 * ── Refonte « Cadran » ────────────────────────────────────────────────────────────────────────
 * Le crème et le bleu profond laissent la place à un gris-violet froid et à un indigo. La raison
 * n'est pas le goût : l'objet signature de l'interface est désormais un arc gradué qui porte le
 * chiffre en son centre (voir `Cadran.tsx`), et un arc a besoin de deux couleurs qui se
 * distinguent nettement à 6 px d'épaisseur sans que la plus faible ne disparaisse. Le couple
 * `primary` / `gaugeTrack` est calculé pour cela, dans les deux thèmes.
 *
 * Le dégradé de l'ancien `Hero` a disparu : `heroFrom` et `heroTo` portent désormais la même
 * valeur. Les deux clés restent parce que `Palette` est lue par `tokens.generated.css`, par la
 * barre d'état et par les visuels des magasins ; les fusionner serait un changement de contrat
 * pour un gain nul.
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
  /**
   * Le fond de l'arc du cadran, et de toute jauge.
   *
   * Nouvelle entrée. `divider` faisait l'affaire sur le papier mais pas à l'écran : un filet de
   * séparation doit se voir à peine, un fond de jauge doit se lire comme une valeur (« il reste
   * ça »). Deux rôles opposés dans une seule couleur donnaient soit des filets trop lourds, soit
   * un arc dont la partie vide s'évanouissait sur le fond.
   */
  gaugeTrack: string;
  /** dégradé de l'en-tête : conservé en deux arrêts, mais les deux valeurs sont identiques */
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
  /**
   * Le voile posé derrière une feuille de détail.
   *
   * Il ne teinte rien : il assombrit ce qui reste au-dessous pour que la feuille se lise comme
   * posée devant la page, et il indique qu'un appui à côté referme. Plus sombre en thème sombre
   * qu'en clair, sinon la feuille et le fond finissent au même niveau de gris.
   */
  scrim: string;
  doodleInk: string;
  doodleAccent: string;
}

/**
 * Clair : gris-violet très pâle, indigo en couleur d'action, cuivre en couleur de mesure.
 *
 * Les contrastes ont été mesurés, pas devinés (WCAG 2.1, sRGB) :
 *   text/bg 16,54 · muted/bg 8,50 · muted2/surface 7,86 · faint/bg 5,95 · faint/surface2 5,35
 *   primary/bg 8,96 · accent/bg 5,61 · heroText/heroFrom 8,91 · warnInk/warnBg 6,98
 *   macroProt/bg 6,2 · macroFat/bg 6,2 · macroCarb/bg 7,0
 * Le minimum de la palette est 5,35:1, au-dessus du seuil AA de 4,5:1 pour du petit texte.
 * Toute nouvelle valeur doit passer la même barre (voir ROADMAP.md).
 *
 * `accent` ne décore pas : il désigne la mesure constatée face à la valeur prévue — le repère de
 * dépense sur la barre de fourchette, le rythme réel face au rythme du plan, le curseur d'IMC.
 * Deux couleurs d'action rendraient l'interface illisible ; une couleur d'action et une couleur
 * de mesure se lisent d'elles-mêmes.
 */
export const LIGHT: Palette = {
  bg: '#f3f2f7',
  surface: '#ffffff',
  surface2: '#e7e6f0',
  text: '#14131c',
  muted: '#464455',
  muted2: '#52505f',
  faint: '#5d5b6a',
  divider: '#eceaf3',
  border: '#dcdae6',
  borderStrong: '#b3b0c4',
  primary: '#3a3495',
  primaryDark: '#2b2673',
  primaryInk: '#3a3495',
  primaryTint: 'rgba(58, 52, 149, 0.10)',
  gaugeTrack: '#c9c6de',
  heroFrom: '#3a3495',
  heroTo: '#3a3495',
  heroText: '#f2f1fb',
  accent: '#9a4a12',
  errorBg: '#fbeceb',
  errorInk: '#96170f',
  warnBg: '#f8eed8',
  warnInk: '#6b4a0a',
  macroProt: '#8f4a10',
  macroFat: '#2f5f92',
  macroCarb: '#186049',
  marker: '#5d5b6a',
  scrim: 'rgba(20, 19, 28, 0.45)',
  doodleInk: '#3a3495',
  doodleAccent: '#dedcec',
};

/**
 * Sombre : le même indigo ne tient pas, il devient une lavande claire.
 *
 * Un indigo profond sur fond sombre tombe sous le seuil de contraste sans devenir pastel — c'est
 * exactement le problème que posait déjà le bleu de la version précédente, résolu alors par
 * l'ambre. Ici la teinte est conservée et c'est la clarté qui monte : l'application reste la même
 * dans les deux thèmes, ce que la bascule bleu → ambre ne permettait pas.
 *
 * Contrastes mesurés :
 *   text/bg 16,37 · muted/bg 8,60 · muted2/surface 6,97 · faint/bg 6,21 · faint/surface2 5,41
 *   primary/bg 8,75 · accent/bg 9,21 · heroText/heroFrom 8,80 · warnInk/warnBg 10,26
 * Minimum : 5,41:1.
 */
export const DARK: Palette = {
  bg: '#0d0c13',
  surface: '#141320',
  surface2: '#1c1b2a',
  text: '#eceaf6',
  muted: '#adaabf',
  muted2: '#a09db3',
  faint: '#928fa6',
  divider: '#1f1e2e',
  border: '#2a2740',
  borderStrong: '#454163',
  primary: '#a9a4ff',
  primaryDark: '#8d87f0',
  primaryInk: '#a9a4ff',
  primaryTint: 'rgba(169, 164, 255, 0.16)',
  gaugeTrack: '#2a2740',
  heroFrom: '#a9a4ff',
  heroTo: '#a9a4ff',
  heroText: '#0b0a1a',
  accent: '#f0a06a',
  errorBg: '#33201e',
  errorInk: '#ffb2a9',
  warnBg: '#28231a',
  warnInk: '#f0cd8b',
  macroProt: '#e8a05f',
  macroFat: '#7fb2e0',
  macroCarb: '#6fcf9f',
  marker: '#928fa6',
  scrim: 'rgba(0, 0, 0, 0.62)',
  doodleInk: '#a9a4ff',
  doodleAccent: '#231f38',
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
  gaugeTrack: '--t-gauge-track',
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
  scrim: '--t-scrim',
  doodleInk: '--t-doodle-ink',
  doodleAccent: '--t-doodle-accent',
};

/**
 * Échelle typographique.
 *
 * Resserrée : la Space Grotesk a un œil plus grand que l'Inter à corps égal, et les valeurs
 * reprises telles quelles de la maquette d'origine rendaient les écrans lourds. Les clés sont
 * inchangées — aucune classe Tailwind n'est à renommer — seules les valeurs bougent.
 *
 * Deux valeurs ne se touchent pas :
 * — `input` reste à 16. En dessous, Safari iOS zoome à la mise au point d'un champ, et l'écran
 *   part en écharpe. Ce n'est pas une préférence esthétique.
 * — `micro` reste à 11 : c'est le plancher des surtitres, déjà à la limite basse du lisible.
 *
 * `hero` descend de 58 à 52 parce que le chiffre principal vit désormais au centre d'un cadran de
 * 186 px de diamètre intérieur : au-delà de 52, « 2 412 » touche l'arc sur un téléphone de 390 px.
 */
export const FONT_SIZES = {
  micro: 11,
  caption: 12,
  small: 13,
  base: 14,
  option: 15,
  body: 15,
  input: 16,
  stat3: 17,
  h3: 19,
  stat2: 22,
  h2: 26,
  stat: 34,
  h1: 36,
  display: 44,
  hero: 52,
} as const;

/**
 * Rayons.
 *
 * `card` descend de 16 à 14 : les cartes ne sont plus le seul objet arrondi de l'écran, le cadran
 * l'est aussi, et un rayon trop généreux à côté d'un cercle parfait se lit comme une hésitation.
 * `gauge` est l'épaisseur de l'arc, pas un rayon de coin — il vit ici parce que c'est la seule
 * table que `Cadran.tsx` et la feuille du site lisent toutes les deux.
 */
export const RADII = { card: 14, control: 10, gauge: 22 } as const;

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
 *
 * L'arc du cadran n'a pas sa propre durée : il se remplit sur `compteur`, en même temps que le
 * nombre qu'il entoure. Deux durées différentes pour un même recalcul donneraient deux
 * informations qui se contredisent, et le réglage « moins de mouvement » supprime les deux
 * ensemble — l'arc s'affiche alors à sa valeur finale, comme le nombre.
 */
export const MOTION = {
  instant: 120,
  rapide: 200,
  normal: 320,
  lent: 520,
  compteur: 700,
  cascade: 60,
} as const;
