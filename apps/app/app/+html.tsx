import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';

/**
 * Le document HTML qui enveloppe chaque page exportée.
 *
 * Il n'existe que sur le web et n'est rendu qu'à la compilation : rien ici n'est réévalué dans le
 * navigateur. C'est l'équivalent du `RootLayout` de Next, réduit à ce que React Native ne sait pas
 * exprimer — la langue du document, la fenêtre d'affichage, et le fond de page.
 */
export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        {/* `viewport-fit=cover` fait passer le contenu sous l'encoche, que les marges de sécurité
            dégagent ensuite ; sans lui, on garderait deux bandes blanches sur iPhone. */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#084684" />

        {/* Réinitialise le défilement du corps de page : sans cela, les `ScrollView` de
            react-native-web défilent à l'intérieur d'une page qui ne défile pas. */}
        <ScrollViewStyleReset />

        {/* Le fond est posé ici, hors de React : entre le premier octet de HTML et l'hydratation,
            le navigateur peindrait sinon du blanc — ce qui saute aux yeux en thème sombre. */}
        <style dangerouslySetInnerHTML={{ __html: FOND }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const FOND = `
body { background-color: #fbf7f2; }
@media (prefers-color-scheme: dark) {
  body { background-color: #16120e; }
}
`;
