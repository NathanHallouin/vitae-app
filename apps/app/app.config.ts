import type { ExpoConfig } from 'expo/config';

/**
 * Configuration de l'application native.
 *
 * Deux choses méritent d'être dites, parce qu'elles se paient cher si on les découvre à la
 * soumission :
 *
 * — `version` est la version lisible par l'utilisateur, commune aux deux magasins. Les numéros de
 *   build, eux, sont gérés par EAS (`appVersionSource: 'remote'`), qui les incrémente à chaque
 *   envoi. Les tenir à la main garantit un rejet le jour où l'on oublie.
 * — Aucune permission n'est demandée, et c'est un choix d'architecture, pas un oubli : tout est
 *   calculé sur l'appareil, rien n'est envoyé nulle part. C'est ce qui permet de déclarer « aucune
 *   donnée collectée » chez Apple comme chez Google, la déclaration la plus simple à défendre.
 */

const VERSION = '1.0.0';
const BUNDLE = 'fr.metabolismedebase.app';

const config: ExpoConfig = {
  name: 'Métabolisme de base',
  slug: 'vitae-app',
  scheme: 'vitae',
  version: VERSION,
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  icon: './assets/icon.png',
  primaryColor: '#084684',
  // Le français est la seule langue de l'interface : l'annoncer évite qu'iOS ne présente la fiche
  // comme une application anglaise mal traduite.
  locales: {},
  assetBundlePatterns: ['**/*'],

  ios: {
    bundleIdentifier: BUNDLE,
    supportsTablet: true,
    // Rien à chiffrer, rien à transmettre : évite le questionnaire de conformité à chaque envoi.
    config: { usesNonExemptEncryption: false },
    infoPlist: {
      CFBundleDisplayName: 'Métabolisme',
      CFBundleLocalizations: ['fr'],
      CFBundleDevelopmentRegion: 'fr',
    },
  },

  android: {
    package: BUNDLE,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#084684',
    },
    // Liste vide et non absente : Expo n'ajoute alors aucune permission facultative.
    permissions: [],
    /**
     * Ce que les modules embarqués déclarent d'office, et dont l'application ne se sert pas.
     *
     * Il n'en reste que trois dans le manifeste assemblé. `INTERNET`, déclarée ici, pour ouvrir
     * les recettes du site de cuisine. Puis `POST_NOTIFICATIONS` et `RECEIVE_BOOT_COMPLETED`, que
     * `expo-notifications` apporte par son propre manifeste : la première est exigée par
     * Android 13 et au-delà pour afficher un rappel, la seconde pour que les rappels survivent à
     * un redémarrage du téléphone. Aucune n'est classée sensible par Google.
     *
     * Les autres se retirent, et ce n'est pas cosmétique : « Afficher par-dessus d'autres
     * applications » et l'accès au stockage sont des permissions sensibles qu'il faudrait
     * justifier auprès de Google, pour des fonctions que l'application n'a pas.
     *
     * `VIBRATE` est refusée sciemment, alors même que les notifications pourraient s'en servir :
     * quatorze vibrations par jour se désinstallent le jour même. Le rappel est une invitation,
     * pas une alarme.
     *
     * Les rappels sont des notifications *locales* : programmées sur l'appareil, sans jeton
     * d'envoi et sans serveur. La déclaration « aucune donnée collectée » reste donc exacte.
     */
    blockedPermissions: [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.VIBRATE',
    ],
  },

  plugins: [
    [
      'expo-router',
      {
        // La navigation ne fait aucun aller-retour réseau : les liens profonds pointent vers le
        // site, qui sert de version consultable sans installation.
        origin: 'https://metabolisme-de-base.fr',
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/splash-icon.png',
        imageWidth: 160,
        resizeMode: 'contain',
        backgroundColor: '#fbf7f2',
        dark: { backgroundColor: '#16120e' },
      },
    ],
    [
      'expo-notifications',
      {
        // L'icône de notification d'Android doit être monochrome sur fond transparent : le système
        // n'en garde que la silhouette. Le calque avant de l'icône adaptative remplit exactement
        // cette condition.
        icon: './assets/adaptive-icon.png',
        color: '#084684',
        // Ni son ni vibration : voir `blockedPermissions` ci-dessus.
        sounds: [],
      },
    ],
    'expo-font',
    'expo-web-browser',
  ],

  /**
   * Le site est produit par la même base de code, en pré-rendu.
   *
   * `output: 'static'` écrit un fichier HTML par route au moment de l'export — y compris une page
   * par recette, grâce au `generateStaticParams` de `app/recettes/[slug].tsx`. C'est ce qui permet
   * à un moteur de recherche de lire le contenu et les données structurées sans exécuter la
   * moindre ligne de JavaScript, comme le faisait la version Next.
   */
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/favicon.png',
    lang: 'fr',
    themeColor: '#084684',
    name: 'Métabolisme de base',
    shortName: 'Métabolisme',
    description:
      'Calculez ce que votre corps dépense au repos et dans la journée, votre IMC, et combien manger selon votre objectif. Sans compte à créer.',
  },

  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    eas: {
      // Renseigné par `eas init` au premier build ; laissé vide, EAS le remplit lui-même.
      projectId: process.env.EAS_PROJECT_ID,
    },
  },
};

export default config;
