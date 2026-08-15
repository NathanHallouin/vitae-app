/**
 * Écrit `robots.txt`, `sitemap.xml` et `manifest.json` dans les fichiers statiques.
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
import { LIGHT } from '@vitae/core/tokens';
import appConfig from '../apps/app/app.config';

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
    { chemin: '/confidentialite', frequence: 'yearly', priorite: 0.3 },
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

/**
 * Le manifeste d'application web.
 *
 * Sans lui, aucun navigateur ne propose d'installer le site : il reste un onglet. Or cette
 * application est le cas type — tout est calculé sur l'appareil, il n'y a ni compte, ni requête,
 * ni contenu à rafraîchir. Installée, elle s'ouvre en plein écran depuis l'écran d'accueil, sans
 * passer par un magasin ni attendre l'ouverture d'un compte développeur.
 *
 * Les valeurs viennent d'`app.config.ts`, qui les déclarait déjà pour le natif : les redéfinir ici
 * garantirait qu'un jour le nom de l'icône et celui du magasin ne soient plus les mêmes.
 */
function manifest(): string {
  const web = appConfig.web ?? {};

  return `${JSON.stringify(
    {
      id: '/',
      name: web.name,
      short_name: web.shortName,
      description: web.description,
      lang: web.lang,
      // `/` et non `/metabolisme` : à la première ouverture il n'y a pas encore de profil, et
      // l'accueil sait déjà proposer les résultats à qui en a un.
      start_url: '/',
      scope: '/',
      display: 'standalone',
      // Pas d'`orientation`. L'application native est verrouillée en portrait, mais le site a une
      // mise en page à deux colonnes au-delà de 768 px : la contraindre priverait une tablette de
      // ce pour quoi elle a été écrite.
      background_color: LIGHT.bg,
      theme_color: web.themeColor,
      icons: [
        { src: '/icone-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icone-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        {
          src: '/icone-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    null,
    2,
  )}\n`;
}

await mkdir(PUBLIC, { recursive: true });
await Promise.all([
  writeFile(path.join(PUBLIC, 'sitemap.xml'), sitemap(), 'utf8'),
  writeFile(path.join(PUBLIC, 'robots.txt'), robots, 'utf8'),
  writeFile(path.join(PUBLIC, 'manifest.json'), manifest(), 'utf8'),
]);
console.log(
  `sitemap.xml, robots.txt et manifest.json écrits → ${path.relative(process.cwd(), PUBLIC)}`,
);
