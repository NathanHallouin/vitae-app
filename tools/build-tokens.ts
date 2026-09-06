/**
 * Écrit ce que Tailwind doit savoir des jetons, depuis `@vitae/core/tokens`.
 *
 * NativeWind compile la feuille avec le moteur de Tailwind 3, qui ne sait pas lire un module
 * TypeScript. Générer plutôt que recopier garde une source unique : le code natif et la feuille de
 * style lisent les mêmes valeurs.
 *
 * **Deux fichiers, parce que Tailwind lit deux choses de deux façons.** Les couleurs passent par
 * des variables CSS, qu'un thème peut redéfinir à l'exécution ; l'échelle typographique et les
 * rayons sont figés à la compilation et vont donc dans un module JavaScript que la configuration
 * étend.
 *
 * — `apps/app/src/theme/tokens.generated.css` : les deux palettes en variables CSS
 * — `apps/app/tailwind.generated.js` : `fontSize` et `borderRadius`
 *
 * Le second est né d'un défaut : l'échelle typographique était **recopiée à la main** dans
 * `tailwind.config.js`, si bien que `FONT_SIZES` n'était importé par personne et que la vraie
 * source était la copie. Deux tables qui pouvaient diverger sans qu'aucun contrôle ne s'en
 * aperçoive — pendant que `tokens.ts` se déclarait, en tête de fichier, source unique des jetons.
 *
 * `bun run tokens`
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CSS_VARIABLES, DARK, FONT_SIZES, LIGHT, type Palette, RADII } from '@vitae/core/tokens';

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
 *
 * ## Pourquoi `@layer base`, et non deux règles nues
 *
 * **Sans lui, le thème sombre n'existe pas en natif.** Ce n'est pas une précaution de style : les
 * variables sombres étaient purement et simplement absentes du paquet Android.
 *
 * Le compilateur de NativeWind lit la feuille **dans l'ordre**. Pour reconnaître `.dark:root`
 * comme « les variables du thème sombre », il lui faut savoir que « dark » est une classe — et il
 * l'apprend d'une règle `@cssInterop set darkMode class dark` que NativeWind injecte dans la couche
 * `base`, donc à l'emplacement de `@tailwind base`. Or `global.css` importe ce fichier **avant**
 * les directives, comme la spécification CSS l'exige d'un `@import`.
 *
 * Résultat, mesuré en exécutant le compilateur sur la feuille produite :
 *
 *     règles nues       →  --t-bg : { light: '#f3f2f7' }
 *     dans @layer base  →  --t-bg : { light: '#f3f2f7', dark: '#0d0c13' }
 *
 * Vingt et une variables sur vingt et une n'avaient que leur valeur claire. Sur le web rien ne
 * paraissait — le navigateur applique le CSS tel quel, sans passer par ce compilateur — et la
 * bascule de thème restait donc sans effet sur téléphone, et sur téléphone seulement.
 *
 * `@layer base` range ces variables là où Tailwind range les styles de base d'un projet, c'est-à-dire
 * **après** ceux des greffons. Le drapeau est lu en premier, et les deux palettes arrivent entières.
 */
async function ecrire(): Promise<string> {
  const cible = path.join(RACINE, 'apps/app/src/theme/tokens.generated.css');
  const contenu = [
    AVERTISSEMENT,
    '',
    '@layer base {',
    '  :root {',
    bloc(LIGHT, '    '),
    '  }',
    '',
    '  .dark:root {',
    bloc(DARK, '    '),
    '  }',
    '}',
    '',
  ].join('\n');
  await writeFile(cible, contenu, 'utf8');
  return cible;
}

/**
 * Le module que `tailwind.config.js` étend.
 *
 * `RADII.gauge` en est volontairement absent : ce n'est pas un rayon de coin mais l'épaisseur de
 * l'arc du cadran, lue par `Cadran.tsx` seul. La verser dans `borderRadius` créerait une classe
 * `rounded-gauge` de 22 px qui ne veut rien dire, et que quelqu'un finirait par employer.
 */
async function ecrireTailwind(): Promise<string> {
  const cible = path.join(RACINE, 'apps/app/tailwind.generated.js');
  const px = (table: Record<string, number>) =>
    Object.entries(table)
      .map(([cle, valeur]) => `  ${cle}: '${valeur}px',`)
      .join('\n');

  const contenu = [
    '// Fichier généré par `bun run tokens`. Ne pas modifier à la main :',
    '//   la source est `packages/core/src/tokens.ts`.',
    '',
    'const fontSize = {',
    px(FONT_SIZES),
    '};',
    '',
    'const borderRadius = {',
    px({ card: RADII.card, control: RADII.control }),
    '};',
    '',
    'module.exports = { fontSize, borderRadius };',
    '',
  ].join('\n');

  await writeFile(cible, contenu, 'utf8');
  return cible;
}

for (const cible of [await ecrire(), await ecrireTailwind()]) {
  console.log(`écrit → ${path.relative(process.cwd(), cible)}`);
}
