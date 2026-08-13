/**
 * Écrit les variables de thème de la feuille NativeWind, depuis `@vitae/core/tokens`.
 *
 * NativeWind compile la feuille avec le moteur de Tailwind 3, qui ne sait pas lire un module
 * TypeScript. Générer le CSS depuis `tokens.ts` plutôt que d'y recopier les valeurs garde une
 * source unique : le code natif lit les mêmes couleurs que la feuille de style.
 *
 * `bun run tokens`
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSS_VARIABLES, DARK, LIGHT, type Palette } from '@vitae/core/tokens';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const AVERTISSEMENT = [
  '/* Fichier généré par `bun run tokens`. Ne pas modifier à la main :',
  '   la source est `packages/core/src/tokens.ts`. */',
].join('\n');

function bloc(palette: Palette, indent = '  '): string {
  return (Object.keys(CSS_VARIABLES) as Array<keyof Palette>)
    .map((cle) => `${indent}${CSS_VARIABLES[cle]}: ${palette[cle]};`)
    .join('\n');
}

/**
 * NativeWind résout les variables à la racine du document : c'est `.dark:root` qu'il faut écrire,
 * et non `.dark`, qui n'y désignerait aucun élément.
 */
async function ecrire(): Promise<string> {
  const cible = path.join(RACINE, 'apps/app/src/theme/tokens.generated.css');
  const contenu = [
    AVERTISSEMENT,
    '',
    ':root {',
    bloc(LIGHT),
    '}',
    '',
    '.dark:root {',
    bloc(DARK),
    '}',
    '',
  ].join('\n');
  await writeFile(cible, contenu, 'utf8');
  return cible;
}

console.log(`écrit → ${path.relative(process.cwd(), await ecrire())}`);
