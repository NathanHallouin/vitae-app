/**
 * Compilation des recettes rédigées en Markdown, dans `packages/content/recettes/`.
 *
 * Ce script tourne une fois, avant les deux builds, et écrit `src/recettes.generated.ts`. Ni
 * `gray-matter` ni `marked` n'arrivent donc au navigateur — c'était déjà le cas — mais surtout ils
 * n'arrivent pas non plus dans le paquet natif, qui n'a ni système de fichiers ni parseur Markdown
 * à sa disposition. L'application embarque le résultat : une recette s'ouvre hors connexion et
 * sans une seule milliseconde d'analyse.
 *
 * Le frontmatter porte les champs structurés (temps, portions, valeurs, ingrédients) parce que
 * c'est lui qui alimente le JSON-LD `Recipe`, celui qui déclenche les résultats enrichis. Le corps
 * Markdown ne sert qu'aux étapes et aux commentaires libres.
 *
 * `bun run --cwd packages/content build`
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASES, SLOTS } from '@vitae/core/recipes';
import matter from 'gray-matter';
import { marked } from 'marked';
import type { Block, Recipe, RecipeMeta } from './types';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.join(ICI, '..', 'recettes');
const SORTIE = path.join(ICI, 'recettes.generated.ts');

function champManquant(slug: string, champ: string): never {
  throw new Error(`Recette « ${slug} » : le champ « ${champ} » manque dans le frontmatter.`);
}

/** Validation stricte : une recette incomplète casse la compilation, pas la page en production. */
function lireMeta(slug: string, data: Record<string, unknown>): RecipeMeta {
  const texte = (champ: string): string =>
    typeof data[champ] === 'string' && data[champ] ? data[champ] : champManquant(slug, champ);
  const nombre = (champ: string): number =>
    typeof data[champ] === 'number' ? data[champ] : champManquant(slug, champ);
  const liste = (champ: string): string[] =>
    Array.isArray(data[champ]) ? (data[champ] as string[]).map(String) : champManquant(slug, champ);

  // YAML transforme une date non quotée en `Date` : on accepte les deux et on normalise en
  // `yyyy-mm-dd`, plutôt que d'obliger l'auteur à penser aux guillemets à chaque recette.
  const date = (champ: string): string => {
    const v = data[champ];
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    if (typeof v === 'string' && v) return v;
    return champManquant(slug, champ);
  };

  /**
   * Vérifié contre les unions du moteur de suggestions, et non contre une liste recopiée : une
   * base ajoutée là-bas devient utilisable ici sans rien toucher, et une faute de frappe casse la
   * compilation plutôt que d'écarter silencieusement la recette des propositions.
   */
  const parmi = <T extends string>(champ: string, valeurs: readonly T[]): T => {
    const v = data[champ];
    if (typeof v === 'string' && (valeurs as readonly string[]).includes(v)) return v as T;
    throw new Error(
      `Recette « ${slug} » : « ${champ} » vaut « ${String(v)} », attendu l'un de ${valeurs.join(', ')}.`,
    );
  };

  return {
    slug,
    titre: texte('titre'),
    description: texte('description'),
    categorie: texte('categorie'),
    moment: parmi('moment', SLOTS),
    base: parmi('base', BASES),
    publiee: date('publiee'),
    preparation: nombre('preparation'),
    cuisson: nombre('cuisson'),
    portions: nombre('portions'),
    kcal: nombre('kcal'),
    proteines: nombre('proteines'),
    ingredients: liste('ingredients'),
    contient: Array.isArray(data.contient) ? (data.contient as string[]).map(String) : [],
  };
}

/**
 * Découpe le corps en trois : ce qui précède la liste numérotée, les étapes, et ce qui la suit.
 *
 * Les étapes sont extraites du Markdown plutôt que dupliquées dans le frontmatter : les redire
 * deux fois, c'est s'exposer à ce que la page, les données structurées et le pas à pas divergent
 * au premier ajustement. Les sortir de la prose permet aussi de les afficher en cases à cocher,
 * plutôt qu'en `<ol>` où l'on perd sa place dès qu'on lève les yeux.
 *
 * Une étape peut tenir sur plusieurs lignes : les lignes indentées qui suivent lui appartiennent.
 */
function decouper(markdown: string): { intro: string; etapes: string[]; suite: string } {
  const lignes = markdown.split('\n');
  const etapes: string[] = [];
  const intro: string[] = [];
  const suite: string[] = [];
  let zone: 'intro' | 'etapes' | 'suite' = 'intro';

  for (const ligne of lignes) {
    const debut = ligne.match(/^\s*\d+\.\s+(.*)$/);

    if (debut) {
      if (zone === 'suite') {
        // Une seconde liste numérotée après d'autres paragraphes n'est pas la recette.
        suite.push(ligne);
        continue;
      }
      zone = 'etapes';
      etapes.push(debut[1].trim());
      continue;
    }

    if (zone === 'etapes') {
      // Ligne indentée non vide : continuation de l'étape précédente.
      if (/^\s+\S/.test(ligne) && etapes.length > 0) {
        etapes[etapes.length - 1] += ` ${ligne.trim()}`;
        continue;
      }
      if (ligne.trim() === '') continue;
      zone = 'suite';
    }

    (zone === 'intro' ? intro : suite).push(ligne);
  }

  return { intro: intro.join('\n').trim(), etapes, suite: suite.join('\n').trim() };
}

/**
 * La même prose, en blocs plutôt qu'en HTML, pour le rendu natif.
 *
 * Le vocabulaire employé dans les recettes se limite aux paragraphes et aux titres de niveau 2 :
 * on s'arrête là plutôt que d'écrire un convertisseur Markdown complet dont personne n'a besoin.
 * L'emphase est retirée du texte, faute d'être restituable dans un simple `<Text>`.
 */
function enBlocs(markdown: string): Block[] {
  if (!markdown) return [];
  return markdown
    .split(/\n{2,}/)
    .map((bloc) => bloc.trim())
    .filter(Boolean)
    .map((bloc) => {
      const titre = bloc.match(/^##\s+(.*)$/);
      const brut = titre ? titre[1] : bloc;
      const text = brut
        .replace(/\s*\n\s*/g, ' ')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/(^|\W)\*(.+?)\*(?=\W|$)/g, '$1$2')
        .replace(/`(.+?)`/g, '$1')
        .trim();
      return { type: titre ? ('h2' as const) : ('p' as const), text };
    })
    .filter((b) => b.text.length > 0);
}

async function lireRecette(slug: string): Promise<Recipe> {
  const brut = await readFile(path.join(RACINE, `${slug}.md`), 'utf8');
  const { data, content } = matter(brut);
  const { intro, etapes, suite } = decouper(content);

  if (etapes.length === 0) {
    throw new Error(`Recette « ${slug} » : aucune étape numérotée trouvée dans le corps.`);
  }

  return {
    ...lireMeta(slug, data as Record<string, unknown>),
    etapes,
    introHtml: await marked.parse(intro),
    suiteHtml: await marked.parse(suite),
    introBlocks: enBlocs(intro),
    suiteBlocks: enBlocs(suite),
  };
}

async function main(): Promise<void> {
  let noms: string[];
  try {
    noms = (await readdir(RACINE)).filter((n) => n.endsWith('.md'));
  } catch {
    // Pas encore de dossier de contenu : le site fonctionne, la rubrique est simplement vide.
    noms = [];
  }

  const recettes = (await Promise.all(noms.map((n) => lireRecette(n.replace(/\.md$/, ''))))).sort(
    (a, b) => b.publiee.localeCompare(a.publiee),
  );

  const entete = [
    '// Fichier généré par `bun run --cwd packages/content build`. Ne pas modifier à la main :',
    '// la source est `packages/content/recettes/*.md`.',
    '',
    "import type { Recipe } from './types';",
    '',
    'export const RECETTES: Recipe[] = ',
  ].join('\n');

  await writeFile(SORTIE, `${entete}${JSON.stringify(recettes, null, 2)};\n`, 'utf8');
  console.log(
    `${recettes.length} recette(s) compilée(s) → ${path.relative(process.cwd(), SORTIE)}`,
  );
}

await main();
