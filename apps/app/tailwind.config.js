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
       * synthèse, au prix d'un `font-sans-semibold` un peu plus bavard que `font-semibold`.
       *
       * `display` n'a qu'une coupe parce que la maquette n'utilise la Fraunces qu'en 600.
       */
      fontFamily: {
        display: ['Fraunces_600SemiBold'],
        sans: ['Inter_400Regular'],
        'sans-medium': ['Inter_500Medium'],
        'sans-semibold': ['Inter_600SemiBold'],
        'sans-bold': ['Inter_700Bold'],
      },
      fontSize: {
        micro: '11px',
        caption: '12px',
        small: '13px',
        base: '14px',
        option: '15px',
        body: '16px',
        input: '16px',
        stat3: '18px',
        h3: '20px',
        stat2: '22px',
        h2: '28px',
        stat: '32px',
        h1: '38px',
        display: '40px',
        hero: '58px',
      },
      borderRadius: {
        card: '16px',
        control: '10px',
      },
    },
  },
  plugins: [],
};
