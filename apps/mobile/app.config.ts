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
    edgeToEdgeEnabled: true,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#084684',
    },
    // Liste vide et non absente : Expo n'ajoute alors aucune permission facultative.
    permissions: [],
    blockedPermissions: ['android.permission.RECORD_AUDIO', 'android.permission.CAMERA'],
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
    'expo-font',
    'expo-web-browser',
  ],

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
