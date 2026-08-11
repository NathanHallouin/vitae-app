import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RecetteAtelier, { GarderEcranAllume } from '@/components/recette/RecetteAtelier';
import { dureeISO, dureeTotale, getRecipe, getRecipeSlugs } from '@/lib/content';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/** Toutes les recettes sont connues à la compilation : chaque page est un fichier HTML statique. */
export async function generateStaticParams() {
  return (await getRecipeSlugs()).map((slug) => ({ slug }));
}

/** Une URL hors liste renvoie 404 plutôt que d'être rendue à la demande. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recette = await getRecipe(slug);
  if (!recette) return {};

  const url = `${SITE_URL}/recettes/${slug}`;
  return {
    title: `${recette.titre} : ${recette.kcal} kcal et ${recette.proteines} g de protéines`,
    description: recette.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: recette.titre,
      description: recette.description,
      url,
      siteName: SITE_NAME,
      locale: 'fr_FR',
    },
  };
}

export default async function RecettePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recette = await getRecipe(slug);
  if (!recette) notFound();

  const total = dureeTotale(recette);

  /**
   * Données structurées schema.org `Recipe`.
   *
   * C'est le levier SEO principal d'un site de recettes : c'est lui qui déclenche les résultats
   * enrichis (photo, durée, calories) plutôt qu'un simple lien bleu. Les champs viennent du
   * frontmatter et des étapes du Markdown, donc la page et le balisage ne peuvent pas diverger.
   */
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recette.titre,
    description: recette.description,
    datePublished: recette.publiee,
    author: { '@type': 'Organization', name: SITE_NAME },
    recipeCategory: recette.categorie,
    recipeCuisine: 'Française',
    prepTime: dureeISO(recette.preparation),
    cookTime: dureeISO(recette.cuisson),
    totalTime: dureeISO(total),
    recipeYield: `${recette.portions} portion${recette.portions > 1 ? 's' : ''}`,
    recipeIngredient: recette.ingredients,
    recipeInstructions: recette.etapes.map((texte, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: texte,
    })),
    nutrition: {
      '@type': 'NutritionInformation',
      servingSize: '1 portion',
      calories: `${recette.kcal} kcal`,
      proteinContent: `${recette.proteines} g`,
    },
  };

  return (
    <main className="mx-auto w-full max-w-[760px] px-4 pt-8 pb-16 sm:px-6">
      {/* `<` échappé : `JSON.stringify` ne protège pas d'une injection de balise via le contenu. */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: seule façon d'émettre du JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <nav aria-label="Fil d’Ariane" className="mb-6 text-small text-muted2">
        <Link href="/recettes" className="text-primary-ink">
          Recettes
        </Link>
        <span aria-hidden> · </span>
        <span>{recette.categorie}</span>
      </nav>

      <article>
        <h1 className="mb-3 font-display text-h1 font-semibold leading-[1.15] tracking-[-.015em]">
          {recette.titre}
        </h1>
        <p className="mb-6 text-body leading-[1.6] text-muted text-pretty">{recette.description}</p>

        {/* Repères en une seule ligne défilante plutôt qu'en grille de quatre pavés : sur un
            téléphone, la grille poussait les ingrédients sous la ligne de flottaison. */}
        <dl className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {[
            { t: 'Préparation', v: `${recette.preparation} min` },
            { t: 'Cuisson', v: `${recette.cuisson} min` },
            { t: 'En tout', v: `${total} min` },
            { t: 'Par portion', v: `${recette.kcal} kcal · ${recette.proteines} g de protéines` },
          ].map((item) => (
            <div key={item.t} className="flex items-baseline gap-[6px]">
              <dt className="text-muted2">{item.t}</dt>
              <dd className="font-medium tabular-nums">{item.v}</dd>
            </div>
          ))}
        </dl>

        <div className="mb-5">
          <GarderEcranAllume />
        </div>

        {recette.introHtml ? (
          <div
            className="prose mb-5 max-w-none prose-p:text-muted prose-strong:text-ink prose-em:text-ink"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: contenu Markdown du dépôt, pas une saisie utilisateur
            dangerouslySetInnerHTML={{ __html: recette.introHtml }}
          />
        ) : null}

        <RecetteAtelier recette={recette} />

        {recette.suiteHtml ? (
          <div
            className="prose max-w-none prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink prose-p:text-muted prose-li:text-muted prose-strong:text-ink prose-a:text-primary-ink"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: contenu Markdown du dépôt, pas une saisie utilisateur
            dangerouslySetInnerHTML={{ __html: recette.suiteHtml }}
          />
        ) : null}
      </article>
    </main>
  );
}
