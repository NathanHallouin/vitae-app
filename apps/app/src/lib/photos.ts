/**
 * Les photos ne s'affichent pas encore en natif, et c'est une décision.
 *
 * Sur le web, elles sont servies depuis `public/photos/` : le navigateur choisit sa largeur et son
 * format, et ne télécharge que ce qu'il affiche. En natif il n'y a pas de serveur — l'application
 * fonctionne hors connexion, c'est sa promesse —, donc une photo doit être **embarquée dans le
 * paquet**. Soixante-deux photos, même réduites, pèsent plusieurs mégaoctets ajoutés au
 * téléchargement de l'application, pour des fiches qui se lisent déjà très bien sans.
 *
 * Ce qu'il faudrait pour l'ouvrir : `tools/build-photos.ts` écrit aussi une variante dans
 * `assets/photos/`, et engendre un module de `require()` statiques — Metro ne sait pas résoudre un
 * chemin calculé. Le manifeste et le composant, eux, n'auraient pas à changer.
 *
 * En attendant, `VisuelRecette` retombe sur l'illustration, qui n'est pas un pis-aller : c'est ce
 * que la fiche affiche aujourd'hui.
 */
export const PHOTOS_AFFICHABLES = false;
