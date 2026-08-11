/**
 * Lecture des recettes rédigées en Markdown, dans `content/recettes/`.
 *
 * Tout se fait à la compilation, dans des Server Components : ni `gray-matter` ni `marked`
 * n'arrivent jamais au navigateur, et les pages sont du HTML statique. C'est le point de la
 * bascule — une recette est un article, pas une application.
 *
 * Le frontmatter porte les champs structurés (temps, portions, valeurs, ingrédients) parce que
 * c'est lui qui alimente le JSON-LD `Recipe`, celui qui déclenche les résultats enrichis. Le corps
 * Markdown ne sert qu'aux étapes et aux commentaires libres.
 */

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';

const RACINE = path.join(process.cwd(), 'content', 'recettes');

export interface RecipeMeta {
  slug: string;
  titre: string;
  /** phrase de résumé : sert de meta description et de chapeau */
  description: string;
  /** minutes */
  preparation: number;
  cuisson: number;
  portions: number;
  /** par portion */
  kcal: number;
  proteines: number;
  ingredients: string[];
  /** repris tel quel dans le JSON-LD : « Plat principal », « Petit-déjeuner »… */
  categorie: string;
  /** date ISO de publication, pour le sitemap et le JSON-LD */
  publiee: string;
  /** correspond aux filtres de `recipes.ts` : viande, poisson, porc, oeufs, laitier */
  contient: string[];
}

export interface Recipe extends RecipeMeta {
  /** étapes extraites du Markdown, pour `recipeInstructions` et pour l'affichage pas à pas */
  etapes: string[];
  /** ce qui précède la liste numérotée, en HTML */
  introHtml: string;
  /** ce qui la suit, en HTML */
  suiteHtml: string;
}

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

  return {
    slug,
    titre: texte('titre'),
    description: texte('description'),
    categorie: texte('categorie'),
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

async function fichiers(): Promise<string[]> {
  try {
    const noms = await readdir(RACINE);
    return noms.filter((n) => n.endsWith('.md'));
  } catch {
    // Pas encore de dossier de contenu : le site fonctionne, la rubrique est simplement vide.
    return [];
  }
}

export async function getRecipe(slug: string): Promise<Recipe | null> {
  let brut: string;
  try {
    brut = await readFile(path.join(RACINE, `${slug}.md`), 'utf8');
  } catch {
    return null;
  }

  const { data, content } = matter(brut);
  const { intro, etapes, suite } = decouper(content);
  return {
    ...lireMeta(slug, data as Record<string, unknown>),
    etapes,
    introHtml: await marked.parse(intro),
    suiteHtml: await marked.parse(suite),
  };
}

/** Toutes les recettes, de la plus récente à la plus ancienne. */
export async function getAllRecipes(): Promise<Recipe[]> {
  const noms = await fichiers();
  const recettes = await Promise.all(noms.map((n) => getRecipe(n.replace(/\.md$/, ''))));
  return recettes
    .filter((r): r is Recipe => r !== null)
    .sort((a, b) => b.publiee.localeCompare(a.publiee));
}

export async function getRecipeSlugs(): Promise<string[]> {
  return (await fichiers()).map((n) => n.replace(/\.md$/, ''));
}

/** Total en minutes, pour l'affichage et la durée ISO 8601 du JSON-LD. */
export function dureeTotale(r: RecipeMeta): number {
  return r.preparation + r.cuisson;
}

export function dureeISO(minutes: number): string {
  return `PT${minutes}M`;
}
