/**
 * Les trois coupes de caractères de l'application.
 *
 * Isolées ici parce que deux scripts en ont besoin — celui qui les recopie et celui qui écrit le
 * service worker — et qu'importer l'un depuis l'autre déclencherait sa copie au passage.
 *
 * Elles sont nommées à deux autres endroits, et une coupe ajoutée doit l'être partout :
 * `apps/app/tailwind.config.js` (une famille par graisse), `apps/app/src/lib/polices.ts` pour le
 * chargement natif, et `apps/app/app/+html.tsx` pour les `@font-face` du site. Rien ne vérifie
 * l'accord : une divergence fait retomber l'interface sur la police système, sans erreur.
 *
 * Trois au lieu de cinq depuis la refonte « Cadran ». Une seule famille porte désormais tout,
 * titres compris : la Space Grotesk a des chiffres de largeur égale par construction, ce qui était
 * la raison d'être de la Fraunces sur les grands nombres, et son œil large tient à 11 px là où une
 * serif de titre ne tenait pas. Ce qui disparaît avec elle : 74 Ko de woff2 sur le site, deux
 * `@font-face`, et la coupe Inter 600 que plus rien n'employait une fois `Chiffre` généralisé.
 */
export const POLICES = [
  { famille: 'space-grotesk', fichier: 'SpaceGrotesk_400Regular' },
  { famille: 'space-grotesk', fichier: 'SpaceGrotesk_500Medium' },
  { famille: 'space-grotesk', fichier: 'SpaceGrotesk_700Bold' },
] as const;
