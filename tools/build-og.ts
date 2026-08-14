/**
 * Les images de partage, une par recette plus une par défaut.
 *
 * Ce sont elles qui s'affichent quand un lien est collé dans une conversation ou sur un réseau.
 * Sans elles, une recette partagée n'est qu'une ligne de texte gris ; avec, c'est une carte au
 * format du produit, ce qui change complètement le taux d'ouverture.
 *
 * Deux choses méritent d'être expliquées.
 *
 * **Les polices viennent de `node_modules`, pas du système.** Le moteur de rendu SVG résout les
 * familles par fontconfig, qui interroge les polices installées sur la machine : une image
 * engendrée ici et une image engendrée en intégration continue n'auraient pas la même typographie,
 * et l'écart passerait inaperçu jusqu'à ce que quelqu'un partage un lien. On écrit donc une
 * configuration fontconfig qui ne désigne que les deux fichiers du projet.
 *
 * Elle doit être en place *avant* le démarrage du processus : fontconfig la lit à l'initialisation
 * de la bibliothèque native, et la poser depuis le script arrive trop tard — l'image sort dans une
 * police générique, sans le moindre avertissement. Le script se relance donc une fois, avec la
 * variable d'environnement posée. C'est le prix d'une typographie identique partout.
 *
 * **Le texte est découpé à la main.** SVG ne sait pas renvoyer un texte à la ligne : chaque ligne
 * est un `<text>` distinct, et la largeur se mesure au jugé, à partir de la largeur moyenne d'un
 * caractère. C'est approximatif, et c'est suffisant — la taille de police baisse d'un cran quand
 * le titre est long, ce qui absorbe l'imprécision.
 *
 * `bun run og`
 */

import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getAllRecipes } from '@vitae/content';
import { LIGHT } from '@vitae/core/tokens';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(RACINE, 'apps/app/public');
const CACHE = path.join(RACINE, 'node_modules/.cache/og');

/** Format attendu par les réseaux sociaux ; en deçà, l'image est recadrée ou ignorée. */
const LARGEUR = 1200;
const HAUTEUR = 630;

/** Écrit les polices du projet et la configuration fontconfig qui les désigne. */
async function preparerPolices(): Promise<string> {
  const polices = path.join(CACHE, 'polices');
  await mkdir(polices, { recursive: true });
  await mkdir(path.join(CACHE, 'cache'), { recursive: true });

  const source = path.join(RACINE, 'node_modules/@expo-google-fonts');
  await Bun.write(
    Bun.file(path.join(polices, 'Fraunces.ttf')),
    Bun.file(path.join(source, 'fraunces/600SemiBold/Fraunces_600SemiBold.ttf')),
  );
  await Bun.write(
    Bun.file(path.join(polices, 'Inter.ttf')),
    Bun.file(path.join(source, 'inter/400Regular/Inter_400Regular.ttf')),
  );

  const conf = path.join(CACHE, 'fonts.conf');
  await writeFile(
    conf,
    `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <dir>${polices}</dir>
  <cachedir>${path.join(CACHE, 'cache')}</cachedir>
</fontconfig>
`,
    'utf8',
  );
  return conf;
}

/** `&`, `<` et `>` dans un titre casseraient le document SVG. */
function echapper(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Découpe un titre en lignes qui tiennent dans la largeur.
 *
 * La largeur moyenne d'un caractère de la Fraunces tourne autour de 52 % de son corps ; un mot qui
 * dépasse seul n'est pas coupé, on préfère un débordement discret à une césure fautive.
 */
function lignes(texte: string, corps: number, largeurMax: number): string[] {
  const parCaractere = corps * 0.52;
  const maxi = Math.floor(largeurMax / parCaractere);
  const out: string[] = [];
  let courante = '';

  for (const mot of texte.split(' ')) {
    const essai = courante ? `${courante} ${mot}` : mot;
    if (essai.length <= maxi || !courante) {
      courante = essai;
    } else {
      out.push(courante);
      courante = mot;
    }
  }
  if (courante) out.push(courante);
  return out;
}

/** Le tracé de la flamme, repris du jeu d'icônes : le même signe que sur l'écran d'accueil. */
const FLAMME =
  'M12 3c2.8 3.2 4.8 5.6 4.8 8.6a4.8 4.8 0 0 1-9.6 0c0-1.7.8-3 1.8-4 .2 1.3.9 2 1.7 2 1.1 0 1.6-.9 1.6-2.2 0-1.5-.5-2.9-.3-4.4Z';

function carte({ titre, sous }: { titre: string; sous: string }): Buffer {
  // Trois crans de corps : au-delà de quatre lignes, le titre déborderait sous le sous-titre.
  const corps = titre.length > 46 ? 58 : titre.length > 28 ? 70 : 82;
  const rendues = lignes(titre, corps, LARGEUR - 200).slice(0, 3);
  const hauteurBloc = rendues.length * corps * 1.2;
  const depart = (HAUTEUR - hauteurBloc) / 2 + corps * 0.9;

  const titreSvg = rendues
    .map(
      (l, i) =>
        `<text x="100" y="${depart + i * corps * 1.2}" font-family="Fraunces" font-size="${corps}" fill="${LIGHT.heroText}">${echapper(l)}</text>`,
    )
    .join('\n  ');

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}">
  <defs>
    <linearGradient id="fond" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${LIGHT.heroFrom}"/>
      <stop offset="100%" stop-color="${LIGHT.heroTo}"/>
    </linearGradient>
  </defs>
  <rect width="${LARGEUR}" height="${HAUTEUR}" fill="url(#fond)"/>
  <g transform="translate(100 74) scale(2.2)" fill="none" stroke="${LIGHT.heroText}" stroke-width="1.6"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="${FLAMME}"/>
  </g>
  <text x="160" y="112" font-family="Inter" font-size="28" fill="${LIGHT.heroText}" opacity="0.85">Métabolisme de base</text>
  ${titreSvg}
  <text x="100" y="${HAUTEUR - 70}" font-family="Inter" font-size="30" fill="${LIGHT.heroText}" opacity="0.9">${echapper(sous)}</text>
</svg>`,
    'utf8',
  );
}

const conf = await preparerPolices();

/**
 * Second passage, avec fontconfig en place.
 *
 * Se relancer plutôt que poser la variable ici : elle serait lue trop tard. Le premier passage ne
 * fait qu'écrire les fichiers et céder la main.
 */
if (process.env.FONTCONFIG_FILE !== conf) {
  const enfant = Bun.spawn(['bun', 'run', import.meta.path], {
    env: { ...process.env, FONTCONFIG_FILE: conf },
    stdout: 'inherit',
    stderr: 'inherit',
  });
  process.exit(await enfant.exited);
}

const sharp = (await import('sharp')).default;

const dossier = path.join(PUBLIC, 'og');
await rm(dossier, { recursive: true, force: true });
await mkdir(dossier, { recursive: true });

await sharp(
  carte({
    titre: 'Combien votre corps brûle-t-il de calories ?',
    sous: 'Vos chiffres en une minute, sans compte à créer',
  }),
)
  .png({ compressionLevel: 9 })
  .toFile(path.join(PUBLIC, 'og.png'));

const recettes = getAllRecipes();
for (const r of recettes) {
  await sharp(
    carte({
      titre: r.titre,
      sous: `${r.preparation + r.cuisson} min · ${r.kcal} kcal · ${r.proteines} g de protéines`,
    }),
  )
    .png({ compressionLevel: 9 })
    .toFile(path.join(dossier, `${r.slug}.png`));
}

console.log(
  `${recettes.length + 1} images de partage écrites → ${path.relative(process.cwd(), PUBLIC)}`,
);
