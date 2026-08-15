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

        {/* Le site est installable : rien n'y est chargé depuis un serveur, il n'a donc aucune
            raison de rester un onglet. Le manifeste et l'icône sont engendrés par
            `tools/build-seo.ts` et `tools/build-icons.ts` depuis `app.config.ts`.

            iOS ignore le manifeste : c'est `apple-touch-icon` qu'il lit quand on ajoute la page à
            l'écran d'accueil, et sans elle Safari y pose une capture de la page. */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Le service worker, engendré après l'export par `tools/build-sw.ts`.
            Enregistré après `load` : le faire plus tôt met sa propre installation en concurrence
            avec le chargement de la page, et c'est la page qui doit gagner. */}
        <script dangerouslySetInnerHTML={{ __html: SERVICE_WORKER }} />

        {/* Réinitialise le défilement du corps de page : sans cela, les `ScrollView` de
            react-native-web défilent à l'intérieur d'une page qui ne défile pas. */}
        <ScrollViewStyleReset />

        {/* La coupe qui porte le titre de chaque page, donc la première chose que l'œil lit et,
            le plus souvent, le plus grand élément de l'écran. Préchargée, elle part dès l'analyse
            du HTML — en parallèle du paquet JavaScript, et non après son exécution. Mesuré : elle
            est prête avant même que le paquet ait fini d'arriver.

            Elle seule. Précharger une coupe qui ne s'affiche pas la fait télécharger pour rien, et
            les Inter pèsent chacune 335 Ko contre 71 ici. Elles se chargent à la découverte du
            texte qui les emploie, ce qui est le bon moment.

            `crossOrigin` est exigé même pour une police du même domaine — elles sont toujours
            demandées en mode CORS, et sans lui le navigateur la téléchargerait deux fois. */}
        <link
          rel="preload"
          as="font"
          type="font/ttf"
          href="/polices/Fraunces_600SemiBold.ttf"
          crossOrigin="anonymous"
        />

        {/* Le fond est posé ici, hors de React : entre le premier octet de HTML et l'hydratation,
            le navigateur peindrait sinon du blanc — ce qui saute aux yeux en thème sombre. */}
        <style dangerouslySetInnerHTML={{ __html: `${POLICES}${FOND}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

/**
 * Les polices, déclarées dans le document plutôt que chargées par JavaScript.
 *
 * C'est la contrepartie web de `src/lib/polices.ts` : en natif `expo-font` les charge au démarrage,
 * ici le navigateur les demande en analysant le HTML — donc en parallèle du paquet, et non après
 * lui. Les fichiers sont recopiés dans `public/polices/` par `tools/build-fonts.ts` ; ajouter une
 * coupe suppose de la déclarer aux trois endroits, celui-ci compris.
 *
 * Une famille par graisse, et `font-weight: 400` partout : c'est la règle de `tailwind.config.js`,
 * et elle vaut ici aussi. Déclarer une graisse que le style ne demande jamais inviterait le
 * navigateur à en synthétiser une, exactement ce que ce découpage cherche à éviter.
 *
 * `font-display: swap` : le texte s'affiche tout de suite en police système et se remplace à
 * l'arrivée. L'alternative — un texte invisible pendant le chargement — est bien pire sur une
 * page dont tout l'intérêt est d'être lue.
 *
 * **`Inter_400Regular` est déclarée mais n'est employée nulle part**, et ce n'est pas voulu : le
 * texte courant n'a aucune classe `font-*`, il retombe donc sur la pile système du navigateur
 * (`-apple-system, Segoe UI, Roboto…`). Seules les coupes nommées explicitement s'affichent —
 * medium, semibold, bold et la Fraunces. Vérifié dans le navigateur : tous les paragraphes longs
 * sortent en `-apple-system`. La déclaration reste ici parce qu'elle ne coûte rien tant que rien
 * ne l'emploie — un `@font-face` inutilisé ne déclenche aucun téléchargement — et qu'elle sera
 * juste le jour où le corps de texte recevra sa famille.
 */
const POLICES = [
  'Fraunces_600SemiBold',
  'Inter_400Regular',
  'Inter_500Medium',
  'Inter_600SemiBold',
  'Inter_700Bold',
]
  .map(
    (coupe) => `
@font-face {
  font-family: '${coupe}';
  src: url('/polices/${coupe}.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}`,
  )
  .join('');

const FOND = `
body { background-color: #fbf7f2; }
@media (prefers-color-scheme: dark) {
  body { background-color: #16120e; }
}
`;

/**
 * L'enregistrement du service worker.
 *
 * `sw.js` n'existe qu'après l'export : ce script n'y fait donc référence que par son adresse, et
 * un échec ne coûte rien — l'application fonctionne sans, le hors-ligne en moins.
 */
const SERVICE_WORKER = `
if ('serviceWorker' in navigator) {
  addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
`;
