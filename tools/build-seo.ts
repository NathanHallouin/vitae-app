/**
 * Écrit `robots.txt` et `sitemap.xml` dans les fichiers statiques de l'application.
 *
 * Next les produisait depuis deux routes ; Expo Router n'a pas d'équivalent, mais il recopie tel
 * quel le contenu de `public/`. Un script suffit donc, et il a l'avantage d'être lisible : on voit
 * le fichier livré, pas la fonction qui le fabrique.
 *
 * `bun run seo`
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllRecipes } from '@vitae/content';
import { SITE_URL } from '@vitae/core/site';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(RACINE, 'apps/app/public');

interface Entree {
  chemin: string;
  frequence: 'weekly' | 'monthly' | 'yearly';
  priorite: number;
  modifiee?: string;
}

/**
 * Les écrans de résultats figurent au sitemap.
 *
 * Leurs explications sont pré-rendues et se lisent sans profil : il y a donc bien du contenu à
 * indexer, même si les chiffres, eux, dépendent de l'appareil du visiteur.
 */
function entrees(): Entree[] {
  return [
    { chemin: '', frequence: 'monthly', priorite: 1 },
    { chemin: '/recettes', frequence: 'weekly', priorite: 0.8 },
    ...['metabolisme', 'alimentation', 'poids', 'bouger'].map(
      (r): Entree => ({ chemin: `/${r}`, frequence: 'monthly', priorite: 0.7 }),
    ),
    { chemin: '/profil', frequence: 'yearly', priorite: 0.5 },
    ...getAllRecipes().map(
      (r): Entree => ({
        chemin: `/recettes/${r.slug}`,
        frequence: 'yearly',
        priorite: 0.7,
        modifiee: r.publiee,
      }),
    ),
  ];
}

function sitemap(): string {
  const urls = entrees()
    .map((e) =>
      [
        '  <url>',
        `    <loc>${SITE_URL}${e.chemin}</loc>`,
        e.modifiee ? `    <lastmod>${e.modifiee}</lastmod>` : null,
        `    <changefreq>${e.frequence}</changefreq>`,
        `    <priority>${e.priorite}</priority>`,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Les écrans de résultats sont indexables : leurs explications sont dans le HTML pré-rendu, et
 * seuls les chiffres personnels dépendent de l'appareil.
 *
 * Deux exclusions, en revanche. Expo Router écrit chaque onglet deux fois — une fois à son adresse
 * publique, une fois sous le nom du groupe `(tabs)` — et publie un `_sitemap` qui n'est qu'un
 * index de développement. Les balises canoniques suffiraient à départager les doublons, mais
 * autant ne pas les faire explorer.
 */
const robots = `User-agent: *
Allow: /
Disallow: /(tabs)/
Disallow: /_sitemap

Sitemap: ${SITE_URL}/sitemap.xml
`;

await mkdir(PUBLIC, { recursive: true });
await Promise.all([
  writeFile(path.join(PUBLIC, 'sitemap.xml'), sitemap(), 'utf8'),
  writeFile(path.join(PUBLIC, 'robots.txt'), robots, 'utf8'),
]);
console.log(`sitemap.xml et robots.txt écrits → ${path.relative(process.cwd(), PUBLIC)}`);
