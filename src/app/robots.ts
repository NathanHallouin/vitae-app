import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    // Plus aucune exclusion : les pages de résultats rendent désormais leurs explications côté
    // serveur, et seuls les chiffres personnels dépendent du navigateur.
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
