/**
 * En natif, il n'y a pas de document où poser une classe : NativeWind applique le thème lui-même.
 *
 * La variante `.web.ts` porte le correctif, et son commentaire explique pourquoi il est nécessaire.
 */
export function appliquerClasseTheme(_mode: 'light' | 'dark'): void {}
