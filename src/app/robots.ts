import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Rien à indexer derrière : ces pages sont vides sans le profil du navigateur.
      disallow: ['/metabolisme', '/alimentation', '/poids', '/bouger'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
