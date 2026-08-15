/**
 * Pose la classe `dark` à la racine du document, ce que NativeWind ne fait pas toujours.
 *
 * Le thème a deux moitiés qui doivent rester d'accord : les variables CSS de `tokens.generated.css`
 * — sélecteur `.dark:root`, d'où la classe — et les couleurs lues en JavaScript par `usePalette`,
 * pour ce que le CSS ne peut pas peindre (les dégradés, les tracés SVG, les icônes).
 *
 * Tant que la préférence vaut « système », les deux divergent sur le web : `useColorScheme()` rend
 * bien `dark` — donc `usePalette` sert la palette sombre — mais aucune classe n'est posée sur
 * `<html>`, si bien que les variables restent claires. Le résultat est une page mi-figue mi-raisin,
 * fonds et textes en clair, accents en ambre. Deux bascules explicites la remettent d'aplomb, ce
 * qui n'est évidemment pas une solution : un premier visiteur sur un système en sombre n'en fait
 * aucune.
 *
 * Cette fonction est donc appelée à chaque changement de mode résolu, et non seulement au choix de
 * l'utilisateur : c'est le mode **effectif** qui doit être écrit dans le document.
 */
export function appliquerClasseTheme(mode: 'light' | 'dark'): void {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', mode === 'dark');
}
