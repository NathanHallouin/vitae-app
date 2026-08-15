/**
 * Recopie les cinq coupes de caractères réellement employées.
 *
 * `@expo-google-fonts/inter` et `@expo-google-fonts/fraunces` enregistrent la famille **entière**
 * dès qu'on importe une seule coupe : trente-six fichiers, sept mégaoctets et demi, dont les
 * italiques et les graisses 100 à 900 que cette application n'affiche nulle part. Tout partait dans
 * l'export du site à chaque déploiement.
 *
 * Les paquets restent installés — ce sont eux la source des fichiers — mais plus rien ne les
 * importe : ils sont passés en dépendances de développement à la racine, et c'est ce script qui
 * prélève les cinq coupes utiles.
 *
 * Deux destinations, parce que les deux plateformes ne chargent pas une police de la même façon :
 *
 * — `apps/app/assets/polices/` pour le natif, où `expo-font` les charge au démarrage et où Metro
 *   doit pouvoir les résoudre par un `require`.
 * — `apps/app/public/polices/` pour le site, où elles sont déclarées en `@font-face` dans le
 *   document. La différence est loin d'être cosmétique : chargées par `expo-font`, elles
 *   n'étaient demandées qu'une fois les 2,7 Mo de JavaScript exécutés, et le texte s'affichait
 *   d'abord en police système avant de sauter. Déclarées dans le document, elles partent avec
 *   l'analyse du HTML, en parallèle du paquet.
 *
 * `bun run fonts`
 */

import { copyFile, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { POLICES } from './polices';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(RACINE, 'node_modules/@expo-google-fonts');
const NATIF = path.join(RACINE, 'apps/app/assets/polices');
const WEB = path.join(RACINE, 'apps/app/public/polices');

await mkdir(NATIF, { recursive: true });
await mkdir(WEB, { recursive: true });

let total = 0;

for (const police of POLICES) {
  const dossier = police.fichier.replace(/^[A-Za-z]+_/, '');
  const source = path.join(SOURCES, police.famille, dossier, `${police.fichier}.ttf`);
  const nom = `${police.fichier}.ttf`;

  const infos = await stat(source).catch(() => null);
  if (!infos) {
    console.error(`Introuvable : ${path.relative(RACINE, source)}`);
    console.error('Les paquets @expo-google-fonts sont-ils installés ?');
    process.exit(1);
  }

  await Promise.all([
    copyFile(source, path.join(NATIF, nom)),
    copyFile(source, path.join(WEB, nom)),
  ]);
  total += infos.size;
  console.log(`${nom} · ${Math.round(infos.size / 1024)} Ko`);
}

console.log(`→ ${POLICES.length} coupes, ${Math.round(total / 1024)} Ko (au lieu de 36 et 7,7 Mo)`);
