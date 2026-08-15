/**
 * Écrit le service worker, **après** l'export du site.
 *
 * Il ne peut pas vivre dans `public/` comme les autres fichiers engendrés : il doit nommer le
 * paquet JavaScript et la feuille de style, dont le nom porte une empreinte que seul l'export
 * connaît. Ce script lit donc `dist/` et écrit dedans.
 *
 * Pourquoi un service worker, alors que le manifeste rend déjà le site installable : parce qu'une
 * application installée qui s'ouvre hors ligne affiche la page d'erreur du navigateur, ce qui est
 * absurde ici — tout est calculé sur l'appareil, les recettes sont dans le paquet, il n'y a rien
 * à aller chercher. Chrome en fait d'ailleurs une condition : sans lui, il ne propose pas
 * l'installation du tout, quel que soit le manifeste.
 *
 * Trois règles, et le choix de chacune se paie si on se trompe :
 *
 * — **Les pages passent par le réseau d'abord**, le cache ne servant que s'il échoue. L'inverse —
 *   le cache d'abord — est le piège classique du service worker : une version fautive reste
 *   servie indéfiniment, et l'utilisateur n'a aucun moyen de s'en sortir. Ici, un déploiement est
 *   pris en compte au premier chargement en ligne.
 * — **Les ressources empreintées passent par le cache d'abord.** Leur nom change à chaque build :
 *   une réponse mise en cache ne peut pas être périmée, elle ne peut être qu'absente.
 * — **Le cache est versionné sur l'empreinte du paquet.** À l'activation, tous les autres sont
 *   supprimés : il n'y a jamais deux versions du site en mémoire.
 *
 * `bun run sw`, et c'est enchaîné par `bun run build:web`.
 */

import { readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { POLICES } from './polices';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(RACINE, 'apps/app/dist');

/** Les fichiers d'un dossier, en chemins absolus, récursivement. */
async function fichiers(dossier: string): Promise<string[]> {
  const entrees = await readdir(dossier, { withFileTypes: true });
  const listes = await Promise.all(
    entrees.map(async (e) => {
      const complet = path.join(dossier, e.name);
      return e.isDirectory() ? fichiers(complet) : [complet];
    }),
  );
  return listes.flat();
}

const tous = await fichiers(path.join(DIST, '_expo/static'));
const paquet = tous.find((f) => f.endsWith('.js'));
const style = tous.find((f) => f.endsWith('.css'));

if (!paquet || !style) {
  console.error('Paquet JavaScript ou feuille de style introuvable : lancer l’export d’abord.');
  process.exit(1);
}

const adresse = (f: string) => `/${path.relative(DIST, f).split(path.sep).join('/')}`;

/**
 * Ce qui est mis en cache dès l'installation : de quoi ouvrir l'application hors ligne sans
 * l'avoir visitée page par page.
 *
 * Les soixante-deux recettes n'y sont pas — deux mégaoctets de HTML pour un catalogue qu'on ne
 * parcourt pas forcément. Elles se mettent en cache à la visite, comme le reste.
 */
const PRECACHE = [
  '/',
  '/metabolisme',
  '/alimentation',
  '/poids',
  '/bouger',
  '/profil',
  '/recettes',
  '/confidentialite',
  '/manifest.json',
  '/favicon.ico',
  '/icone-192.png',
  '/icone-512.png',
  adresse(paquet),
  adresse(style),
  // La liste vient de `build-fonts.ts` : une coupe ajoutée là entre ici toute seule. Sans elles,
  // une page hors ligne s'afficherait en police système — correcte, mais méconnaissable.
  ...POLICES.map((p) => `/polices/${p.fichier}.woff2`),
];

// L'empreinte du paquet suffit à identifier la version : elle change dès qu'une ligne de code
// change, et c'est exactement quand le cache doit être renouvelé.
const VERSION = path.basename(paquet).replace(/^entry-|\.js$/g, '');

const source = `/* Engendré par tools/build-sw.ts — ne pas modifier à la main. */
const CACHE = 'vitae-${VERSION}';
const PRECACHE = ${JSON.stringify(PRECACHE, null, 2)};

/**
 * Précache tolérant : chaque entrée est demandée pour elle-même.
 *
 * \`cache.addAll()\` est tout ou rien — une seule adresse en échec vide l'installation entière, sans
 * bruit. C'est arrivé au premier essai : un serveur qui ne sait pas rendre \`/metabolisme\` pour
 * \`metabolisme.html\` a suffi à ce que rien ne soit mis en cache. Une page manquante doit coûter
 * cette page hors ligne, pas tout le reste.
 *
 * \`cache: 'reload'\` court-circuite le cache HTTP, et **seulement pour les pages** : sans lui, une
 * réponse déjà périmée s'installerait pour toute la durée de la version. L'appliquer aux ressources
 * empreintées serait au contraire une faute — la page vient de les télécharger, et les redemander
 * en ignorant le cache HTTP ferait payer deux fois les 2,7 Mo du paquet à la première visite.
 */
async function precacher() {
  const cache = await caches.open(CACHE);
  await Promise.all(
    PRECACHE.map(async (adresse) => {
      try {
        const options = immuable(new URL(adresse, self.location.origin))
          ? undefined
          : { cache: 'reload' };
        const reponse = await fetch(new Request(adresse, options));
        if (reponse.ok) await cache.put(adresse, reponse);
      } catch (erreur) {
        // Hors ligne pendant l'installation, ou adresse absente : tant pis pour celle-là.
      }
    }),
  );
}

self.addEventListener('install', (e) => {
  e.waitUntil(precacher().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((noms) => Promise.all(noms.filter((n) => n !== CACHE).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

/**
 * Ressources dont le contenu ne peut pas changer sans que l'adresse change.
 *
 * Les deux premiers dossiers portent une empreinte dans le nom du fichier. Les polices, elles,
 * gardent un nom stable, mais une coupe de caractères ne change pas : la remplacer voudrait dire
 * changer de police, ce qui passe par \`tools/build-fonts.ts\` et un nouveau déploiement.
 */
function immuable(url) {
  return (
    url.pathname.startsWith('/_expo/static/') ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/polices/')
  );
}

async function depuisLeCache(requete) {
  const cache = await caches.open(CACHE);
  const connue = await cache.match(requete);
  if (connue) return connue;
  const reponse = await fetch(requete);
  if (reponse.ok) cache.put(requete, reponse.clone());
  return reponse;
}

async function depuisLeReseau(requete, repli) {
  const cache = await caches.open(CACHE);
  try {
    const reponse = await fetch(requete);
    if (reponse.ok) cache.put(requete, reponse.clone());
    return reponse;
  } catch (erreur) {
    const connue = await cache.match(requete);
    if (connue) return connue;
    // Hors ligne sur une page jamais visitée : l'accueil vaut mieux que l'erreur du navigateur,
    // le routeur reprenant la main une fois l'application chargée.
    if (repli) {
      const accueil = await cache.match('/');
      if (accueil) return accueil;
    }
    throw erreur;
  }
}

self.addEventListener('fetch', (e) => {
  const requete = e.request;
  if (requete.method !== 'GET') return;

  const url = new URL(requete.url);
  if (url.origin !== self.location.origin) return;

  if (immuable(url)) return e.respondWith(depuisLeCache(requete));
  e.respondWith(depuisLeReseau(requete, requete.mode === 'navigate'));
});
`;

await writeFile(path.join(DIST, 'sw.js'), source, 'utf8');

const poids = await Promise.all(
  [paquet, style].map(async (f) => Math.round((await stat(f)).size / 1024)),
);
console.log(`sw.js écrit · version ${VERSION.slice(0, 8)} · ${PRECACHE.length} entrées précachées`);
console.log(`  paquet ${poids[0]} Ko, style ${poids[1]} Ko`);
