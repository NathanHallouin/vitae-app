/**
 * Mise à l'échelle des quantités d'une recette.
 *
 * Cuisiner pour deux quand la recette en annonce quatre demande de diviser neuf lignes de tête,
 * les mains occupées. Le calcul se fait donc ici, et l'affichage suit le sélecteur de portions.
 *
 * Le principe : seul le nombre en tête de ligne est mis à l'échelle. « Sel, poivre » n'a pas de
 * quantité et reste tel quel — c'est le comportement souhaité, on ne double pas l'assaisonnement
 * mécaniquement.
 */

/** Fractions courantes en cuisine, plus lisibles que « 0,5 courgette ». */
const FRACTIONS: [number, string][] = [
  [0.25, '¼'],
  [0.33, '⅓'],
  [0.5, '½'],
  [0.66, '⅔'],
  [0.75, '¾'],
];

/** Nombre décimal en écriture de cuisine : `1.5` → « 1 ½ », `0.5` → « ½ », `2` → « 2 ». */
export function formatQuantite(n: number): string {
  if (n <= 0) return '0';

  // L'arrondi passe avant les fractions : à cette échelle on parle de grammes ou de millilitres,
  // et « 337 ½ g de poulet » n'a aucun sens devant une balance.
  if (n >= 10) return String(Math.round(n));

  const entier = Math.floor(n);
  const reste = n - entier;

  // Tolérance large : 0,66 et 0,67 désignent tous deux deux tiers.
  const fraction = FRACTIONS.find(([valeur]) => Math.abs(reste - valeur) < 0.04);
  if (fraction) return entier > 0 ? `${entier} ${fraction[1]}` : fraction[1];

  const arrondi = Math.round(n * 10) / 10;
  return String(arrondi).replace('.', ',');
}

/**
 * Unités et abréviations : invariables, elles ne prennent jamais de marque de pluriel.
 * « 300 g », jamais « 300 gs ».
 */
const UNITES = new Set([
  'g',
  'kg',
  'mg',
  'cl',
  'ml',
  'dl',
  'l',
  'cm',
  'mm',
  'cs',
  'cc',
  'pincée',
  'pincées',
  'sachet',
  'sachets',
  'boîte',
  'boîtes',
  'brin',
  'brins',
]);

/**
 * Mots dont le « s » final fait partie du mot : les singulariser donnerait « 1 anana ».
 * Liste courte et assumée comme incomplète — mieux vaut laisser un mot au pluriel que l'amputer.
 */
const INVARIABLES = new Set([
  'ananas',
  'anis',
  'cassis',
  'couscous',
  'jus',
  'maïs',
  'radis',
  'brebis',
  'os',
  'riz',
  'panais',
  'cresson',
  'pis',
]);

/**
 * Accorde le mot qui suit la quantité.
 *
 * En français le singulier s'emploie sous 2 : « 1,5 courgette », mais « 2 courgettes ». Sans cet
 * accord, diviser une recette par deux donne « 1 carottes », ce qui saute aux yeux sur une page
 * dont tout le reste est soigné.
 */
function accorder(mot: string, quantite: number): string {
  const nu = mot.replace(/[.,;:]$/, '');
  const ponctuation = mot.slice(nu.length);
  const bas = nu.toLowerCase();

  if (UNITES.has(bas) || INVARIABLES.has(bas) || nu.length < 3) return mot;

  if (quantite < 2) {
    return (bas.endsWith('s') ? nu.slice(0, -1) : nu) + ponctuation;
  }
  return (/[sxz]$/.test(bas) ? nu : `${nu}s`) + ponctuation;
}

/**
 * Applique un facteur à la quantité en tête de ligne.
 *
 * Renvoie la ligne inchangée si elle ne commence pas par un nombre, ou si le facteur vaut 1 :
 * inutile de reformater « 20 cl » en « 20 cl » et de risquer d'y perdre une notation.
 */
export function scaleIngredient(ligne: string, facteur: number): string {
  if (facteur === 1) return ligne;

  const m = ligne.match(/^(\d+(?:[.,]\d+)?)(\s*)(.*)$/);
  if (!m) return ligne;

  const quantite = Number.parseFloat(m[1].replace(',', '.'));
  if (!Number.isFinite(quantite)) return ligne;

  const echelle = quantite * facteur;
  const reste = m[3];
  const espace = m[2] || ' ';

  // Seul le premier mot porte l'accord : « 2 cuillères à soupe » → « 1 cuillère à soupe ».
  const coupe = reste.match(/^(\S+)([\s\S]*)$/);
  const suite = coupe ? accorder(coupe[1], echelle) + coupe[2] : reste;

  return `${formatQuantite(echelle)}${espace}${suite}`;
}
