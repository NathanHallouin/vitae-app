/**
 * Sortir et rentrer ses données, sur le web : un vrai fichier, dans les deux sens.
 *
 * C'est là que le navigateur fait mieux que le natif — un téléchargement va dans le dossier que
 * l'utilisateur connaît, et un sélecteur de fichier sait le retrouver. Rien de tout cela ne
 * demande de dépendance ni ne quitte l'appareil : le `Blob` est fabriqué en mémoire, et
 * `URL.createObjectURL` ne fait que lui donner une adresse locale.
 */

export async function exporter(contenu: string, nom: string): Promise<boolean> {
  const blob = new Blob([contenu], { type: 'application/json' });
  const adresse = URL.createObjectURL(blob);
  const lien = document.createElement('a');
  lien.href = adresse;
  lien.download = nom;
  lien.click();
  // Sans révocation, le blob reste en mémoire jusqu'à la fermeture de l'onglet.
  URL.revokeObjectURL(adresse);
  return true;
}

export const PEUT_OUVRIR_UN_FICHIER = true;

/**
 * Le sélecteur de fichier du navigateur, ramené à une promesse.
 *
 * L'`input` n'est jamais inséré dans le document : il n'a pas à être visible, et l'y laisser
 * traîner ferait un élément de formulaire orphelin dans un arbre géré par React.
 *
 * `cancel` n'est pas émis par tous les navigateurs ; sans lui, une promesse abandonnée resterait
 * en attente pour toujours, et l'écran garderait un état « en cours » qui ne finit jamais.
 */
export async function ouvrirUnFichier(): Promise<string | null> {
  return new Promise((resoudre) => {
    const champ = document.createElement('input');
    champ.type = 'file';
    champ.accept = 'application/json,.json';
    champ.addEventListener('change', async () => {
      const fichier = champ.files?.[0];
      resoudre(fichier ? await fichier.text() : null);
    });
    champ.addEventListener('cancel', () => resoudre(null));
    champ.click();
  });
}
