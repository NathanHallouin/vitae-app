/**
 * Le thème, décalqué de la version web.
 *
 * Les noms d'utilitaires sont volontairement identiques (`bg-surface`, `text-faint`, `text-h2`…) :
 * une carte portée du site vers l'application garde ses classes, et une couleur ajoutée d'un côté
 * se voit manquer de l'autre à la compilation plutôt qu'à l'écran.
 *
 * Tailwind reste ici en version 3 : NativeWind 4 compile la feuille avec ce moteur, pas avec
 * celui de Tailwind 4 utilisé par le site. Les jetons, eux, sont les mêmes.
 */

// Engendré par `bun run tokens` depuis `packages/core/src/tokens.ts`. Recopier ces valeurs ici
// plutôt que les importer avait fait de `FONT_SIZES` du code mort et de cette copie la vraie
// source — deux tables libres de diverger en silence.
const { borderRadius, fontSize } = require('./tailwind.generated');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'var(--t-bg)',
        surface: 'var(--t-surface)',
        surface2: 'var(--t-surface2)',
        ink: 'var(--t-text)',
        muted: 'var(--t-muted)',
        muted2: 'var(--t-muted2)',
        faint: 'var(--t-faint)',
        divider: 'var(--t-divider)',
        line: 'var(--t-border)',
        'line-strong': 'var(--t-border-strong)',
        primary: 'var(--t-primary)',
        'primary-dark': 'var(--t-primary-dark)',
        'primary-ink': 'var(--t-primary-ink)',
        'primary-tint': 'var(--t-primary-tint)',
        // Le fond des jauges et de l'arc du cadran. Distinct de `divider`, qui sépare : un filet
        // doit se voir à peine, un fond de jauge doit se lire comme une valeur.
        'gauge-track': 'var(--t-gauge-track)',
        'hero-from': 'var(--t-hero-from)',
        'hero-to': 'var(--t-hero-to)',
        'hero-text': 'var(--t-hero-text)',
        accent: 'var(--t-accent)',
        'error-bg': 'var(--t-error-bg)',
        'error-ink': 'var(--t-error-ink)',
        'warn-bg': 'var(--t-warn-bg)',
        'warn-ink': 'var(--t-warn-ink)',
        'macro-prot': 'var(--t-macro-prot)',
        'macro-fat': 'var(--t-macro-fat)',
        'macro-carb': 'var(--t-macro-carb)',
        marker: 'var(--t-marker)',
        'doodle-ink': 'var(--t-doodle-ink)',
        'doodle-accent': 'var(--t-doodle-accent)',
      },
      /**
       * Une famille par graisse, et pas de `font-semibold`.
       *
       * Sur le web, `font-weight: 600` demande au navigateur d'aller chercher la coupe adéquate
       * dans la famille. React Native ne sait pas faire cela : sur Android il fabrique une fausse
       * graisse en épaississant le tracé, ce qui donne un rendu sale sur les petits corps — et
       * c'est justement là que l'interface met ses libellés. Nommer chaque coupe évite la
       * synthèse, au prix d'un `font-sans-medium` un peu plus bavard que `font-medium`.
       *
       * `display` et `sans-bold` désignent la même coupe depuis la refonte : une seule famille
       * porte les titres, les libellés et les chiffres. Les deux noms restent parce qu'ils ne
       * disent pas la même chose — `display` est un rôle (le grand chiffre, le titre), `sans-bold`
       * est une graisse. Le jour où le rôle changera de coupe, un seul nom sera à toucher.
       *
       * Ce qui a disparu : `font-sans-semibold`, que plus rien n'employait une fois les surtitres
       * passés en 500.
       */
      fontFamily: {
        display: ['SpaceGrotesk_700Bold'],
        sans: ['SpaceGrotesk_400Regular'],
        'sans-medium': ['SpaceGrotesk_500Medium'],
        'sans-bold': ['SpaceGrotesk_700Bold'],
      },
      fontSize,
      borderRadius,
    },
  },
  plugins: [],
};
