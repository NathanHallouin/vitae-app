/**
 * Les balises de tête d'une route, sur le web uniquement.
 *
 * C'est la contrepartie du passage à une base de code unique : Next remplissait `<head>` depuis un
 * objet `metadata` exporté par chaque page, ce qui n'existe pas ici. Expo Router expose un `Head`
 * qui écrit dans le document — y compris pendant l'export statique, donc le HTML livré au robot
 * contient bien le titre, la description et le JSON-LD, sans exécution de JavaScript.
 *
 * Le composant ne rend rien en natif : `Head` y sert à tout autre chose (Handoff, recherche
 * système), et l'appeler avec des balises web n'aurait pas de sens.
 */

import { SITE_NAME } from '@vitae/core/site';
import Head from 'expo-router/head';
import { Platform } from 'react-native';

export default function Seo({
  title,
  description,
  canonical,
  jsonLd,
}: {
  title: string;
  description: string;
  /** URL absolue de la page */
  canonical: string;
  /** données structurées schema.org, sérialisées telles quelles */
  jsonLd?: Record<string, unknown>;
}) {
  if (Platform.OS !== 'web') return null;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="fr_FR" />
      {jsonLd ? (
        // Le contenu passe par les enfants et non par `dangerouslySetInnerHTML` : la bibliothèque
        // qui alimente `Head` lit le texte du script, pas la propriété de React.
        //
        // `<` est échappé, parce que `JSON.stringify` ne protège pas d'une injection de balise
        // par le contenu — un titre de recette contenant `</script>` refermerait le bloc.
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      ) : null}
    </Head>
  );
}
