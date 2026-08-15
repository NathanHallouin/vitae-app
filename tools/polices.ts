/**
 * Les cinq coupes de caractères de l'application.
 *
 * Isolées ici parce que deux scripts en ont besoin — celui qui les recopie et celui qui écrit le
 * service worker — et qu'importer l'un depuis l'autre déclencherait sa copie au passage.
 *
 * Elles sont nommées à deux autres endroits, et une coupe ajoutée doit l'être partout :
 * `apps/app/tailwind.config.js` (une famille par graisse), `apps/app/src/lib/polices.ts` pour le
 * chargement natif, et `apps/app/app/+html.tsx` pour les `@font-face` du site. Rien ne vérifie
 * l'accord : une divergence fait retomber l'interface sur la police système, sans erreur.
 */
export const POLICES = [
  { famille: 'fraunces', fichier: 'Fraunces_600SemiBold' },
  { famille: 'inter', fichier: 'Inter_400Regular' },
  { famille: 'inter', fichier: 'Inter_500Medium' },
  { famille: 'inter', fichier: 'Inter_600SemiBold' },
  { famille: 'inter', fichier: 'Inter_700Bold' },
] as const;
