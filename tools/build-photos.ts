/**
 * Prépare les photos des recettes, et écrit ce que l'application doit en savoir.
 *
 * L'application n'avait jamais affiché une seule image bitmap : les icônes et les images de partage
 * sont engendrées, tout le reste est du tracé vectoriel. Cette chaîne est donc nouvelle, et elle
 * est écrite pour tenir les promesses que ce dépôt tient ailleurs — rien qui saute à l'écran, rien
 * qui alourdisse l'export sans qu'on l'ait décidé.
 *
 * **Une photo par recette, nommée par son slug** : `photos/blanc-de-poulet-grille-et-quinoa.jpg`.
 * Pas de champ à ajouter au frontmatter, donc pas de recette à réécrire : le lien se fait par le
 * nom du fichier, et une recette sans photo n'est pas une erreur — l'écran retombe sur son
 * illustration. C'est ce qui permet d'en ajouter sept aujourd'hui et le reste plus tard.
 *
 * Ce qui sort :
 *
 * — `apps/app/public/photos/<slug>-<largeur>.avif|webp` pour le site, en trois largeurs. L'AVIF
 *   d'abord, le WebP en repli : le premier pèse un tiers de moins, le second est compris partout.
 * — `packages/content/src/photos.generated.ts` : les dimensions et un **aperçu flou** encodé en
 *   base64. Sans lui, chaque photo réserve zéro pixel puis pousse le texte vers le bas à son
 *   arrivée — exactement le saut de mise en page que le reste du dépôt s'échine à éviter.
 *
 * `bun run photos`
 */

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(RACINE, 'photos');
const SORTIE_WEB = path.join(RACINE, 'apps/app/public/photos');
const MANIFESTE = path.join(RACINE, 'packages/content/src/photos.generated.ts');

/**
 * Trois largeurs, et pas une de plus.
 *
 * 400 pour une carte du catalogue, 800 pour une fiche sur téléphone, 1600 pour un écran dense.
 * Multiplier les paliers ne gagne que des kilo-octets et complique le `sizes` ; en oublier un fait
 * télécharger une image de 1600 px pour l'afficher dans une vignette de 300.
 */
const LARGEURS = [400, 800, 1600] as const;

/**
 * Le rapport de cadrage, imposé à toutes.
 *
 * Des photos de rapports différents feraient une grille de catalogue en dents de scie, et il
 * faudrait réserver la hauteur de la plus haute. Le 3:2 est le rapport d'un appareil photo : une
 * photo de plat prise sans intention particulière y entre sans qu'on ait à la recomposer.
 *
 * `attention: 'attention'` laisse sharp choisir le recadrage sur la zone la plus contrastée plutôt
 * qu'au centre — sur une assiette décentrée, le centre géométrique est souvent la nappe.
 */
const RAPPORT = 3 / 2;

/** Ce qui est reconnu comme source. Le HEIC d'un iPhone passe par sharp sans conversion préalable. */
const FORMATS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.heic', '.tif', '.tiff']);

interface Photo {
  slug: string;
  largeur: number;
  hauteur: number;
  apercu: string;
}

async function sources(): Promise<string[]> {
  const entrees = await readdir(SOURCES, { withFileTypes: true }).catch(() => []);
  return entrees
    .filter((e) => e.isFile() && FORMATS.has(path.extname(e.name).toLowerCase()))
    .map((e) => e.name)
    .sort();
}

/**
 * L'aperçu flou, en base64 dans le module.
 *
 * Seize pixels de large : à cette taille l'image ne dit plus rien du plat, seulement ses couleurs
 * et leur répartition. C'est tout ce qu'il faut pour que la place soit tenue et que l'arrivée de
 * la vraie photo ne soit pas un clignotement. Le fichier fait environ 400 octets, ce qui autorise
 * à l'embarquer dans le paquet plutôt qu'à le demander au réseau — une requête pour un aperçu
 * annulerait tout l'intérêt de l'aperçu.
 */
async function apercu(image: sharp.Sharp): Promise<string> {
  const flou = await image
    .clone()
    .resize(16, Math.round(16 / RAPPORT), { fit: 'cover', position: 'attention' })
    .blur(1.2)
    .webp({ quality: 45 })
    .toBuffer();
  return `data:image/webp;base64,${flou.toString('base64')}`;
}

await mkdir(SOURCES, { recursive: true });
await mkdir(SORTIE_WEB, { recursive: true });

const fichiers = await sources();
const photos: Photo[] = [];
let octets = 0;

for (const fichier of fichiers) {
  const slug = path.basename(fichier, path.extname(fichier));
  const source = sharp(await readFile(path.join(SOURCES, fichier)), { failOn: 'error' });
  const meta = await source.metadata();

  if (!meta.width || !meta.height) {
    console.error(`${fichier} : dimensions illisibles, photo ignorée.`);
    continue;
  }
  if (meta.width < LARGEURS[0]) {
    console.error(`${fichier} : ${meta.width} px de large, il en faut ${LARGEURS[0]} au minimum.`);
    continue;
  }

  for (const largeur of LARGEURS) {
    // Une photo n'est jamais agrandie : au-delà de sa largeur d'origine, on s'arrête. Un
    // agrandissement ne rend pas l'image plus nette, il la rend plus lourde.
    if (meta.width < largeur && largeur !== LARGEURS[0]) continue;

    const cadree = source
      .clone()
      .resize(largeur, Math.round(largeur / RAPPORT), { fit: 'cover', position: 'attention' });

    for (const [extension, encoder] of [
      ['avif', () => cadree.clone().avif({ quality: 55 })],
      ['webp', () => cadree.clone().webp({ quality: 78 })],
    ] as const) {
      const donnees = await encoder().toBuffer();
      await writeFile(path.join(SORTIE_WEB, `${slug}-${largeur}.${extension}`), donnees);
      octets += donnees.length;
    }
  }

  photos.push({
    slug,
    largeur: Math.min(meta.width, LARGEURS[LARGEURS.length - 1]),
    hauteur: Math.round(Math.min(meta.width, LARGEURS[LARGEURS.length - 1]) / RAPPORT),
    apercu: await apercu(source),
  });
  console.log(`${slug} · ${meta.width}×${meta.height}`);
}

const module = `/* Engendré par tools/build-photos.ts — ne pas modifier à la main. */

import type { PhotoRecette } from './photos';

/** Les largeurs disponibles, dans l'ordre où le \`srcset\` les propose. */
export const LARGEURS_PHOTO = ${JSON.stringify(LARGEURS)} as const;

/** Le rapport de cadrage imposé à toutes les photos. */
export const RAPPORT_PHOTO = ${RAPPORT.toFixed(6)};

export const PHOTOS: Record<string, PhotoRecette> = ${JSON.stringify(
  Object.fromEntries(photos.map((p) => [p.slug, p])),
  null,
  2,
)};
`;

await writeFile(MANIFESTE, module, 'utf8');

if (photos.length === 0) {
  console.log('Aucune photo dans `photos/`. Les fiches gardent leur illustration.');
} else {
  console.log(`→ ${photos.length} photo(s), ${Math.round(octets / 1024)} Ko livrés au site`);
}
