/**
 * Fabrique les images que réclament les magasins, depuis un seul tracé.
 *
 * Quatre fichiers, quatre contraintes différentes, et aucune n'admet d'approximation :
 *
 * — `icon.png` (1024²) est l'icône iOS. Elle doit être opaque et sans coin arrondi : c'est le
 *   système qui masque, et une icône déjà arrondie ressort avec un liseré.
 * — `adaptive-icon.png` (1024²) est le calque avant d'Android. Le système en rogne jusqu'à un
 *   cercle inscrit ; le dessin tient donc dans les deux tiers centraux, le reste étant du vide.
 * — `splash-icon.png` (512²) est posée au centre de l'écran de démarrage, sur fond transparent.
 * — `favicon.png` (48²) est celle du site.
 *
 * Trois autres partent dans `public/`, pour le site installé depuis le navigateur :
 *
 * — `icone-192.png` et `icone-512.png`, référencées par le manifeste. Deux tailles parce que les
 *   systèmes n'utilisent pas la même selon l'endroit — la petite pour une liste, la grande pour
 *   l'écran d'accueil et l'écran de démarrage qu'Android en dérive.
 * — `icone-maskable-512.png` est la même, mais dessinée plus petite dans son carré. Android rogne
 *   les icônes à la forme du thème du téléphone : sans cette marge, la flamme sort amputée. C'est
 *   la contrainte du calque adaptatif, à laquelle le web est soumis de la même façon.
 * — `apple-touch-icon.png` (180²), qu'iOS lit à la place du manifeste quand on ajoute une page à
 *   l'écran d'accueil. Sans elle, Safari pose une capture de la page.
 *
 * Le tracé est la flamme du jeu d'icônes, la même qu'à l'écran : l'application, le site et
 * l'icône du téléphone montrent le même signe.
 *
 * `bun run icons`
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIGHT } from '@vitae/core/tokens';
import sharp from 'sharp';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(RACINE, 'apps/app/assets');
// Recopié tel quel à la racine du site par l'export : c'est ce qui donne des adresses stables,
// que le manifeste peut citer sans connaître le hachage des ressources.
const PUBLIC = path.join(RACINE, 'apps/app/public');

/** Le tracé de l'icône `flamme`, sur sa grille de 24 px. */
const FLAMME =
  'M12 3c2.8 3.2 4.8 5.6 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-1.7.8-3 1.8-4 .2 1.3.9 2 1.7 2 1.1 0 1.6-.9 1.6-2.2 0-1.5-.5-2.9-.3-4.4Z';

/**
 * L'encombrement réel du tracé, épaisseur de trait comprise.
 *
 * La flamme n'occupe pas sa grille : elle est haute, étroite, et posée dans le tiers supérieur.
 * Centrer la grille plutôt que le dessin laisserait un vide sous la flamme — flagrant sur une
 * icône d'application, où l'œil compare au reste de l'écran d'accueil.
 */
const TRACE = { x: 6.4, y: 2.2, largeur: 11.2, hauteur: 15 };

/**
 * Le dessin, en SVG.
 *
 * `echelle` dit quelle part du carré occupe la flamme : pleine pour iOS, réduite pour Android dont
 * le système rogne les bords, et sans fond quand l'image doit rester transparente.
 */
function svg({
  taille,
  echelle,
  fond,
}: {
  taille: number;
  echelle: number;
  fond: string | null;
}): Buffer {
  // La flamme est mise à l'échelle sur sa plus grande dimension, puis recentrée sur le carré.
  const facteur = (taille * echelle) / Math.max(TRACE.largeur, TRACE.hauteur);
  const dx = taille / 2 - (TRACE.x + TRACE.largeur / 2) * facteur;
  const dy = taille / 2 - (TRACE.y + TRACE.hauteur / 2) * facteur;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 ${taille} ${taille}">
  ${fond ? `<rect width="${taille}" height="${taille}" fill="${fond}"/>` : ''}
  <g transform="translate(${dx.toFixed(2)} ${dy.toFixed(2)}) scale(${facteur.toFixed(4)})">
    <path d="${FLAMME}" fill="none" stroke="${LIGHT.heroText}" stroke-width="1.6"
          stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`,
    'utf8',
  );
}

const IMAGES = [
  // Opaque et pleine : iOS masque lui-même les coins.
  { nom: 'icon.png', taille: 1024, echelle: 0.62, fond: LIGHT.primary, dossier: ASSETS },
  // Le calque avant d'Android : le dessin reste dans la zone sûre, le fond vient d'`app.config.ts`.
  { nom: 'adaptive-icon.png', taille: 1024, echelle: 0.44, fond: null, dossier: ASSETS },
  // Posée au centre de l'écran de démarrage, dont le fond est déjà de la couleur du thème.
  { nom: 'splash-icon.png', taille: 512, echelle: 0.7, fond: LIGHT.primary, dossier: ASSETS },
  { nom: 'favicon.png', taille: 48, echelle: 0.66, fond: LIGHT.primary, dossier: ASSETS },

  // Le site installé : mêmes règles, autre porte d'entrée.
  { nom: 'icone-192.png', taille: 192, echelle: 0.62, fond: LIGHT.primary, dossier: PUBLIC },
  { nom: 'icone-512.png', taille: 512, echelle: 0.62, fond: LIGHT.primary, dossier: PUBLIC },
  // `maskable` : Android rogne jusqu'à la forme du thème, le dessin tient donc dans le cercle
  // inscrit — la même échelle que le calque adaptatif, pour la même raison.
  {
    nom: 'icone-maskable-512.png',
    taille: 512,
    echelle: 0.44,
    fond: LIGHT.primary,
    dossier: PUBLIC,
  },
  { nom: 'apple-touch-icon.png', taille: 180, echelle: 0.62, fond: LIGHT.primary, dossier: PUBLIC },
] as const;

await mkdir(ASSETS, { recursive: true });
await mkdir(PUBLIC, { recursive: true });

for (const image of IMAGES) {
  const png = await sharp(svg(image)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(image.dossier, image.nom), png);
  console.log(`${image.nom} · ${image.taille}px → ${path.relative(RACINE, image.dossier)}`);
}
