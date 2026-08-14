/**
 * Ce qu'il faut pour qu'un groupe d'options se parcoure aux flèches.
 *
 * Le groupe connaît ses membres et leur ordre ; le bouton, lui, ne connaît que lui-même. C'est donc
 * ici que « le suivant » prend un sens, et le calcul boucle : après le dernier vient le premier,
 * comme le fait un groupe de boutons radio natif.
 *
 * Sans effet sur mobile, où `OptionButton` ignore la propriété qu'on lui passe.
 */
export function useGroupeRadio<T>(
  valeurs: readonly T[],
  courante: T,
  choisir: (valeur: T) => void,
): (direction: -1 | 1 | 'premier' | 'dernier') => void {
  return (direction) => {
    if (valeurs.length === 0) return;
    if (direction === 'premier') return choisir(valeurs[0]);
    if (direction === 'dernier') return choisir(valeurs[valeurs.length - 1]);

    const index = valeurs.indexOf(courante);
    // Sélection hors liste — cas d'un groupe encore vierge : on entre par le premier membre.
    if (index === -1) return choisir(valeurs[0]);
    choisir(valeurs[(index + direction + valeurs.length) % valeurs.length]);
  };
}
