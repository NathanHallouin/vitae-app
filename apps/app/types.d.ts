/**
 * La référence aux types d'Expo, versionnée.
 *
 * Expo écrit un `expo-env.d.ts` identique au premier `expo start`, mais demande de ne pas le
 * versionner. Résultat : sur une machine de développement il est toujours là, et sur un dépôt
 * fraîchement cloné — donc en intégration continue — il manque. La vérification de types passait
 * ici et échouait là, sur deux erreurs sans rapport avec le code écrit : l'import de `global.css`
 * et les propriétés de style propres au web.
 *
 * Déclarer la référence nous-mêmes règle le problème sans avoir à versionner un fichier qu'Expo
 * réécrit. Celle de NativeWind, elle, vit dans `nativewind-env.d.ts`, que NativeWind engendre en
 * demandant explicitement qu'on le committe.
 */

/// <reference types="expo/types" />
