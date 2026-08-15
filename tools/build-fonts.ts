/**
 * Prépare les cinq coupes de caractères réellement employées, une forme par plateforme.
 *
 * `@expo-google-fonts/inter` et `@expo-google-fonts/fraunces` enregistrent la famille **entière**
 * dès qu'on importe une seule coupe : trente-six fichiers, sept mégaoctets et demi, dont les
 * italiques et les graisses 100 à 900 que cette application n'affiche nulle part. Tout partait dans
 * l'export du site à chaque déploiement. Les paquets restent installés — ce sont eux la source des
 * fichiers — mais plus rien ne les importe : ils sont passés en dépendances de développement.
 *
 * Deux destinations, parce que les deux plateformes ne chargent pas une police de la même façon :
 *
 * — `apps/app/assets/polices/` reçoit le **TTF entier**, que `expo-font` charge au démarrage et que
 *   Metro doit pouvoir résoudre par un `require`. React Native ne lit pas le woff2.
 * — `apps/app/public/polices/` reçoit un **woff2 réduit aux caractères employés**, déclaré en
 *   `@font-face` dans le document. 334 Ko deviennent 28.
 *
 * La différence de moment compte autant que celle de poids : chargées par `expo-font` comme en
 * natif, les polices n'étaient demandées qu'une fois les 2,7 Mo de JavaScript exécutés, et le texte
 * s'affichait d'abord en police système avant de sauter.
 *
 * `bun run fonts`
 */

import { copyFile, mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';
import { POLICES } from './polices';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(RACINE, 'node_modules/@expo-google-fonts');
const NATIF = path.join(RACINE, 'apps/app/assets/polices');
const WEB = path.join(RACINE, 'apps/app/public/polices');

/**
 * Les dossiers où chercher les caractères à conserver.
 *
 * Les textes de l'interface vivent dans `packages/core`, les recettes dans `packages/content`, et
 * il reste des libellés écrits dans les composants. Les trois sont donc parcourus.
 */
const A_PARCOURIR = ['packages/core/src', 'packages/content', 'apps/app/src', 'apps/app/app'];
const EXTENSIONS = new Set(['.ts', '.tsx', '.md']);

async function fichiers(dossier: string): Promise<string[]> {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const listes = await Promise.all(
    entrees.map(async (e) => {
      const complet = path.join(dossier, e.name);
      if (e.isDirectory()) return fichiers(complet);
      return EXTENSIONS.has(path.extname(e.name)) ? [complet] : [];
    }),
  );
  return listes.flat();
}

/**
 * Les caractères que le woff2 doit contenir.
 *
 * **Deviner ce jeu ne marche pas**, et c'est le piège de tout sous-ensemble de police : un
 * caractère absent ne provoque aucune erreur, il s'affiche en rectangle vide. Le sous-ensemble
 * « latin » de Google Fonts, qu'on prendrait naturellement pour référence, ne contient ni `≈`, ni
 * `⅓`, ni `⅔` — que cette application affiche pourtant, respectivement pour la digestion, les
 * portions de recette et les fractions de quantité.
 *
 * Le jeu est donc **relevé dans les sources**, auxquelles s'ajoutent l'ASCII imprimable et le
 * supplément Latin-1 : ceux-là couvrent tout ce qu'un utilisateur peut saisir et tout ce que les
 * formats français peuvent engendrer, y compris l'espace insécable et le signe moins typographique.
 *
 * Ce qui reste à surveiller, faute de pouvoir le vérifier automatiquement : un caractère fabriqué
 * à l'exécution et absent des sources sortirait en rectangle vide sur le site, mais correctement
 * en natif, qui garde la police entière.
 */
async function jeuDeCaracteres(): Promise<string> {
  const jeu = new Set<string>();

  for (let code = 0x20; code <= 0x7e; code++) jeu.add(String.fromCodePoint(code));
  for (let code = 0xa0; code <= 0xff; code++) jeu.add(String.fromCodePoint(code));

  for (const dossier of A_PARCOURIR) {
    for (const fichier of await fichiers(path.join(RACINE, dossier))) {
      const contenu = await Bun.file(fichier).text();
      for (const caractere of contenu) {
        // Les caractères de commande ne se dessinent pas ; les demander ne ferait qu'allonger la
        // requête passée à harfbuzz. `?? 0` plutôt qu'une assertion : la chaîne est parcourue par
        // points de code, il n'y a donc jamais de position vide, mais autant ne pas l'affirmer.
        if ((caractere.codePointAt(0) ?? 0) > 0x1f) jeu.add(caractere);
      }
    }
  }

  return [...jeu].join('');
}

await mkdir(NATIF, { recursive: true });
await mkdir(WEB, { recursive: true });

const caracteres = await jeuDeCaracteres();
console.log(`${caracteres.length} caractères conservés`);

let ttf = 0;
let woff2 = 0;

for (const police of POLICES) {
  const dossier = police.fichier.replace(/^[A-Za-z]+_/, '');
  const source = path.join(SOURCES, police.famille, dossier, `${police.fichier}.ttf`);

  const infos = await stat(source).catch(() => null);
  if (!infos) {
    console.error(`Introuvable : ${path.relative(RACINE, source)}`);
    console.error('Les paquets @expo-google-fonts sont-ils installés ?');
    process.exit(1);
  }

  await copyFile(source, path.join(NATIF, `${police.fichier}.ttf`));

  const reduite = await subsetFont(Buffer.from(await Bun.file(source).arrayBuffer()), caracteres, {
    targetFormat: 'woff2',
  });
  await writeFile(path.join(WEB, `${police.fichier}.woff2`), reduite);

  ttf += infos.size;
  woff2 += reduite.length;
  console.log(
    `${police.fichier} · ${Math.round(infos.size / 1024)} Ko → ${Math.round(reduite.length / 1024)} Ko`,
  );
}

console.log(`→ natif ${Math.round(ttf / 1024)} Ko, web ${Math.round(woff2 / 1024)} Ko`);
