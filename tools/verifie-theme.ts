/**
 * Le thème sombre survit-il à la compilation pour le natif ?
 *
 * ## Le défaut que ce script empêche de revenir
 *
 * Les variables sombres étaient **absentes du paquet Android**. Pas fausses, pas mal appliquées :
 * absentes. Les vingt et une variables du thème n'avaient que leur valeur claire, et la bascule de
 * thème du profil ne pouvait donc rien changer sur téléphone.
 *
 * Le compilateur de NativeWind lit la feuille dans l'ordre. Pour reconnaître `.dark:root` comme
 * « les variables du thème sombre », il lui faut d'abord avoir lu `@cssInterop set darkMode class
 * dark`, que NativeWind injecte dans la couche `base`. `global.css` importait les jetons **avant**
 * les directives — comme la spécification CSS l'exige d'un `@import` — donc `.dark:root` était
 * évalué alors que le compilateur croyait encore le thème sombre piloté par une requête média. Il
 * ne reconnaissait pas le sélecteur, et jetait le bloc en silence.
 *
 * **Rien ne pouvait le voir.** Le site, lui, marchait : un navigateur applique le CSS tel quel,
 * sans passer par ce compilateur. Le typage, les tests, la CI, l'export web : tout était vert. Il
 * fallait un appareil — ou ce script.
 *
 * ## Ce qu'il fait
 *
 * Il compile `global.css` exactement comme Metro le fait pour Android (`NATIVEWIND_OS`), passe le
 * résultat dans le compilateur de NativeWind, et vérifie que **chaque** variable de thème porte ses
 * deux valeurs. C'est le dernier point où l'on peut encore voir ce que l'application recevra.
 *
 * `bun run verifie:theme`
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Sous-chemin interne de NativeWind : il porte ses propres déclarations, mais rien ne garantit
// leur stabilité — le test d'injection ci-dessous est ce qui protège vraiment cet appel.
import { cssToReactNativeRuntime } from 'react-native-css-interop/dist/css-to-rn/index.js';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(RACINE, 'apps/app');

const css = execFileSync(
  'bun',
  ['x', 'tailwindcss', '-i', './global.css', '-c', './tailwind.config.js'],
  { cwd: APP, env: { ...process.env, NATIVEWIND_OS: 'android' }, maxBuffer: 64 * 1024 * 1024 },
).toString();

interface Sortie {
  flags?: Record<string, string>;
  rootVariables?: Record<string, { light?: string; dark?: string }>;
}
const sortie = cssToReactNativeRuntime(css, {}) as Sortie;
const variables = sortie.rootVariables ?? {};
const noms = Object.keys(variables).filter((n) => n.startsWith('--t-'));

const fautes: string[] = [];

if (sortie.flags?.darkMode !== 'class dark') {
  fautes.push(`le drapeau darkMode vaut « ${sortie.flags?.darkMode} », attendu « class dark »`);
}
if (noms.length === 0) {
  fautes.push('aucune variable de thème extraite : la feuille n’a pas compilé comme prévu');
}
for (const nom of noms) {
  const v = variables[nom];
  if (!v?.light) fautes.push(`${nom} : pas de valeur claire`);
  if (!v?.dark) fautes.push(`${nom} : pas de valeur sombre`);
}

if (fautes.length > 0) {
  console.error(`Le thème ne survit pas à la compilation native — ${fautes.length} faute(s) :\n`);
  for (const f of fautes.slice(0, 12)) console.error(`  ${f}`);
  if (fautes.length > 12) console.error(`  … et ${fautes.length - 12} autre(s)`);
  process.exit(1);
}

console.log(`thème natif vérifié · ${noms.length} variables, chacune avec ses deux valeurs`);
