import type { MetadataRoute } from 'next';
import { getAllRecipes } from '@/lib/content';
import { SITE_URL } from '@/lib/site';

/**
 * Sitemap généré à la compilation.
 *
 * Les pages de résultats y figurent : leurs explications sont rendues côté serveur, seuls les
 * chiffres dépendent du profil enregistré dans le navigateur.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recettes = await getAllRecipes();

  return [
    { url: SITE_URL, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/recettes`, changeFrequency: 'weekly', priority: 0.8 },
    ...['metabolisme', 'alimentation', 'poids', 'bouger'].map((r) => ({
      url: `${SITE_URL}/${r}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/profil`, changeFrequency: 'yearly', priority: 0.5 },
    ...recettes.map((r) => ({
      url: `${SITE_URL}/recettes/${r.slug}`,
      lastModified: new Date(r.publiee),
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
  ];
}
