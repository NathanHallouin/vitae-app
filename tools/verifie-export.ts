/**
 * Ce que l'export livre, confronté à ce qu'il doit livrer.
 *
 * ## Pourquoi un script plutôt qu'un `grep` de plus
 *
 * La CI vérifie déjà beaucoup de choses sur le HTML produit, et toutes à coups de `grep` : c'est
 * le bon outil pour « cette chaîne est-elle là ». Les deux règles ci-dessous ne sont pas de cette
 * forme — elles comparent des **ensembles** et vérifient des **correspondances**, ce qu'un `grep`
 * ne sait pas faire sans devenir illisible.
 *
 * Elles ont aussi ceci de commun qu'elles tiennent aujourd'hui : ce fichier ne corrige rien, il
 * empêche une régression que personne ne verrait. C'est le genre de défaut qui ne se manifeste que
 * dans les statistiques de référencement, trois mois plus tard.
 *
 * ## Règle 1 — chaque page se canonise elle-même
 *
 * `rel="canonical"` dit à un moteur « l'adresse officielle de ce contenu est celle-ci ». Deux pages
 * qui pointent la même en font disparaître une des résultats, sans erreur, sans alerte. La CI
 * vérifiait la **présence** de la balise ; personne ne vérifiait qu'elle pointe la bonne adresse.
 *
 * Deux exceptions, et elles sont voulues :
 *
 * — `(tabs)/*.html` : Expo Router exporte le dossier de groupe littéralement, alors que `(tabs)`
 *   ne fait pas partie de l'URL. Ces cinq doublons pointent la page propre, ce qui est exactement
 *   leur rôle — et c'est **cette canonique** qui les rend inoffensifs. Le `Disallow` de
 *   `robots.txt` n'y suffirait pas : une page interdite au robot est une page dont il ne peut pas
 *   lire la canonique.
 * — `+not-found.html` : elle pointe l'accueil, et porte `noindex`.
 *
 * ## Règle 2 — le sitemap et les pages livrées se correspondent exactement
 *
 * Une page publiée hors du sitemap est une page qu'on a écrite pour rien. Une URL au sitemap sans
 * page derrière est une erreur d'exploration que le moteur retient contre le site entier. Les deux
 * arrivent en ajoutant du contenu, et aucune ne se voit à l'œil.
 *
 * ## Règle 3 — tout ce que le service worker précache existe
 *
 * Le précache est **tolérant à dessein** : une adresse en échec ne fait pas échouer l'installation,
 * sinon une seule page manquante viderait tout le cache. Le revers est qu'une entrée périmée ne dit
 * rien — elle coûte simplement cette page hors ligne, et personne ne s'en aperçoit avant de couper
 * le réseau. La liste étant désormais déduite de `SECTIONS`, une route renommée dans le métier sans
 * page correspondante est exactement le cas à attraper.
 *
 * `bun run verifie:export` — et dans la CI, après l'export.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Glob } from 'bun';

const RACINE = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RACINE, 'apps/app/dist');
const SITE = 'https://metabolisme-de-base.fr';

/** Les pages dont la canonique pointe volontairement ailleurs, et pourquoi. */
const CANONIQUE_AILLEURS: Record<string, string> = {
  '+not-found.html': `${SITE}/`,
};

/** L'URL qu'une page livrée doit revendiquer. */
function urlAttendue(relatif: string): string {
  // `(tabs)` est un groupe de routes : il ne fait pas partie de l'adresse publique.
  const sansGroupe = relatif.replace(/^\(tabs\)\//, '');
  const nu = sansGroupe.replace(/(index)?\.html$/, '').replace(/\/$/, '');
  return nu === '' ? `${SITE}/` : `${SITE}/${nu}`;
}

const fautes: string[] = [];
const pages = [...new Glob('**/*.html').scanSync(DIST)].sort();

for (const relatif of pages) {
  const html = await readFile(path.join(DIST, relatif), 'utf8');
  const trouvee = /rel="canonical" href="([^"]+)"/.exec(html)?.[1];
  if (!trouvee) {
    fautes.push(`${relatif} : aucune canonique`);
    continue;
  }
  const attendue = CANONIQUE_AILLEURS[relatif] ?? urlAttendue(relatif);
  if (trouvee.replace(/\/$/, '') !== attendue.replace(/\/$/, '')) {
    fautes.push(`${relatif} : canonique « ${trouvee} », attendu « ${attendue} »`);
  }
}

const sitemap = await readFile(path.join(DIST, 'sitemap.xml'), 'utf8');
const auSitemap = new Set(
  [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => (m[1] ?? '').replace(/\/$/, '')),
);

// Ce qui a vocation à être indexé : ni les doublons de groupe, ni les pages en `noindex`.
const indexables = new Set<string>();
for (const relatif of pages) {
  if (relatif.startsWith('(tabs)/')) continue;
  const html = await readFile(path.join(DIST, relatif), 'utf8');
  if (/name="robots" content="noindex/.test(html)) continue;
  indexables.add(urlAttendue(relatif).replace(/\/$/, ''));
}

for (const url of [...indexables].sort()) {
  if (!auSitemap.has(url)) fautes.push(`livrée et indexable, mais absente du sitemap : ${url}`);
}
for (const url of [...auSitemap].sort()) {
  if (!indexables.has(url)) fautes.push(`au sitemap, mais aucune page livrée derrière : ${url}`);
}

const sw = await readFile(path.join(DIST, 'sw.js'), 'utf8');
const precache: string[] = JSON.parse(/const PRECACHE = (\[[\s\S]*?\]);/.exec(sw)?.[1] ?? '[]');
const livrees = new Set(
  pages.map((p) => `/${p.replace(/(index)?\.html$/, '').replace(/\/$/, '')}`),
);
livrees.add('/');

for (const adresse of precache) {
  // Seules les pages : les ressources empreintées et le manifeste ne sont pas du HTML.
  if (/\.[a-z0-9]+$/i.test(adresse)) continue;
  if (!livrees.has(adresse.replace(/\/$/, '') || '/')) {
    fautes.push(`précachée par le service worker, mais pas livrée : ${adresse}`);
  }
}

if (fautes.length > 0) {
  console.error(`L'export ne tient pas ses règles — ${fautes.length} faute(s) :\n`);
  for (const f of fautes) console.error(`  ${f}`);
  process.exit(1);
}

console.log(
  `export vérifié · ${pages.length} pages, canoniques correctes · ` +
    `${auSitemap.size} URL au sitemap, exactement les pages indexables · ` +
    `${precache.length} entrées précachées, toutes livrées`,
);
