/**
 * Écrit les variables de thème dans les deux feuilles de style, depuis `@vitae/core/tokens`.
 *
 * Le site et l'application n'utilisent pas le même moteur — Tailwind 4 d'un côté, le moteur 3
 * embarqué par NativeWind de l'autre — mais ils peuvent partager les valeurs. Générer plutôt que
 * recopier supprime la seule vraie source de divergence visuelle entre les deux interfaces.
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
  '   la source est `packages/core/src/tokens.ts`, partagée avec l’application native. */',
].join('\n');

function bloc(palette: Palette, indent = '  '): string {
  return (Object.keys(CSS_VARIABLES) as Array<keyof Palette>)
    .map((cle) => `${indent}${CSS_VARIABLES[cle]}: ${palette[cle]};`)
    .join('\n');
}

/** Le site : un fichier importé par `globals.css`, qui garde son `@theme inline` à lui. */
async function ecrireWeb(): Promise<string> {
  const cible = path.join(RACINE, 'apps/web/src/app/tokens.generated.css');
  const contenu = [
    AVERTISSEMENT,
    '',
    ':root {',
    bloc(LIGHT),
    '}',
    '',
    '.dark {',
    bloc(DARK),
    '}',
    '',
  ].join('\n');
  await writeFile(cible, contenu, 'utf8');
  return cible;
}

/**
 * L'application : le même bloc, mais sous `.dark:root`.
 *
 * NativeWind résout les variables à la racine du document ; `.dark` seul, tel que l'écrit le site,
 * n'y désignerait aucun élément.
 */
async function ecrireMobile(): Promise<string> {
  const cible = path.join(RACINE, 'apps/mobile/src/theme/tokens.generated.css');
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

const ecrits = await Promise.all([ecrireWeb(), ecrireMobile()]);
for (const chemin of ecrits) {
  console.log(`écrit → ${path.relative(process.cwd(), chemin)}`);
}
