import { Share } from 'react-native';

/**
 * Sortir ses données, en natif : la feuille de partage du système.
 *
 * Pas de `expo-file-system` ni de `expo-sharing` : ils ajouteraient deux modules natifs, donc un
 * `prebuild` et deux entrées de plus à justifier dans les fiches des magasins, pour un fichier de
 * quelques kilo-octets. `Share` est dans React Native, ne demande aucune permission, et laisse
 * l'utilisateur choisir où atterrir — ses notes, un courriel qu'il s'envoie, son nuage.
 *
 * Ce que cela coûte, et qu'il faut assumer : le contenu part comme texte, pas comme fichier joint.
 * Sur un historique de plusieurs années, certaines applications de destination le tronquent.
 */
export async function exporter(contenu: string, nom: string): Promise<boolean> {
  const resultat = await Share.share({ message: contenu, title: nom });
  return resultat.action !== Share.dismissedAction;
}

/**
 * Il n'y a pas de sélecteur de fichier sans module natif : l'import se fait par collage.
 *
 * L'écran le sait et propose un champ à coller. C'est moins direct qu'un sélecteur, mais cela
 * fonctionne partout et sans dépendance — et le geste « copier depuis mes notes, coller ici »
 * reste compréhensible.
 */
export const PEUT_OUVRIR_UN_FICHIER = false;

export async function ouvrirUnFichier(): Promise<string | null> {
  return null;
}
