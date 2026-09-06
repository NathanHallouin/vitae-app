/**
 * L'écran de démarrage — sur le web, où il n'y en a pas.
 *
 * Deux raisons de ne rien faire ici plutôt que de tester la plateforme dans la racine :
 *
 * — un navigateur n'a pas d'écran de démarrage à retenir ; il affiche la page dès le premier octet
 *   de HTML, ce qui est précisément ce que le pré-rendu sert à obtenir ;
 * — ce module est exécuté par **Node** pendant l'export statique, où il n'y a ni écran, ni cycle
 *   de vie d'application à piloter. Appeler `expo-splash-screen` y échouerait pour rien.
 */

export function retenir(): void {}

export function relacher(): void {}
