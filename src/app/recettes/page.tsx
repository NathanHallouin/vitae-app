import type { Metadata } from 'next';
import Link from 'next/link';
import { dureeTotale, getAllRecipes } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Recettes équilibrées, avec leurs calories et leurs protéines',
  description:
    'Des recettes simples, avec le nombre de calories et de protéines par portion. De quoi remplir vos repères de la journée sans peser chaque aliment.',
  alternates: { canonical: `${SITE_URL}/recettes` },
};

/**
 * Index des recettes.
 *
 * Server Component sans aucun JS client : c'est une liste de liens et de texte, exactement ce
 * qu'un moteur doit pouvoir lire sans exécuter quoi que ce soit.
 */
export default async function RecettesPage() {
  const recettes = await getAllRecipes();

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-8 pb-16 sm:px-6">
      <h1 className="mb-[6px] font-display text-h1 font-semibold leading-[1.15] tracking-[-.015em]">
        Recettes
      </h1>
      <p className="mb-8 max-w-[62ch] text-body leading-[1.6] text-muted text-pretty">
        Des recettes simples, avec leurs calories et leurs protéines par portion, pour remplir les
        repères de votre journée sans avoir à peser chaque aliment.
      </p>

      {recettes.length === 0 ? (
        <p className="text-base text-muted">Aucune recette pour le moment.</p>
      ) : (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {recettes.map((r) => (
            <li key={r.slug} className="card p-5">
              <h2 className="mb-1 text-option font-medium">
                <Link href={`/recettes/${r.slug}`} className="text-primary-ink">
                  {r.titre}
                </Link>
              </h2>
              <p className="mb-3 text-small leading-[1.5] text-muted text-pretty">
                {r.description}
              </p>
              <p className="text-caption text-muted2 tabular-nums">
                {dureeTotale(r)} min · {r.kcal} kcal · {r.proteines} g de protéines par portion
              </p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
