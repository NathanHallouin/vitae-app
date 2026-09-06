/**
 * Va chercher une photo par recette, et la range là où `build-photos.ts` l'attend.
 *
 * ## Ce que ce script fait, et ce qu'il ne fait pas
 *
 * Il **fait la part mécanique** : soixante-deux requêtes, le filtrage sur le format et la
 * définition, le téléchargement, le nommage par slug, et la trace de provenance. Il ne fait pas la
 * part de jugement — `photos/CHOIX.md` énonce six règles (lumière du jour, plongeant vertical, fond
 * mat neutre, plat sur 70 à 80 % du cadre, aucune main, ingrédient dominant reconnaissable) qu'une
 * recherche par mots-clés ne sait pas vérifier. D'où la planche-contact : le script propose, on
 * dispose.
 *
 * ## La clé
 *
 * `PEXELS_API_KEY` dans l'environnement, **jamais dans le dépôt** — c'est la règle d'`AGENTS.md`,
 * et c'est aussi la seule frontière qui tienne ici puisqu'il n'y a ni serveur ni base.
 *
 *     PEXELS_API_KEY=… bun run photos:fetch
 *
 * ## Pourquoi Pexels et pas une banque sans clé
 *
 * Mesuré avant de choisir : sur les banques CC0 interrogeables sans clé, le catalogue donne zéro
 * résultat pour le bircher au skyr, un pour le poulet-quinoa, un pour le bœuf bourguignon — et
 * celui-là est pris dans un restaurant de yakiniku. Remplir soixante-deux cases avec ça produirait
 * précisément ce que `CHOIX.md` demande d'éviter : une collection, pas un catalogue.
 *
 * La licence Pexels autorise l'usage commercial sans attribution, ce qu'exige une application
 * publiée sur deux magasins. `photos/sources.json` garde tout de même l'auteur et l'adresse de
 * chaque photo : non par obligation, mais parce qu'une provenance qu'on ne peut plus retrouver est
 * une licence qu'on ne peut plus prouver.
 */

import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCES = path.join(RACINE, 'photos');
const REQUETES = path.join(SOURCES, 'requetes.json');
const PROVENANCE = path.join(SOURCES, 'sources.json');

const CLE = process.env.PEXELS_API_KEY;

/** Ce qu'une photo doit valoir avant même qu'on la regarde. */
const LARGEUR_MIN = 1600;
/** Le cadrage cible est 3:2 ; en dessous de ce rapport, le recadrage automatique ampute le plat. */
const RAPPORT_MIN = 1.4;

interface PhotoPexels {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: { original: string; large2x: string };
}

/**
 * Reprend **exactement** la photo déjà retenue, par son identifiant.
 *
 * C'est ce qui permet de ne pas versionner les originaux. Cent soixante et un mégaoctets de JPEG
 * dans l'historique de git y resteraient pour toujours ; `photos/sources.json` pèse quelques
 * kilo-octets et dit précisément quelle photo va avec quelle recette. Un clone neuf relance
 * `photos:fetch` et retrouve les mêmes images, pas des images ressemblantes.
 *
 * Le choix — la part de jugement — est donc dans le dépôt. Les octets n'y sont pas, comme les
 * images de partage et les jetons de thème : ce qui se régénère ne se commite pas.
 */
async function parIdentifiant(id: number): Promise<PhotoPexels | null> {
  const reponse = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
    headers: { Authorization: CLE ?? '' },
  });
  if (!reponse.ok) return null;
  return (await reponse.json()) as PhotoPexels;
}

async function chercher(requete: string, page = 1): Promise<PhotoPexels[]> {
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', requete);
  url.searchParams.set('orientation', 'landscape');
  url.searchParams.set('size', 'large');
  url.searchParams.set('locale', 'fr-FR');
  url.searchParams.set('per_page', '15');
  url.searchParams.set('page', String(page));

  const reponse = await fetch(url, { headers: { Authorization: CLE ?? '' } });
  if (reponse.status === 429) {
    throw new Error(
      'quota Pexels atteint — reprendre plus tard, les photos déjà prises sont gardées',
    );
  }
  if (!reponse.ok) throw new Error(`Pexels a répondu ${reponse.status} pour « ${requete} »`);
  const data = (await reponse.json()) as { photos?: PhotoPexels[] };
  return data.photos ?? [];
}

/**
 * Ce qui disqualifie une photo avant même qu'on la regarde.
 *
 * La première passe a montré ce que la pertinence de Pexels laisse passer : une personne en train
 * de manger, une tasse de marque, des poules vivantes pour « poulet basquaise ». Les règles 5 et 6
 * de `CHOIX.md` — aucune main, aucun visage, aucune marque, et le plat est ce qu'il dit être — se
 * lisent en partie dans la description que Pexels fournit.
 *
 * C'est un filtre grossier et il l'assume : il écarte ce qui se dit, pas ce qui se voit. La
 * planche-contact reste le seul juge.
 */
const MOTS_INTERDITS = [
  'personne',
  'femme',
  'homme',
  'chef',
  'main',
  'mains',
  'enfant',
  'poules',
  'poule',
  'coq',
  'vache',
  'marque',
  'logo',
  'restaurant',
  'menu',
];

/** Ce qui, dans une description, dit que le plat est cuisiné et non posé cru sur une planche. */
const MOTS_CRUS = ['crus', 'crues', 'fraîchement récolté', 'planche à découper', 'nature morte'];

function disqualifiee(p: PhotoPexels): boolean {
  const texte = (p.alt ?? '').toLowerCase();
  return [...MOTS_INTERDITS, ...MOTS_CRUS].some((mot) => new RegExp(`\\b${mot}\\b`).test(texte));
}

/**
 * Le score d'une candidate : combien de mots de la requête sa description reprend.
 *
 * Pexels classe par pertinence globale ; ce tri-ci privilégie **le plat annoncé**. « Curry de
 * lentilles » l'emporte sur « bol de légumineuses » pour le dahl, alors que Pexels les jugeait
 * proches.
 */
function score(p: PhotoPexels, requete: string): number {
  const texte = (p.alt ?? '').toLowerCase();
  return requete
    .toLowerCase()
    .split(/\s+/)
    .filter((mot) => mot.length > 3 && texte.includes(mot)).length;
}

/** Les candidates qui passent le format et les règles, les plus ressemblantes d'abord. */
function retenables(
  photos: PhotoPexels[],
  requete: string,
  dejaPrises: Set<number>,
): PhotoPexels[] {
  return photos
    .filter(
      (p) =>
        p.width >= LARGEUR_MIN &&
        p.width / p.height >= RAPPORT_MIN &&
        // Une même photo sur deux cartes se voit immédiatement dans une grille de soixante-deux.
        !dejaPrises.has(p.id) &&
        !disqualifiee(p),
    )
    .sort((a, b) => score(b, requete) - score(a, requete));
}

async function telecharger(photo: PhotoPexels, cible: string): Promise<void> {
  const reponse = await fetch(photo.src.original);
  if (!reponse.ok) throw new Error(`téléchargement impossible : ${reponse.status}`);
  await writeFile(cible, Buffer.from(await reponse.arrayBuffer()));
}

async function main(): Promise<void> {
  if (!CLE) {
    console.error('PEXELS_API_KEY manquante.\n');
    console.error('  Une clé gratuite se crée sur https://www.pexels.com/api/ — sans carte.');
    console.error('  Puis :  PEXELS_API_KEY=… bun run photos:fetch\n');
    console.error('  Elle ne doit pas entrer dans le dépôt : ni fichier, ni commit.');
    process.exit(1);
  }

  const requetes = JSON.parse(await readFile(REQUETES, 'utf8')) as Record<string, string>;
  const provenance: Record<string, unknown> = existsSync(PROVENANCE)
    ? JSON.parse(await readFile(PROVENANCE, 'utf8'))
    : {};
  const planche: string[] = [];
  await mkdir(SOURCES, { recursive: true });

  let prises = 0;
  let sautees = 0;
  const sansResultat: string[] = [];
  // Reprend les identifiants déjà retenus lors d'une exécution précédente : relancer le script ne
  // doit pas réintroduire un doublon avec une photo qu'on garde.
  const dejaPrises = new Set<number>(
    Object.values(provenance)
      .map((v) => (v as { id?: number }).id)
      .filter((id): id is number => typeof id === 'number'),
  );

  for (const [slug, requete] of Object.entries(requetes)) {
    const cible = path.join(SOURCES, `${slug}.jpg`);
    if (existsSync(cible)) {
      sautees++;
      continue;
    }

    // Une photo déjà choisie se reprend telle quelle : la recherche ne rejoue pas, et le
    // catalogue ne dérive pas d'une exécution à l'autre.
    const connue = (provenance[slug] as { id?: number } | undefined)?.id;
    if (typeof connue === 'number') {
      const reprise = await parIdentifiant(connue);
      if (reprise) {
        await telecharger(reprise, cible);
        dejaPrises.add(reprise.id);
        prises++;
        await new Promise((r) => setTimeout(r, 250));
        continue;
      }
    }

    // Deux pages si la première ne donne rien d'acceptable : les filtres sont exigeants, et une
    // requête étroite comme « papillote lieu noir poireaux » a peu de candidates par page.
    let candidates = retenables(await chercher(requete), requete, dejaPrises);
    if (candidates.length === 0) {
      candidates = retenables(await chercher(requete, 2), requete, dejaPrises);
    }
    if (candidates.length === 0) {
      sansResultat.push(`${slug} — « ${requete} »`);
      continue;
    }

    const choisie = candidates[0];
    if (!choisie) continue;
    dejaPrises.add(choisie.id);
    await telecharger(choisie, cible);
    provenance[slug] = {
      requete,
      id: choisie.id,
      auteur: choisie.photographer,
      auteurUrl: choisie.photographer_url,
      page: choisie.url,
      dimensions: `${choisie.width}×${choisie.height}`,
      description: choisie.alt,
    };
    prises++;

    // Les quatre suivantes vont sur la planche : c'est là que se fait le choix humain.
    planche.push(
      `<section><h2>${slug}</h2><p class="q">« ${requete} »</p><div class="g">` +
        [choisie, ...candidates.slice(1, 5)]
          .map(
            (p, i) =>
              `<figure class="${i === 0 ? 'prise' : ''}">` +
              `<img src="${p.src.large2x}" alt="${p.alt ?? ''}" loading="lazy">` +
              `<figcaption>${i === 0 ? '<b>retenue</b> · ' : ''}${p.photographer} · ` +
              `<a href="${p.url}">${p.id}</a></figcaption></figure>`,
          )
          .join('') +
        `</div></section>`,
    );

    // Pexels tolère 200 requêtes par heure : on reste large.
    await new Promise((r) => setTimeout(r, 250));
  }

  await writeFile(PROVENANCE, `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');
  await writeFile(
    path.join(SOURCES, 'planche.html'),
    `<!doctype html><meta charset="utf-8"><title>Planche-contact des recettes</title>
<style>body{font:15px/1.5 system-ui;margin:2rem;background:#f3f2f7;color:#14131c}
h1{font-size:1.4rem}h2{font-size:1rem;margin:0 0 .2rem;font-family:ui-monospace,monospace}
.q{margin:0 0 .6rem;color:#52505f;font-size:.85rem}
section{margin-bottom:2.2rem}.g{display:flex;gap:.6rem;flex-wrap:wrap}
figure{margin:0;width:230px}figure img{width:100%;aspect-ratio:3/2;object-fit:cover;border-radius:8px;display:block}
figure.prise img{outline:3px solid #3a3495;outline-offset:2px}
figcaption{font-size:.72rem;color:#52505f;margin-top:.25rem}</style>
<h1>Planche-contact — ${planche.length} recettes</h1>
<p>La première de chaque ligne est celle qui a été enregistrée dans <code>photos/&lt;slug&gt;.jpg</code>.
Pour en préférer une autre : téléchargez-la depuis sa page et remplacez le fichier, puis
<code>bun run photos</code>.</p>
${planche.join('\n')}`,
    'utf8',
  );

  console.log(`${prises} photo(s) prises · ${sautees} déjà présentes`);
  if (sansResultat.length > 0) {
    console.log(`\n${sansResultat.length} recette(s) sans candidate au format demandé :`);
    for (const s of sansResultat) console.log(`  ${s}`);
    console.log('\n  Affinez la requête dans photos/requetes.json, puis relancez.');
  }
  console.log('\nPlanche-contact : photos/planche.html');
}

await main();
