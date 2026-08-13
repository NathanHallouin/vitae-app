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
  { nom: 'icon.png', taille: 1024, echelle: 0.62, fond: LIGHT.primary },
  // Le calque avant d'Android : le dessin reste dans la zone sûre, le fond vient d'`app.config.ts`.
  { nom: 'adaptive-icon.png', taille: 1024, echelle: 0.44, fond: null },
  // Posée au centre de l'écran de démarrage, dont le fond est déjà de la couleur du thème.
  { nom: 'splash-icon.png', taille: 512, echelle: 0.7, fond: LIGHT.primary },
  { nom: 'favicon.png', taille: 48, echelle: 0.66, fond: LIGHT.primary },
] as const;

await mkdir(ASSETS, { recursive: true });

for (const image of IMAGES) {
  const png = await sharp(svg(image)).png({ compressionLevel: 9 }).toBuffer();
  await writeFile(path.join(ASSETS, image.nom), png);
  console.log(`${image.nom} · ${image.taille}px`);
}

console.log(`→ ${path.relative(process.cwd(), ASSETS)}`);
